# OpenGL講習会

## 3D感を出す
現在、2つの三角形はレイヤー的には赤が下で青が上になっています。
これはもちろん、赤い三角形の描画命令を先に出しているからです。これを逆にすれば、上下関係は逆になります。

この状態に違和感はありませんか？
もちろん、普通の2D描画ライブラリなら描画順序に内容が影響されるものです。
ですが、これは3Dの描画ライブラリなのです。一般的な世界に生きている人ならご存知の通り、我々の世界では**手前のもの**がレイヤー的に上になるべきで、そもそも描画順序などという概念はないはずなのです。
我々がまず導入したい3Dはこれです。すなわち、描画対象のレイヤーは描画順序ではなくその対象のZ座標で定まる、という仕様にします。
これを簡単に可能にする手段をOpenGLは提供していますので、まずはそれを使ってみましょう。

```javascript
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0.0, 0.5, 0.2,
    0.5, -0.5, 0.2,
    -0.5, -0.5, 0.2,
    0.0, -0.5, 0.8,
    0.5, 0.5, 0.8,
    -0.5, 0.5, 0.8
]), gl.STATIC_DRAW);

...

gl.vertexAttribPointer(attributeLocation, 3, gl.FLOAT, false, 0, 0);

...

gl.enable(gl.DEPTH_TEST);

...

gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
```

```glsl
attribute vec3 position;

void main() {
    gl_Position = vec4(position, 1);
}
```