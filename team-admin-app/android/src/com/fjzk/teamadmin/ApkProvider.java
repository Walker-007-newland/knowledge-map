package com.fjzk.teamadmin;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;

/** 下载好的更新包 cache/update.apk 的 content:// 地址，只读，交给系统安装器（Android 7 起不能直接给 file:// 地址）。 */
public class ApkProvider extends ContentProvider {
    static final String AUTHORITY = "com.fjzk.teamadmin.apk";
    static final Uri URI = Uri.parse("content://" + AUTHORITY + "/update.apk");
    static final String MIME = "application/vnd.android.package-archive";

    /** 扫管理码时给系统相机写照片的地址 cache/photos/photo-<时间>.jpg（超过一天的旧照片顺手删掉）。 */
    static Uri newPhoto(Context c) {
        File dir = new File(c.getCacheDir(), "photos");
        dir.mkdirs();
        File[] old = dir.listFiles();
        if (old != null) for (File f : old) if (System.currentTimeMillis() - f.lastModified() > 86400000L) f.delete();
        String name = "photo-" + System.currentTimeMillis() + ".jpg";
        try { new File(dir, name).createNewFile(); } catch (IOException ignored) { }
        return Uri.parse("content://" + AUTHORITY + "/photos/" + name);
    }

    static boolean isPhoto(Uri uri) { return uri.getPath() != null && uri.getPath().matches("/photos/photo-\\d+\\.jpg"); }

    static File fileFor(Context c, Uri uri) {
        if (isPhoto(uri)) return new File(c.getCacheDir(), uri.getPath().substring(1));
        return new File(c.getCacheDir(), "update.apk");
    }

    @Override public boolean onCreate() { return true; }
    @Override public String getType(Uri uri) { return isPhoto(uri) ? "image/jpeg" : MIME; }

    @Override
    public ParcelFileDescriptor openFile(Uri uri, String mode) throws FileNotFoundException {
        File f = fileFor(getContext(), uri);
        if (isPhoto(uri) && mode.contains("w"))
            return ParcelFileDescriptor.open(f, ParcelFileDescriptor.MODE_READ_WRITE | ParcelFileDescriptor.MODE_CREATE | ParcelFileDescriptor.MODE_TRUNCATE);
        return ParcelFileDescriptor.open(f, ParcelFileDescriptor.MODE_READ_ONLY);
    }

    @Override
    public Cursor query(Uri uri, String[] projection, String sel, String[] args, String sort) {
        File f = fileFor(getContext(), uri);
        MatrixCursor c = new MatrixCursor(new String[] { OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE });
        c.addRow(new Object[] { isPhoto(uri) ? f.getName() : "team-admin.apk", f.length() });
        return c;
    }

    @Override public Uri insert(Uri uri, ContentValues v) { return null; }
    @Override public int delete(Uri uri, String sel, String[] args) { return 0; }
    @Override public int update(Uri uri, ContentValues v, String sel, String[] args) { return 0; }
}
