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

/**
 * 电子教材阅读器：系统自带的 PdfRenderer（不需要第三方库、不联网）。
 * 单页显示；左右滑动或点屏幕左右两侧翻页；点中间显示/隐藏工具栏；点页码跳转；双指缩放、双击放大/还原，放大后拖动查看。
 * 每本书记住最后阅读页（SharedPreferences km_textbooks 的 page_{id}）。横竖屏都可用（manifest 里 configChanges，不重建，按新尺寸重新排版）。
 * 渲染在后台线程，PdfRenderer 同一时间只开一页。
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
        bar.addView(button("‹ 上一页", new View.OnClickListener() { public void onClick(View v) { go(page - 1); } }));
        label = button("", new View.OnClickListener() { public void onClick(View v) { askPage(); } });
        bar.addView(label);
        bar.addView(button("下一页 ›", new View.OnClickListener() { public void onClick(View v) { go(page + 1); } }));
        root.addView(bar, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.TOP));
        setContentView(root);
        showLabel();
        view.load(page);
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
        final RectF dst = new RectF();
        final ScaleGestureDetector scaler;
        final GestureDetector gestures;
        boolean scaling;

        PageView(Context c) {
            super(c);
            white.setColor(Color.WHITE);
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
