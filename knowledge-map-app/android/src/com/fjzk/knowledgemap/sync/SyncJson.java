package com.fjzk.knowledgemap.sync;

import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * 极简 JSON（纯 Java，电脑上和 Android 上都能用，不依赖 org.json）。
 * 解析结果：Map(LinkedHashMap) / List / String / Long / Double / Boolean / null。
 * 输出：stringify 按 Map 自身的顺序；canon 按键名排序、不带空格（和 km-data.js 的 _canon 同一规则：跳过 null 以外的“未定义”不存在，所以就是排序）。
 */
public final class SyncJson {
    private SyncJson() { }

    // ------------------------------------------------------------ 解析

    public static Object parse(String s) {
        P p = new P(s);
        p.ws();
        Object v = p.value(0);
        p.ws();
        if (p.i != s.length()) throw new IllegalArgumentException("JSON 末尾有多余内容");
        return v;
    }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> obj(String s) {
        Object v = parse(s);
        if (!(v instanceof Map)) throw new IllegalArgumentException("不是 JSON 对象");
        return (Map<String, Object>) v;
    }

    private static final class P {
        final String s;
        int i;
        P(String s) { this.s = s; }

        void ws() { while (i < s.length() && " \t\r\n".indexOf(s.charAt(i)) >= 0) i++; }

        char peek() {
            if (i >= s.length()) throw new IllegalArgumentException("JSON 不完整");
            return s.charAt(i);
        }

        Object value(int depth) {
            if (depth > 64) throw new IllegalArgumentException("JSON 嵌套太深");
            char c = peek();
            if (c == '{') {
                i++;
                Map<String, Object> m = new LinkedHashMap<>();
                ws();
                if (peek() == '}') { i++; return m; }
                while (true) {
                    ws();
                    if (peek() != '"') throw new IllegalArgumentException("JSON 键名");
                    String k = str();
                    ws();
                    if (peek() != ':') throw new IllegalArgumentException("JSON 缺冒号");
                    i++;
                    ws();
                    m.put(k, value(depth + 1));
                    ws();
                    char d = peek();
                    i++;
                    if (d == '}') return m;
                    if (d != ',') throw new IllegalArgumentException("JSON 对象分隔");
                }
            }
            if (c == '[') {
                i++;
                List<Object> l = new ArrayList<>();
                ws();
                if (peek() == ']') { i++; return l; }
                while (true) {
                    ws();
                    l.add(value(depth + 1));
                    ws();
                    char d = peek();
                    i++;
                    if (d == ']') return l;
                    if (d != ',') throw new IllegalArgumentException("JSON 数组分隔");
                }
            }
            if (c == '"') return str();
            if (s.startsWith("true", i)) { i += 4; return Boolean.TRUE; }
            if (s.startsWith("false", i)) { i += 5; return Boolean.FALSE; }
            if (s.startsWith("null", i)) { i += 4; return null; }
            int st = i;
            if (peek() == '-') i++;
            boolean frac = false;
            while (i < s.length()) {
                char d = s.charAt(i);
                if (d >= '0' && d <= '9') i++;
                else if (d == '.' || d == 'e' || d == 'E') { frac = true; i++; }
                else if ((d == '+' || d == '-') && (s.charAt(i - 1) == 'e' || s.charAt(i - 1) == 'E')) i++;
                else break;
            }
            String n = s.substring(st, i);
            if (n.isEmpty() || n.equals("-")) throw new IllegalArgumentException("JSON 值");
            if (!frac) {
                try { return Long.parseLong(n); } catch (NumberFormatException e) { return Double.parseDouble(n); }
            }
            return Double.parseDouble(n);
        }

