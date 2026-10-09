# 把 Quaternius《Ultimate Animated Animal Pack》（CC0，quaternius.com）里的 glTF 转成 GLB，再用 base64 包成 .js
# 原因：App 从 file:// 加载页面，WebView 不允许 XHR 读本地文件，只能用 <script> 引入；
# 转成 GLB 是为了让 GLTFLoader 直接解析二进制，不再去 fetch data: 地址
# 用法：python wrap.py <ShibaInu.gltf 所在目录>
import base64, json, os, struct, sys

src = sys.argv[1]
for name, key in [('ShibaInu', 'shiba'), ('Husky', 'husky')]:
    g = json.load(open(os.path.join(src, name + '.gltf'), encoding='utf8'))
    assert len(g['buffers']) == 1
    uri = g['buffers'][0].pop('uri')
    binary = base64.b64decode(uri.split(',', 1)[1])
    g['buffers'][0]['byteLength'] = len(binary)
    js = json.dumps(g, separators=(',', ':')).encode('utf8')
    js += b' ' * (-len(js) % 4)
    binary += b'\0' * (-len(binary) % 4)
    total = 12 + 8 + len(js) + 8 + len(binary)
    glb = struct.pack('<4sII', b'glTF', 2, total) + struct.pack('<I4s', len(js), b'JSON') + js + struct.pack('<I4s', len(binary), b'BIN\0') + binary
    with open(key + '.js', 'w', encoding='utf8') as f:
        f.write('window.PET_MODELS=window.PET_MODELS||{};PET_MODELS.%s="%s";\n' % (key, base64.b64encode(glb).decode()))
    print(key, len(glb))
