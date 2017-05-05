# OpenGL講習会

## 色の違う三角形を出す
先ほどの例では、白い三角形が1つだけ出ていました。
色が白かったのは、フラグメントシェーダ内でvec4(1,1,1,1)を代入していたからですよね。
だから、そこに例えばvec4(1,0,0,1)とでも入れてやれば三角形は赤くなるはずです。
三角形が1つだけ出ていたのは、もちろんVBOに代入した頂点が3つしかなかったのと、drawArraysの引数に3が入っていたからでしょう。例えばVBOに6つの値を入れて、drawArrayasの引数を6に変えてやれば、おそらくもう1つの三角形も出せるでしょう。
では、赤い三角形1つと青い三角形を1つ、それぞれ出すためにはどうしたらいいでしょう？
色を変えていたのはフラグメントシェーダ内の定数でしたので、このままではシェーダをもう1つ作らなくてはいけません。

...とまぁ、そんな話を持ち出すからにはもちろん解決策があるわけです。
シェーダには**Uniform変数**という機能があります。
これは、シェーダの外部(今回はJavaScript側)から値を渡すことのできる変数のことです。これを使えば、色をシェーダ内の定数ではなく、JavaScript側に定義しておけるので扱いがお手軽になります。
まず、フラグメントシェーダをこのように書き換えます。
```glsl
precision mediump float;

uniform vec3 color;

void main() {
	gl_FragColor = vec4(color, 1);
}
```
precisionというのはfloatを何bitにするか指定するものなんですが、まぁこれはこういうもんということで気にしなくて大丈夫です。
ちなみに、vec4の引数にvec3とfloatを1つずついれていますが、これはGLSL的にはOKなんです。意味はまぁわかるかと思います。
次に、JavaScript側のVBOを増やします。
```javascript
...
gl.bufferData(new Float32Array[
	0.0, 0.5,
	0.5, -0.5,
	-0.5, -0.5,
	0.0, -0.5,
	0.5, 0.5,
	-0.5, 0.5
]);
...
```
そして、uniformの中身を変えつつ描画をします。
```javascript
const colorLocation = gl.getUniformLocation(program, "color");
gl.uniform3f(colorLocation, 1,0,0); //赤
gl.drawArrays(gl.GL_TRIANGLES, 0, 3);
gl.uniform3f(colorLocation, 0,0,1); //青
gl.drawArrays(gl.GL_TRIANGLES, 3, 3);
```
これで赤と青の三角形が描画できました。
![](triangle2.png)

## 三角形に座標変換をかける
ざ、座標変換...?!
とかならないでください。移動したり回転したり拡大したりするだけです。
先ほど変更したフラグメントシェーダは色を変えるためのもの。頂点シェーダは図形を変形させるためのもの。ということで、今回は頂点シェーダをいじってみます。
とりあえず青いやつだけ単振動させてみましょう。
平行移動成分をUniformとして渡してみます。
```glsl
attribute vec2 position;
uniform vec2 translation;

void main() {
	gl_Position = position + translation;
}
```
```javascript
const colorLocation = gl.getUniformLocation(program, "color");
const translationLocation = gl.getUniformLocation(program, "translation");
gl.uniform3f(colorLocation, 1,0,0); //赤
gl.uniform2f(translationLocation, x, y);
gl.drawArrays(gl.GL_TRIANGLES, 0, 3);
gl.uniform3f(colorLocation, 0,0,1); //青
gl.uniform2f(translationLocation, -x, -y);
gl.drawArrays(gl.GL_TRIANGLES, 3, 3);

x += Math.sin(time * 5) * 0.05;
y += Math.cos(time * 7) * 0.05;
time += 0.01;
```

動きましたね。

## 練習問題
1. Uniform変数としてfloat型のangleを定義し、三角形を時間変化で回転させてみよう。
2. Uniform変数としてvec2型のscaleを定義し、各頂点をscale倍させてみよう。