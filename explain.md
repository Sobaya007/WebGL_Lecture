# OpenGL講習会

## 数学のはなし
さて、3D感をもっと推し進めていきたいのですが、その前に避けては通れない話題があります。
頂点シェーダの話です。
先ほど、Uniform変数を用いて三角形を移動させたりいろいろしましたが、アレは実は一般的な手法ではありません。
普通3Dグラフィックスで扱う変換は主に3つです。
- 平行移動
- 回転
- 拡大縮小

これらはすべて**線形変換**です。線形変換は行列の掛け算に落とし込むことができます。
すなわち、変換の種類によってUniformを分けたりせずただ1つの行列を渡し、頂点に掛けるだけで事足りるのです。

### 行列を用いた変換
行列を用いて上記3つの変換を行う場合、3次元なら4 $\times$ 4の行列を使います。
「なぜ4 $\times$ 4？」と思うかもしれませんが、結論から言ってしまえば3 $\times$ 3だと足りないからです。

そして、具体的な行列の話をする前に1つお約束があります。
これから扱う計算はもちろん3次元上でいろいろするためのものですが、3次元のベクトルだと都合の悪いことがあるので、4次元ベクトルも扱いたいのです。そこで、3次元ベクトル(x,y,z)と4次元ベクトル(x,y,z,w)の間に変換方法を定義しておきます。

> 3次元　$\mapsto$ 4次元
> $(x,y,z) \mapsto (x,y,z,1)$

> 4次元 $\mapsto$ 3次元
> $(x,y,z,w) \mapsto (\frac x w, \frac y w, \frac z w)$

これはルールとして盛り込んでおきます。
さて、これを踏まえて先の3つの変換を行列で書いてみましょう。

- $(T_x, T_y, T_z)$の平行移動行列
$$$
T = \left( \begin{array}{ccc} 1 & 0 & 0 & Tx \\
    0 & 1 & 0 & Ty \\
    0 & 0 & 1 & Tz \\
    0 & 0 & 0 & 1 \\
\end{array} \right )    
$$$

- $(N_x, N_y, N_z)$を軸とする$\theta$の回転行列
$c = cosθ, s = sinθ$とする
$$$
R = \left( \begin{array}{cccc} N_x^2(1-c)+c & N_xN_y(1-c)-sN_z & NzNx(1-c)+sNy & 0 \\
N_xN_y(1-c)+sN_z & N_y^2(1-c)+c & N_yN_z(1-c)-sN_x & 0 \\
N_zN_x(1-c)-sN_y & N_yN_z(1-c)+sN_x & N_z^2(1-c)+c & 0 \\
0 & 0 &  0 & 1 \\
\end{array} \right)
$$$

- $(S_x,S_y,S_z)$の拡大縮小行列
$$$
S = \left( \begin{array}{cccc} Sx & 0 & 0 & 0 \\
0 & S_y & 0 & 0 \\
0 & 0 & S_z & 0 \\
0 & 0 & 0 & 1 \\
\end{array} \right)
$$$

とまぁ、こんなかんじの行列を先ほどの4次元ベクトルに掛け算すれば、それぞれの変換が行われます。
例えば、$(x,y,z)$を$(a,b,c)$だけ平行移動させたければ、次のようにします。
$(x,y,z) \mapsto (x,y,z,1)$
$$$
\left( \begin{array}{ccc} 1 & 0 & 0 & a \\
    0 & 1 & 0 & b \\
    0 & 0 & 1 & c \\
    0 & 0 & 0 & 1 \\
\end{array} \right )
\times \left( \begin{array}{c} x \\ y \\ z \\ 1 \end{array} \right) = \left( \begin{array}{c} x + a \\ y + b \\ z + c \\ 1 \end{array} \right)
$$$
$(x+a,y+b,z+c,1) \mapsto (x+a,y+b,z+c)$
これで確かに平行移動ができていますね。回転と拡大は行列の部分を変更するだけで行えます。

行列を用いて、3つの変換を一般化することができました。
行列を用いることの嬉しさはもう一つあります。
それは行列が結合法則を満たすということです。
つまり、$A,B$を行列とし、$V$をベクトルとすると、以下が成り立ちます。
$$$A \times (B \times V) = (A \times B) \times V$$$
例えば、「(0,1,2)方向に平行移動してから(1,0,0)を中心に30°回転し、(0.5,0.2,0.3)の割合で拡大」のような複合的な変換をしたいとき、3つの行列を全て保存していなくても、それらを掛け合わせた行列を1つ保存しておけば同じことが起きるのです。変換の種類がいくつに増えてもこれは変わりません。

```javascript
const mTranslate = (x,y,z) => [
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    x,y,z,1
];

const mRotate = (x,y,z,t) => {
    const c = Math.cos(t);
    const s = Math.sin(t);
    return [
        x*x*(1-c)+c, x*y*(1-c)+s*z, z*x*(1-c)-s*y, 0,
        x*y*(1-c)-s*z, y*y*(1-c)+c, y*z*(1-c)+s*x, 0,
        z*x*(1-c)+s*y, y*z*(1-c)-s*x, z*z*(1-c)+c, 0,
        0,0,0,1
    ];
};
const mScale = (x,y,z) => [
    x,0,0,0,
    0,y,0,0,
    0,0,z,0,
    0,0,0,1
];

const mult = (a,b) => {
    const res = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            let m = 0;
            for (let k = 0; k < 4; k++) {
                m += a[i*4+k] * b[k*4+j];
            }
            res.push(m);
        }
    }
    return res;
};
```
```javascript
let m1 = mTranslate(0.5, 0, 0);
let m2 = mTranslate(0,0,0);
const R = mRotate(0,0,1, 0.1);
...
const colorLocation = gl.getUniformLocation(program, "color");
const matrixLocation = gl.getUniformLocation(program, "matrix");
gl.uniformMatrix4fv(matrixLocation, false, m1);
gl.uniform3f(colorLocation, 1,0,0);
gl.drawArrays(gl.TRIANGLES, 0, 3);
gl.uniformMatrix4fv(matrixLocation, false, m2);
gl.uniform3f(colorLocation, 0,0,1);
gl.drawArrays(gl.TRIANGLES, 3, 3);
gl.flush();

m1 = mult(m1, R);
m2 = mult(m2, R);
```
```glsl
attribute vec3 position;
uniform mat4 matrix;

void main() {
    gl_Position = matrix * vec4(position, 1.);
}
```
Uniform変数にベクトルを渡すときにはuniform3fでしたが、行列を渡すときにはuniformMatrix4fvという関数を使います。第2引数には必ずfalseを入れるという謎仕様です。(trueにするとエラーを吐く)