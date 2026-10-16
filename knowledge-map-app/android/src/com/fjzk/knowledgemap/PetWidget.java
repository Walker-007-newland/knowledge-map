package com.fjzk.knowledgemap;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.util.Base64;
import android.widget.RemoteViews;

import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;

/**
 * 桌面上的小狗：显示照片、名字、等级、饱食度和骨头，点一下打开 App 的宠物页。
 * 数据由网页通过 KMBridge.updatePet / savePetImage 推过来（存在 SharedPreferences 和 files/pet.png）。
 * 饱食度按“上次记录的值 − 过去的小时数 × 每小时掉多少”现算；系统每 30 分钟刷新一次，重启后桌面会自动恢复小部件。
 */
public class PetWidget extends AppWidgetProvider {
    static final String PREFS = "pet_widget";

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) mgr.updateAppWidget(id, views(ctx));
    }

    /** 网页数据变了就调用：刷新所有已放到桌面的小狗 */
    static void refresh(Context ctx) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
        int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, PetWidget.class));
        if (ids.length > 0) mgr.updateAppWidget(ids, views(ctx));
    }

    static void saveState(Context ctx, String json) {
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString("state", json).apply();
        refresh(ctx);
    }

    static void saveImage(Context ctx, String base64) {
        try {
            byte[] png = Base64.decode(base64, Base64.DEFAULT);
            FileOutputStream out = new FileOutputStream(new File(ctx.getFilesDir(), "pet.png"));
            out.write(png);
            out.close();
        } catch (Exception ignored) { }
        refresh(ctx);
    }

    /**
     * 弹出系统的“添加到桌面”对话框（Android 8+，且桌面支持才行）。
     * 注意：小米、华为、OPPO、vivo 等桌面常常“说支持”却什么都不弹（缺“桌面快捷方式”权限时静默失败），
     * 所以网页在调用后还会用 count() 检查是否真的加上了，没加上就显示手动添加的步骤。
     */
    static boolean pin(Context ctx) {
        if (Build.VERSION.SDK_INT < 26) return false;
        AppWidgetManager mgr = ctx.getSystemService(AppWidgetManager.class);
        if (mgr == null || !mgr.isRequestPinAppWidgetSupported()) return false;
        return mgr.requestPinAppWidget(new ComponentName(ctx, PetWidget.class), null, null);
    }

    /** 桌面上现在放了几个小狗小部件 */
    static int count(Context ctx) {
        return AppWidgetManager.getInstance(ctx).getAppWidgetIds(new ComponentName(ctx, PetWidget.class)).length;
    }

    /** 给网页排查用：品牌、系统版本、桌面是否声称支持一键添加 */
    static String info(Context ctx) {
        boolean pinOk = false;
        if (Build.VERSION.SDK_INT >= 26) {
            AppWidgetManager mgr = ctx.getSystemService(AppWidgetManager.class);
            pinOk = mgr != null && mgr.isRequestPinAppWidgetSupported();
        }
        try {
            return new JSONObject()
                .put("brand", Build.MANUFACTURER == null ? "" : Build.MANUFACTURER.toLowerCase())
                .put("model", Build.MODEL)
                .put("sdk", Build.VERSION.SDK_INT)
                .put("pinSupported", pinOk)
                .put("count", count(ctx))
                .toString();
        } catch (Exception e) {
            return "{}";
        }
    }

    static RemoteViews views(Context ctx) {
        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.widget_pet);

        // 点小部件：打开 App 并直接进宠物页
        Intent open = new Intent(ctx, MainActivity.class)
            .putExtra(MainActivity.EXTRA_OPEN, "pet/index.html")
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
        v.setOnClickPendingIntent(R.id.widget_root, PendingIntent.getActivity(ctx, 0, open, flags));

        File img = new File(ctx.getFilesDir(), "pet.png");
        Bitmap bmp = img.exists() ? BitmapFactory.decodeFile(img.getPath()) : null;
        if (bmp != null) v.setImageViewBitmap(R.id.widget_pet, bmp);
        else v.setImageViewResource(R.id.widget_pet, R.mipmap.ic_launcher);

        String json = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString("state", "");
        try {
            if (json == null || json.isEmpty()) throw new Exception("还没领养");
            JSONObject s = new JSONObject(json);
            double hours = Math.max(0, (System.currentTimeMillis() - s.getLong("tick")) / 3600000.0);
            int full = (int) Math.round(Math.max(0, s.getDouble("fullness") - hours * s.optDouble("decay", 1)));
            boolean hungry = full < s.optInt("hungry", 30);
            v.setTextViewText(R.id.widget_name, s.getString("name"));
            v.setTextViewText(R.id.widget_level, "Lv." + s.getInt("level") + " " + s.optString("stage") + " · 🦴 " + s.getInt("bones"));
            v.setProgressBar(R.id.widget_food, 100, full, false);
            String msg;
            if (hungry) msg = "饿了，快来喂我！";
            else if (s.optInt("todayMin") > 0) msg = "今天学了 " + s.optInt("todayMin") + " 分钟" + (s.optInt("streak") > 1 ? " · 连续 " + s.optInt("streak") + " 天" : "");
            else msg = "今天还没学习哦";
            v.setTextViewText(R.id.widget_msg, "饱食度 " + full + " · " + msg);
        } catch (Exception e) {
            v.setTextViewText(R.id.widget_name, "领养一只小狗");
            v.setTextViewText(R.id.widget_level, "掌握知识点就能领骨头");
            v.setProgressBar(R.id.widget_food, 100, 0, false);
            v.setTextViewText(R.id.widget_msg, "点这里打开");
        }
        return v;
    }
}
