/*
 * テクスチャ準備
 */
const makeCreateTexture = gl => src => new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    // 画像読み込み後の処理
    img.onload = _ => {
        // テクスチャの素を作る
        const tex = gl.createTexture();
        // テクスチャユニット0番とtexを結び付け、かつバインド
        gl.bindTexture(gl.TEXTURE_2D, tex);
        // JavaScript側の画像データをOpenGL側のテクスチャに結び付ける
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        // ミップマップを生成
        gl.generateMipmap(gl.TEXTURE_2D);
        // バインド解除
        gl.bindTexture(gl.TEXTURE_2D, null);
        resolve(tex);
    };
});
