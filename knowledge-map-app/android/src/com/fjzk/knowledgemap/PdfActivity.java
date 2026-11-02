package com.fjzk.knowledgemap;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.graphics.pdf.PdfRenderer;
import android.os.Bundle;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.Looper;
import android.os.ParcelFileDescriptor;
import android.text.InputType;
import android.text.TextUtils;
import android.util.Log;
import android.util.TypedValue;
import android.view.GestureDetector;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.ScaleGestureDetector;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

/**
 * 电子教材阅读器：系统自带的 PdfRenderer（不需要第三方库、不联网）。
 * 单页显示；左右滑动或点屏幕左右两侧翻页；点中间显示/隐藏工具栏；点页码跳转；双指缩放、双击放大/还原，放大后拖动查看。
 * 每本书记住最后阅读页（SharedPreferences km_textbooks 的 page_{id}）。横竖屏都可用（manifest 里 configChanges，不重建，按新尺寸重新排版）。
 * 渲染在后台线程，PdfRenderer 同一时间只开一页。
 * 点读（TbAudio）：平台给这本书做了点读热区时，工具栏出现「点读」；打开后页面上框出能点的句子，点一下放录音（第一次放要联网、
 * 用平台登录下载，下过的离线也能放），也可以一次下完整本书的录音。点读开关记在 km_textbooks 的 dd_on。
 */
public class PdfActivity extends Activity {
    static final String EXTRA_ID = "id", EXTRA_TITLE = "title";
    static final String TAG = "KMPdf";
    static final float MAX_ZOOM = 5f;
    static final long MAX_PIXELS = 6_000_000L;   // 一张渲染图最多 600 万像素（约 24MB），放得再大就拉伸显示

    String id;
    ParcelFileDescriptor pfd;
    PdfRenderer renderer;
    HandlerThread worker;
    Handler bg;
    final Handler ui = new Handler(Looper.getMainLooper());
    int count, page;
    PageView view;
    LinearLayout bar;
    TextView label;
    SharedPreferences prefs;
    List<TbAudio.Zone> zones;     // 点读热区（null = 没有或还没取到）
    boolean ddOn;
    Button ddBtn;
    MediaPlayer player;
    TbAudio.Zone playing;         // 正在放（或正在下载准备放）的那块
    int playSeq;                  // 点得快时只放最后点的那段
    volatile boolean bulkStop;
    volatile int bulkDone = -1, bulkTotal;   // 全部下载的进度（-1 = 没在下）

    int dp(float v) { return (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, getResources().getDisplayMetrics()); }

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        id = getIntent().getStringExtra(EXTRA_ID);
        String title = getIntent().getStringExtra(EXTRA_TITLE);
        prefs = getSharedPreferences(Textbooks.PREF, MODE_PRIVATE);
        File f = TbAuth.validId(id) ? Textbooks.file(this, id) : null;
        if (f == null || !f.isFile()) { Toast.makeText(this, "找不到这本教材，请重新下载", Toast.LENGTH_LONG).show(); finish(); return; }
        try {
            pfd = ParcelFileDescriptor.open(f, ParcelFileDescriptor.MODE_READ_ONLY);
            renderer = new PdfRenderer(pfd);
            count = renderer.getPageCount();
        } catch (Exception e) {
            Log.w(TAG, "open " + e.getClass().getSimpleName());
            Toast.makeText(this, "这本教材打不开（文件可能损坏），请删除后重新下载", Toast.LENGTH_LONG).show();
            closeRenderer();
            finish();
            return;
        }
        if (count <= 0) { Toast.makeText(this, "这本教材没有页面", Toast.LENGTH_LONG).show(); closeRenderer(); finish(); return; }
        prefs.edit().putInt("pages_" + id, count).apply();
        if (state != null) page = state.getInt("page", 0);
        else page = prefs.getInt("page_" + id, 0);
        page = Math.max(0, Math.min(count - 1, page));
        worker = new HandlerThread("km-pdf");
        worker.start();
        bg = new Handler(worker.getLooper());

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(0xFF2B2C30);
        view = new PageView(this);
        root.addView(view, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        bar = new LinearLayout(this);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        bar.setGravity(Gravity.CENTER_VERTICAL);
        bar.setBackgroundColor(0xEE1F2328);
        bar.setPadding(dp(4), dp(4), dp(4), dp(4));
        bar.addView(button("← 返回", new View.OnClickListener() { public void onClick(View v) { finish(); } }));
        TextView t = new TextView(this);
        t.setText(title == null || title.isEmpty() ? prefs.getString("title_" + id, "电子教材") : title);
        t.setTextColor(Color.WHITE);
        t.setTextSize(15);
        t.setSingleLine(true);
        t.setEllipsize(TextUtils.TruncateAt.MIDDLE);
        t.setPadding(dp(8), 0, dp(8), 0);
        bar.addView(t, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        ddBtn = button("点读", new View.OnClickListener() { public void onClick(View v) { ddMenu(); } });
        ddBtn.setVisibility(View.GONE);
        bar.addView(ddBtn);
        bar.addView(button("‹ 上一页", new View.OnClickListener() { public void onClick(View v) { go(page - 1); } }));
        label = button("", new View.OnClickListener() { public void onClick(View v) { askPage(); } });
        bar.addView(label);
        bar.addView(button("下一页 ›", new View.OnClickListener() { public void onClick(View v) { go(page + 1); } }));
        root.addView(bar, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.TOP));
        setContentView(root);
        showLabel();
        view.load(page);
        loadZones();
    }

