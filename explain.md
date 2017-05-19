# 法線マップ

次は法線マップというのをやってみます。
前回の物体は完全な立方体でしたが、実際のゲームなどではきれいな平面というのは登場の出番が少ないです。
というのも、自然物というのは基本的に凸凹しているもので、それを平面として近似するとあまりに見た目がお粗末になってしまうからです。
これの(リアリティという観点から言って)最も良い解決策はおそらく、凸凹している物体にはそういう形を持った頂点集合を与えてやることでしょう。ですが、この解決策が現実味を欠いていることは用意に想像できます。
なぜなら、頂点を増やすとポリゴンが増え、ポリゴンが増えると一般に描画速度が低下するからです。
リアリティのある凹凸を作りたければそれなりのポリゴン数が要求され、それは現実的に不可能。
となればやはり"なんちゃって"で作られたコスパの良い凸凹を作ろうという目論見もあって然るべきです。
その一例がこの**法線マップ**です。

法線マップには、ある特別なテクスチャを使います。今回はこの[某言語](https://dlang.org/download.html)くんを使ってみます。
![](dman_normal.png)
見てみると、ほとんどが白っぽい青色で、輪郭部分だけ色が変わっています。
実はこれ、**RGBが法線ベクトルと対応している**んです。
つまり、向かって右方向をX正方向、上方向をY正方向、手前をZ方向としたとき、RGB = (1.0, 0.5, 0.5)なら法線は右向き、RGB = (0.5, 0.0, 0.5)なら法線は下向きですよ、ということになっています。(RGBは0~1の範囲に収まるため、負の数を表現するために0.5を原点とします。)
このような特殊な画像と、これを使った手法をどちらも**法線マップ**と呼びます。
法線マップの作り方はいくつかありますが、最近だと[ここ](http://cpetry.github.io/NormalMap-Online/)みたいなサイトを使うといったのがお手軽ですね。ちなみに私は昔入れたGIMPのプラグインで作りました。

さて、もう法線マップの意味が想像できたでしょうか？
要は平面は平面でも**法線が**凸凹してればある程度ごまかせるのでは？という発想です。
具体的にはPhongシェーディングの計算に使う法線を、JavaScriptからattributeとして与えられたものをそのまま使わずにこの法線マップを使ってちょっと加工したものを使うことで光の反射具合をそれっぽくします。
Phongシェーディングに限らず法線を使う他のレンダリング手法に対しても有効です。

ただここでちょぴっと数学をしないと実現できないので数学をします。

## 法線マップのための数学\~空間\~
OpenGLで計算をするとき、よく「空間」というワードが出てきます。
ここでいう「空間」とは「原点の位置」と「座標軸(直交基底)」の組だと思って間違いないです。
同じ点でも、空間ごとに違う座標で記述されます。ある空間での座標を違う空間の座標に移し替えることを**座標変換**と呼び、OpenGL内ではほぼ線形変換です。つまり、行列の積で座標変換は記述できます。
3Dでよく使われる空間は以下の通りです。
- Local Space
モデルデータの頂点座標が保存された空間。物体ごとに存在する。モデリングソフトで吐かれるデータに書いてある座標はこれ。
- World Space
すべての物体に対して共通の空間。適当に1つ定めてあればよい。
- View Space
原点がカメラの位置、基底もカメラの向きと平行になっている空間。カメラごとに存在する。
- Projection Space
遠近法がかかったあとの空間。基本的にView Spaceと同じだが座標の縮尺が違い、この空間内で$(-1,-1,-1)$から$(+1,+1,+1)$までの立方体領域に入っている物体だけが描画される。
- Tangent Space
接空間と訳す。物体の表面のある点$\vec p$に対して、$\vec p$を原点とし、$\vec p$における物体の法線を基底の1つとする空間をTangent Spaceと呼ぶ。したがって、無数にある。
Tangent Spaceの3つの座標軸には特別にtangent vector(接線), binormal vector(従法線), normal vector(法線)という呼び名がついている。

普段の計算ではWorld Spaceを使います。諸々の計算が終わって、最終的に画面にモノを表示する段階になったらWorld SpaceからView Spaceを通ってProjection Spaceにまで座標を持っていき、ポリゴンを貼ります。

Phong shadingの計算などはWorld Spaceで行っていました。
法線マップに記述された法線ベクトルはTangent Spaceにおけるものです。

## 法線マップのための数学\~GLSLと偏微分\~
GLSLでは`dFdx`と`dFdy`という関数があります。引数に来た値の、View Spaceにおけるx方向とy方向の偏微分を取るという関数です。z方向にはとれません。
これを使って例えば`dFdx(vUV.x)`と書けば$\frac {\partial \text{vUV.x}} {\partial x}$が取得できます。

## 法線マップのための数学\~偏微分とTangent Space\~
法線マップにある情報はTangent Spaceにおけるものですが、これはそのままでは使えません。
World Spaceに来てくれると嬉しいのですが(Phong ShadingはWorld Spaceで行っていたため)、それはちょっとめんどくさいのでView Spaceにとりあえず持ってくることにします。
(Phong Shadingの計算自体はどの空間でもできるので、逆にそれをView Spaceでやることにします。)

あるView Space$V$を考えます。$V$上の点は$(x,y,z)$と表されます。
$V$上にある物体の表面の点$\vec p(\in V)$における微小平面$P$にテクスチャが張られているとします。
$\vec p$におけるUV座標の座標軸の向きを$\vec u, \vec v(\in V)$とし、法線を$\vec n$とします。
$\vec p$を原点とし、基底のうち2本を$\vec u, \vec v$とする空間はTangent Spaceを為します。この空間を$T$とします。
$T$上の点のうち、$P$の上にあるものを基底$\vec u, \vec v$に対する2次元座標$(s,t)$で表現することにします。
我々の目的は、$\vec u, \vec v$を$\frac {\partial s} {\partial x}, \frac {\partial s} {\partial y}, \frac {\partial t} {\partial x}, \frac {\partial t} {\partial y}, \vec n$を用いて表すことです。

$V$上で$(x,y,0)$を通り$z$軸と平行な直線と平面$P$は(平行でなければ)交点を1つ持つことから、$(x,y)$を指定すると$P$上の点における空間$T$での座標$(s,t)$が一意に定まります。
$x$が$\Delta x$だけ動くと、$s$は$\frac {\partial s} {\partial x}\Delta x$だけ動きます。
したがって、$(x,y)$が$(\Delta x, \Delta y)$だけ動くと、$s$は$\frac {\partial s} {\partial x}\Delta x + \frac {\partial s} {\partial y}\Delta y$だけ動きます。$t$も同様です。
もし$(x,y,z)$が$\vec u$と平行に移動したなら、$t$の値は変動しないはずです。
つまり、$(\Delta x, \Delta y, \Delta z) \parallel \vec u$なら$\Delta t = 0$となるはずです。
このことから、
$$\frac {\partial t} {\partial x} u_x + \frac {\partial t} {\partial y} u_y = 0$$
を満たします。
また、$\vec u$は$T$の直交基底なので、$\vec u \cdot \vec n = 0$となります。
最後に、$|\vec u| = 1$という条件を課すと、各成分のスケールはどうでもいいことになりますので、
$$\vec u = normalize \left( \begin{array}{c} -\frac {\partial t}{\partial y}n_z \\ \frac {\partial t}{\partial x}n_z \\ \frac {\partial t}{\partial y}n_x - \frac {\partial t}{\partial x} n_y\end{array} \right)$$
となります。
$t$を$s$に変えることで、$\vec v$も求まります。


以上を踏まえると、次のようなコードで新たな法線が手に入ります。
```glsl
float tanx = -dFdy(vUV.t) * viewNormal.z;
float tany = dFdx(vUV.t) * viewNormal.z;
float tanz = -(viewNormal.x * tanx + viewNormal.y * tany);
vec3 tan = normalize(vec3(tanx, tany, tanz));
vec3 bin = normalize(cross(viewNormal, tan));
vec4 normalElements = texture2D(normalmap, vUV) - vec4(0.5);
const float scale = 10.;
vec3 normal = normalize(
        tan * normalElements.r * scale +
        bin * normalElements.g * scale +
        viewNormal * normalElements.b);
```
そのままだと法線マップの効果が弱いので、適当に横方向のベクトルを伸ばすことで強くしています。