        String str() {
            i++;
            StringBuilder b = new StringBuilder();
            while (true) {
                char c = peek();
                i++;
                if (c == '"') return b.toString();
                if (c == '\\') {
                    char e = peek();
                    i++;
                    switch (e) {
                        case 'n': b.append('\n'); break;
                        case 't': b.append('\t'); break;
                        case 'r': b.append('\r'); break;
                        case 'b': b.append('\b'); break;
                        case 'f': b.append('\f'); break;
                        case 'u':
                            if (i + 4 > s.length()) throw new IllegalArgumentException("JSON 转义");
                            b.append((char) Integer.parseInt(s.substring(i, i + 4), 16));
                            i += 4;
                            break;
                        default: b.append(e);
                    }
                } else b.append(c);
            }
        }
    }

    // ------------------------------------------------------------ 输出

    public static String stringify(Object v) {
        StringBuilder b = new StringBuilder();
        write(b, v, false);
        return b.toString();
    }

    /** 规范化 JSON：键名排序、不带空格 */
    public static String canon(Object v) {
        StringBuilder b = new StringBuilder();
        write(b, v, true);
        return b.toString();
    }

    @SuppressWarnings("unchecked")
    private static void write(StringBuilder b, Object v, boolean sorted) {
        if (v == null) b.append("null");
        else if (v instanceof String) quote(b, (String) v);
        else if (v instanceof Boolean) b.append(v.toString());
        else if (v instanceof Double || v instanceof Float) {
            double d = ((Number) v).doubleValue();
            if (d == Math.rint(d) && Math.abs(d) < 9e15) b.append((long) d);
            else b.append(d);
        } else if (v instanceof Number) b.append(((Number) v).longValue());
        else if (v instanceof Map) {
            Map<String, Object> m = (Map<String, Object>) v;
            if (sorted) m = new TreeMap<>(m);
            b.append('{');
            boolean first = true;
            for (Map.Entry<String, Object> e : m.entrySet()) {
                if (!first) b.append(',');
                first = false;
                quote(b, e.getKey());
                b.append(':');
                write(b, e.getValue(), sorted);
            }
            b.append('}');
        } else if (v instanceof Collection) {
            b.append('[');
            boolean first = true;
            for (Object x : (Collection<Object>) v) {
                if (!first) b.append(',');
                first = false;
                write(b, x, sorted);
            }
            b.append(']');
        } else quote(b, String.valueOf(v));
    }

    public static String quote(String s) {
        StringBuilder b = new StringBuilder();
        quote(b, s);
        return b.toString();
    }

    private static void quote(StringBuilder b, String s) {
        b.append('"');
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"': b.append("\\\""); break;
                case '\\': b.append("\\\\"); break;
                case '\n': b.append("\\n"); break;
                case '\r': b.append("\\r"); break;
                case '\t': b.append("\\t"); break;
                case '\b': b.append("\\b"); break;
                case '\f': b.append("\\f"); break;
                default:
                    if (c < 0x20 || c == 0x2028 || c == 0x2029) b.append(String.format("\\u%04x", (int) c));
                    else b.append(c);
            }
        }
        b.append('"');
    }

    // ------------------------------------------------------------ 取值小工具

    public static Map<String, Object> map() { return new LinkedHashMap<>(); }

    /** 交替传键和值：of("a", 1, "b", "x") */
    public static Map<String, Object> of(Object... kv) {
        Map<String, Object> m = new LinkedHashMap<>();
        for (int i = 0; i + 1 < kv.length; i += 2) m.put((String) kv[i], kv[i + 1]);
        return m;
    }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> m(Object o) { return o instanceof Map ? (Map<String, Object>) o : null; }

    @SuppressWarnings("unchecked")
    public static List<Object> l(Object o) { return o instanceof List ? (List<Object>) o : null; }

    public static String s(Map<String, Object> m, String k) {
        Object o = m == null ? null : m.get(k);
        return o instanceof String ? (String) o : null;
    }

    public static long n(Map<String, Object> m, String k, long def) {
        Object o = m == null ? null : m.get(k);
        return o instanceof Number ? ((Number) o).longValue() : def;
    }

    public static boolean b(Map<String, Object> m, String k) {
        Object o = m == null ? null : m.get(k);
        return Boolean.TRUE.equals(o);
    }
}