    // ---------------- 点读

    void loadZones() {
        final String bid = id;
        final Context app = getApplicationContext();
        new Thread(new Runnable() {
            public void run() {
                final List<TbAudio.Zone> z = TbAudio.load(app, bid);
                ui.post(new Runnable() {
                    public void run() {
                        if (isFinishing() || z == null || z.isEmpty()) return;
                        zones = z;
                        ddOn = prefs.getBoolean("dd_on", true);
                        ddBtn.setVisibility(View.VISIBLE);
                        showDd();
                        view.invalidate();
                    }
                });
            }
        }, "km-tb-zones").start();
    }

    void showDd() {
        if (bulkDone >= 0) ddBtn.setText("录音 " + bulkDone + "/" + bulkTotal);
        else ddBtn.setText(ddOn ? "点读：开" : "点读：关");
    }

    void ddMenu() {
        if (zones == null) return;
        final int got = TbAudio.cached(this, id, zones), total = zones.size();
        List<String> items = new ArrayList<>();
        items.add(ddOn ? "关闭点读" : "打开点读（框出能点的句子，点一下放录音）");
        if (bulkDone >= 0) items.add("停止下载录音（已下 " + bulkDone + " / " + bulkTotal + " 段）");
        else if (got < total) items.add("下载本书全部录音，以后不联网也能点读（已下 " + got + " / " + total + " 段）");
        new AlertDialog.Builder(this).setTitle("点读（本书 " + total + " 段录音）")
            .setItems(items.toArray(new String[0]), new DialogInterface.OnClickListener() {
                public void onClick(DialogInterface d, int w) {
                    if (w == 0) {
                        ddOn = !ddOn;
                        prefs.edit().putBoolean("dd_on", ddOn).apply();
                        if (!ddOn) stopAudio();
                        showDd();
                        view.invalidate();
                    } else if (bulkDone >= 0) bulkStop = true;
                    else downloadAll();
                }
            }).setNegativeButton("关闭", null).show();
    }

    /** 点读区里点了一下：没下过就先下载，再放 */
    void play(final TbAudio.Zone z) {
        stopAudio();
        playing = z;
        final int seq = ++playSeq;
        view.invalidate();
        final String bid = id;
        final Context app = getApplicationContext();
        new Thread(new Runnable() {
            public void run() {
                final int r = TbAudio.fetchAudio(app, bid, z);
                ui.post(new Runnable() {
                    public void run() {
                        if (seq != playSeq || isFinishing()) return;
                        if (r != 0) { playing = null; view.invalidate(); audioError(r); return; }
                        startAudio(TbAudio.audioFile(app, bid, z), seq);
                    }
                });
            }
        }, "km-tb-audio").start();
    }

