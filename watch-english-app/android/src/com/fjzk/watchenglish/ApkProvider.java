package com.fjzk.watchenglish;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;

import java.io.File;
import java.io.FileNotFoundException;

/** 下载好的更新包 cache/update.apk 的 content:// 地址，只读，交给系统安装器（Android 7 起不能直接给 file:// 地址）。 */
public class ApkProvider extends ContentProvider {
    static final String AUTHORITY = "com.fjzk.watchenglish.apk";
    static final Uri URI = Uri.parse("content://" + AUTHORITY + "/update.apk");
    static final String MIME = "application/vnd.android.package-archive";

    File apk() { return new File(getContext().getCacheDir(), "update.apk"); }

    @Override public boolean onCreate() { return true; }
    @Override public String getType(Uri uri) { return MIME; }

    @Override
    public ParcelFileDescriptor openFile(Uri uri, String mode) throws FileNotFoundException {
        return ParcelFileDescriptor.open(apk(), ParcelFileDescriptor.MODE_READ_ONLY);
    }

    @Override
    public Cursor query(Uri uri, String[] projection, String sel, String[] args, String sort) {
        MatrixCursor c = new MatrixCursor(new String[] { OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE });
        c.addRow(new Object[] { "watch-english.apk", apk().length() });
        return c;
    }

    @Override public Uri insert(Uri uri, ContentValues v) { return null; }
    @Override public int delete(Uri uri, String sel, String[] args) { return 0; }
    @Override public int update(Uri uri, ContentValues v, String sel, String[] args) { return 0; }
}
