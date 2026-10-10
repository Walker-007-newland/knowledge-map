package com.fjzk.knowledgemap;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;

import java.io.File;
import java.io.FileNotFoundException;

/**
 * 把下载好的更新包（cache/update.apk）以 content:// 地址只读地提供给系统安装器。
 * Android 7 起不能把 file:// 地址交给别的应用，这里相当于一个只认这一个文件的简化版 FileProvider。
 */
public class ApkProvider extends ContentProvider {
    static final String AUTHORITY = "com.fjzk.knowledgemap.apk";
    static final Uri URI = Uri.parse("content://" + AUTHORITY + "/update.apk");
    static final String MIME = "application/vnd.android.package-archive";

    File file() { return new File(getContext().getCacheDir(), "update.apk"); }

    @Override public boolean onCreate() { return true; }

    @Override public String getType(Uri uri) { return MIME; }

    @Override
    public ParcelFileDescriptor openFile(Uri uri, String mode) throws FileNotFoundException {
        return ParcelFileDescriptor.open(file(), ParcelFileDescriptor.MODE_READ_ONLY);
    }

    // 有的安装器会先查文件名和大小
    @Override
    public Cursor query(Uri uri, String[] projection, String sel, String[] args, String sort) {
        MatrixCursor c = new MatrixCursor(new String[] { OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE });
        c.addRow(new Object[] { "knowledge-map.apk", file().length() });
        return c;
    }

    @Override public Uri insert(Uri uri, ContentValues v) { return null; }
    @Override public int delete(Uri uri, String sel, String[] args) { return 0; }
    @Override public int update(Uri uri, ContentValues v, String sel, String[] args) { return 0; }
}