    void startAudio(File f, final int seq) {
        MediaPlayer m = new MediaPlayer();
        try {
            m.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build());
            m.setDataSource(f.getPath());
            m.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
                public void onCompletion(MediaPlayer mp) { if (seq == playSeq) stopAudio(); }
            });
            m.prepare();
            m.start();
            player = m;
        } catch (Exception e) {
            Log.w(TAG, "play " + e.getClass().getSimpleName());
            m.release();
            f.delete();                      // 文件坏了，下次点重新下载
            playing = null;
            view.invalidate();
            Toast.makeText(this, "这段录音放不出来，请再点一次", Toast.LENGTH_SHORT).show();
        }
    }

    void stopAudio() {
        if (player != null) { try { player.stop(); } catch (Exception ignored) { } player.release(); player = null; }
        if (playing != null) { playing = null; view.invalidate(); }
    }

    void audioError(int r) {
        String msg;
        if (r == -3) msg = "第一次点读要下载录音：请先在「电子教材」页登录国家中小学智慧教育平台";
        else if (r == 401) { Textbooks.get(this).markExpired(); msg = "平台登录已失效，请回「电子教材」页重新登录"; }
        else if (r == 400 || r == 403) msg = "平台拒绝下载录音（" + r + "），请回「电子教材」页退出登录后重新登录";
        else if (r == -1) msg = "录音下载失败，请检查网络（下载过的录音不联网也能放）";
        else msg = "录音下载失败（" + r + "），请稍后再试";
        Toast.makeText(this, msg, Toast.LENGTH_LONG).show();
    }

    /** 一次下完整本书的录音：按顺序下，出错就停下提示 */
    void downloadAll() {
        if (!Textbooks.loggedIn(this)) { audioError(-3); return; }
        if (Textbooks.dir(this).getUsableSpace() < 2 * Textbooks.RESERVE) {
            Toast.makeText(this, "存储空间不够（一本书的录音大约几十 MB），请先删除一些教材", Toast.LENGTH_LONG).show();
            return;
        }
        final List<TbAudio.Zone> list = zones;
        final String bid = id;
        final Context app = getApplicationContext();
        bulkStop = false;
        bulkTotal = list.size();
        bulkDone = 0;
        showDd();
        new Thread(new Runnable() {
            public void run() {
                int r = 0, done = 0;
                for (TbAudio.Zone z : list) {
                    if (bulkStop) break;
                    r = TbAudio.fetchAudio(app, bid, z);
                    if (r != 0) break;
                    bulkDone = ++done;
                    if (done % 5 == 0) ui.post(new Runnable() { public void run() { showDd(); } });
                }
                final int res = r, n = done;
                ui.post(new Runnable() {
                    public void run() {
                        bulkDone = -1;
                        if (isFinishing()) return;
                        showDd();
                        if (res != 0) audioError(res);
                        else if (n == list.size()) Toast.makeText(PdfActivity.this, "本书录音都下好了，不联网也能点读", Toast.LENGTH_LONG).show();
                        else Toast.makeText(PdfActivity.this, "已停止，下好了 " + n + " 段", Toast.LENGTH_SHORT).show();
                    }
                });
            }
        }, "km-tb-audio-all").start();
    }

    /** 点在哪个点读区里（屏幕坐标）；没开点读或没点中返回 null */
    TbAudio.Zone zoneAt(float sx, float sy) {
        if (!ddOn || zones == null || view.pw <= 0) return null;
        float fx = (sx - view.tx) / view.dispW(), fy = (sy - view.ty) / view.dispH();
        TbAudio.Zone best = null;
        for (TbAudio.Zone z : zones) {
            // 重叠时取小的那块（大块一般是整幅图、整段对话）
            if (z.page == page && z.contains(fx, fy) && (best == null || z.w * z.h < best.w * best.h)) best = z;
        }
        return best;
    }

    Button button(String text, View.OnClickListener l) {
        Button b = new Button(this);
        b.setText(text);
        b.setAllCaps(false);
        b.setTextSize(15);
        b.setTextColor(Color.WHITE);
        b.setBackgroundColor(0x00000000);
        b.setMinWidth(dp(56));
        b.setOnClickListener(l);
        return b;
    }

    void showLabel() { label.setText((page + 1) + " / " + count); }

    void go(int p) {
        if (p < 0 || p >= count) {
            Toast.makeText(this, p < 0 ? "已经是第一页" : "已经是最后一页", Toast.LENGTH_SHORT).show();
            return;
        }
        if (p == page) return;
        stopAudio();
        page = p;
        showLabel();
        prefs.edit().putInt("page_" + id, page).apply();
        view.load(page);
    }

    void askPage() {
        final EditText in = new EditText(this);
        in.setInputType(InputType.TYPE_CLASS_NUMBER);
        in.setHint("1 - " + count);
        in.setText(String.valueOf(page + 1));
        in.selectAll();
        new AlertDialog.Builder(this).setTitle("跳到第几页（共 " + count + " 页）").setView(in)
            .setPositiveButton("跳转", new DialogInterface.OnClickListener() {
                public void onClick(DialogInterface d, int w) {
                    try { go(Integer.parseInt(in.getText().toString().trim()) - 1); }
                    catch (NumberFormatException e) { Toast.makeText(PdfActivity.this, "请输入页码", Toast.LENGTH_SHORT).show(); }
                }
            })
            .setNegativeButton("取消", null).show();
        in.requestFocus();
    }

    void toggleBar() { bar.setVisibility(bar.getVisibility() == View.VISIBLE ? View.GONE : View.VISIBLE); }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        out.putInt("page", page);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (prefs != null && id != null) prefs.edit().putInt("page_" + id, page).apply();
    }

    void closeRenderer() {
        try { if (renderer != null) renderer.close(); } catch (Exception ignored) { }
        try { if (pfd != null) pfd.close(); } catch (Exception ignored) { }
        renderer = null; pfd = null;
    }

    @Override
    protected void onDestroy() {
        if (bg != null) {
            bg.removeCallbacksAndMessages(null);
            bg.post(new Runnable() { public void run() { closeRenderer(); } });   // 在渲染线程上关，避免和正在进行的渲染撞上
            worker.quitSafely();
        } else closeRenderer();
        bulkStop = true;
        playSeq++;
        if (player != null) { player.release(); player = null; }
        if (view != null) view.drop();
        super.onDestroy();
    }

    /** 渲染一页（后台线程）。返回 null 表示失败或已关闭 */
    Bitmap render(int p, float scale, float[] sizeOut) {
        PdfRenderer r = renderer;
        if (r == null) return null;
        PdfRenderer.Page pg = null;
        try {
            pg = r.openPage(p);
            float pw = pg.getWidth(), ph = pg.getHeight();
            sizeOut[0] = pw; sizeOut[1] = ph;
            if (scale <= 0) return null;
            float s = scale;
            if ((long) (pw * s) * (long) (ph * s) > MAX_PIXELS) s = (float) Math.sqrt(MAX_PIXELS / (pw * ph));
            int w = Math.max(1, Math.round(pw * s)), h = Math.max(1, Math.round(ph * s));
            Bitmap b = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
            b.eraseColor(Color.WHITE);
            pg.render(b, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY);
            return b;
        } catch (Throwable e) {
            Log.w(TAG, "render " + e.getClass().getSimpleName());
            return null;
        } finally { if (pg != null) try { pg.close(); } catch (Exception ignored) { } }
    }

    /** 单页视图：适应屏幕显示整页；zoom 是相对「适应屏幕」的倍数，tx/ty 是页面左上角在屏幕上的位置 */
    class PageView extends View {
        Bitmap bmp;
        int bmpPage = -1;
        float pw, ph;                 // 当前页的 PDF 尺寸（点）
        float zoom = 1f, tx, ty;
        int gen;                      // 渲染代号：页码或缩放变了，旧的渲染结果作废
        boolean loading;
        final Paint paint = new Paint(Paint.FILTER_BITMAP_FLAG | Paint.ANTI_ALIAS_FLAG);
        final Paint white = new Paint();
        final Paint text = new Paint(Paint.ANTI_ALIAS_FLAG);
        final Paint zoneLine = new Paint(Paint.ANTI_ALIAS_FLAG), zoneOn = new Paint(Paint.ANTI_ALIAS_FLAG);
        final RectF dst = new RectF(), zr = new RectF();
        final ScaleGestureDetector scaler;
        final GestureDetector gestures;
        boolean scaling;

        PageView(Context c) {
            super(c);
            white.setColor(Color.WHITE);
            zoneLine.setStyle(Paint.Style.STROKE);
            zoneLine.setStrokeWidth(dp(1.2f));
            zoneLine.setColor(0x992F80ED);
            zoneOn.setColor(0x55FFC107);
            text.setColor(0xFFBBBBBB);
            text.setTextSize(dp(16));
            text.setTextAlign(Paint.Align.CENTER);
            scaler = new ScaleGestureDetector(c, new ScaleGestureDetector.SimpleOnScaleGestureListener() {
                public boolean onScaleBegin(ScaleGestureDetector d) { scaling = true; return true; }
                public boolean onScale(ScaleGestureDetector d) { zoomTo(zoom * d.getScaleFactor(), d.getFocusX(), d.getFocusY()); return true; }
                public void onScaleEnd(ScaleGestureDetector d) { scaling = false; refine(); }
            });
            gestures = new GestureDetector(c, new GestureDetector.SimpleOnGestureListener() {
                public boolean onDown(MotionEvent e) { return true; }
                public boolean onSingleTapConfirmed(MotionEvent e) {
                    TbAudio.Zone z = zoneAt(e.getX(), e.getY());
                    if (z != null) { play(z); return true; }
                    float w = getWidth();
                    if (zoom <= 1.01f && e.getX() < w * 0.2f) go(page - 1);
                    else if (zoom <= 1.01f && e.getX() > w * 0.8f) go(page + 1);
                    else toggleBar();
                    return true;
                }
                public boolean onDoubleTap(MotionEvent e) {
                    if (zoom > 1.05f) { zoom = 1f; layoutPage(); refine(); }
                    else { zoomTo(2.5f, e.getX(), e.getY()); refine(); }
                    return true;
                }
                public boolean onScroll(MotionEvent a, MotionEvent b, float dx, float dy) {
                    if (zoom <= 1.01f || scaling) return false;
                    tx -= dx; ty -= dy;
                    clamp();
                    invalidate();
                    return true;
                }
                public boolean onFling(MotionEvent a, MotionEvent b, float vx, float vy) {
                    if (scaling || Math.abs(vx) < 600 || Math.abs(vx) < Math.abs(vy) * 1.2f) return false;
                    if (zoom > 1.01f) {
                        // 放大时：已经拖到页面边上再往外甩才翻页
                        float dw = dispW();
                        boolean atLeft = tx >= -1, atRight = tx + dw <= getWidth() + 1;
                        if (vx > 0 && atLeft) go(page - 1);
                        else if (vx < 0 && atRight) go(page + 1);
                        return true;
                    }
                    go(vx < 0 ? page + 1 : page - 1);
                    return true;
                }
            });
        }

        float fit() {
            if (pw <= 0 || ph <= 0 || getWidth() == 0) return 1f;
            return Math.min(getWidth() / pw, getHeight() / ph);
        }
        float scale() { return fit() * zoom; }
        float dispW() { return pw * scale(); }
        float dispH() { return ph * scale(); }

        void layoutPage() {
            tx = (getWidth() - dispW()) / 2f;
            ty = (getHeight() - dispH()) / 2f;
            invalidate();
        }

        void clamp() {
            float dw = dispW(), dh = dispH(), w = getWidth(), h = getHeight();
            tx = dw <= w ? (w - dw) / 2f : Math.max(w - dw, Math.min(0, tx));
            ty = dh <= h ? (h - dh) / 2f : Math.max(h - dh, Math.min(0, ty));
        }

        void zoomTo(float z, float fx, float fy) {
            z = Math.max(1f, Math.min(MAX_ZOOM, z));
            float old = scale();
            zoom = z;
            float k = scale() / old;
            tx = fx - (fx - tx) * k;
            ty = fy - (fy - ty) * k;
            clamp();
            invalidate();
        }

        /** 换页：先量页面尺寸，再按适应屏幕的清晰度渲染 */
        void load(final int p) {
            zoom = 1f;
            loading = true;
            final int g = ++gen;
            final float vw = getWidth(), vh = getHeight();
            invalidate();
            bg.post(new Runnable() {
                public void run() {
                    float[] sz = new float[2];
                    render(p, 0, sz);                                     // 只量尺寸
                    float s = sz[0] > 0 && vw > 0 ? Math.min(vw / sz[0], vh / sz[1]) : 1.5f;
                    final Bitmap b = render(p, s, sz);
                    final float w0 = sz[0], h0 = sz[1];
                    ui.post(new Runnable() {
                        public void run() {
                            if (g != gen) { if (b != null) b.recycle(); return; }
                            loading = false;
                            pw = w0; ph = h0;
                            swap(b, p);
                            layoutPage();
                            if (b == null) Toast.makeText(PdfActivity.this, "这一页显示不出来", Toast.LENGTH_SHORT).show();
                            else if (getWidth() > 0 && Math.abs(b.getWidth() - pw * fit()) > 2) refine();   // 量尺寸时视图还没排好
                        }
                    });
                }
            });
        }

        /** 缩放停下后按当前倍数重新渲染，放大后字也清楚 */
        void refine() {
            if (pw <= 0) return;
            final int g = ++gen, p = page;
            final float s = scale();
            bg.post(new Runnable() {
                public void run() {
                    final Bitmap b = render(p, s, new float[2]);
                    ui.post(new Runnable() {
                        public void run() {
                            if (g != gen || b == null) { if (b != null) b.recycle(); return; }
                            swap(b, p);
                            invalidate();
                        }
                    });
                }
            });
        }

        void swap(Bitmap b, int p) {
            Bitmap old = bmp;
            bmp = b;
            bmpPage = p;
            if (old != null && old != b) old.recycle();
        }

        void drop() { gen++; if (bmp != null) { bmp.recycle(); bmp = null; } }

        @Override
        protected void onSizeChanged(int w, int h, int ow, int oh) {
            super.onSizeChanged(w, h, ow, oh);
            if (pw <= 0) { if (bmpPage < 0 && !loading) load(page); return; }
            zoom = 1f;          // 转屏后按新尺寸重新适应屏幕
            layoutPage();
            refine();
        }

        @Override
        protected void onDraw(Canvas c) {
            if (pw > 0) {
                dst.set(tx, ty, tx + dispW(), ty + dispH());
                c.drawRect(dst, white);
                if (bmp != null && !bmp.isRecycled() && bmpPage == page) c.drawBitmap(bmp, null, dst, paint);
                if (ddOn && zones != null) {
                    float dw = dispW(), dh = dispH(), r = dp(3);
                    for (TbAudio.Zone z : zones) {
                        if (z.page != page) continue;
                        zr.set(tx + z.x * dw, ty + z.y * dh, tx + (z.x + z.w) * dw, ty + (z.y + z.h) * dh);
                        if (z == playing) c.drawRoundRect(zr, r, r, zoneOn);
                        c.drawRoundRect(zr, r, r, zoneLine);
                    }
                }
            }
            if (loading && (bmp == null || bmpPage != page)) c.drawText("正在打开第 " + (page + 1) + " 页…", getWidth() / 2f, getHeight() / 2f, text);
        }

        @Override
        public boolean onTouchEvent(MotionEvent e) {
            boolean a = scaler.onTouchEvent(e);
            boolean b = gestures.onTouchEvent(e);
            return a || b || super.onTouchEvent(e);
        }
    }
}
