package com.fjzk.knowledgemap;

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

/**
 * 应用缓存目录里两类文件的 content:// 地址（Android 7 起不能把 file:// 地址交给别的应用，相当于简化版 FileProvider）：
 *   /update.apk          下载好的更新包，只读，交给系统安装器
 *   /photos/photo-*.jpg  单词听写拍照时相机写入的照片，可写
 */
public class ApkProvider extends ContentProvider {
    static final String AUTHORITY = "com.fjzk.knowledgemap.apk";
    static final Uri URI = Uri.parse("content://" + AUTHORITY + "/update.apk");
    static final String MIME = "application/vnd.android.package-archive";

    /** 新建一个空的照片文件给相机写，顺便清掉一天前的旧照片 */
    static Uri newPhoto(Context c) {
        File dir = new File(c.getCacheDir(), "photos");
        dir.mkdirs();
        File[] old = dir.listFiles();
        if (old != null) for (File f : old) if (System.currentTimeMillis() - f.lastModified() > 86400000L) f.delete();
        String name = "photo-" + System.currentTimeMillis() + ".jpg";
        try { new File(dir, name).createNewFile(); } catch (IOException ignored) { }
        return Uri.parse("content://" + AUTHORITY + "/photos/" + name);
    }

    static File fileFor(Context c, Uri uri) {
        String path = uri.getPath() == null ? "" : uri.getPath();
        if (path.matches("/photos/photo-\\d+\\.jpg")) return new File(c.getCacheDir(), path.substring(1));
        return new File(c.getCacheDir(), "update.apk");
    }

    static boolean isPhoto(Uri uri) { return uri.getPath() != null && uri.getPath().startsWith("/photos/"); }

    @Override public boolean onCreate() { return true; }

    @Override public String getType(Uri uri) { return isPhoto(uri) ? "image/jpeg" : MIME; }

    @Override
    public ParcelFileDescriptor openFile(Uri uri, String mode) throws FileNotFoundException {
        File f = fileFor(getContext(), uri);
        if (isPhoto(uri) && mode.contains("w"))
            return ParcelFileDescriptor.open(f, ParcelFileDescriptor.MODE_READ_WRITE | ParcelFileDescriptor.MODE_CREATE | ParcelFileDescriptor.MODE_TRUNCATE);
        return ParcelFileDescriptor.open(f, ParcelFileDescriptor.MODE_READ_ONLY);
    }

    // 有的安装器、网页文件框会先查文件名和大小
    @Override
    public Cursor query(Uri uri, String[] projection, String sel, String[] args, String sort) {
        File f = fileFor(getContext(), uri);
        MatrixCursor c = new MatrixCursor(new String[] { OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE });
        c.addRow(new Object[] { isPhoto(uri) ? f.getName() : "knowledge-map.apk", f.length() });
        return c;
    }

    @Override public Uri insert(Uri uri, ContentValues v) { return null; }
    @Override public int delete(Uri uri, String sel, String[] args) { return 0; }
    @Override public int update(Uri uri, ContentValues v, String sel, String[] args) { return 0; }
}
