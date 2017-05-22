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

const makeCreateTargetTexture = gl => (width,height) => {

    /* Target Texture (for Color) */
    const colorTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, colorTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);
    /* Target Texture (for Depth) */
    const depthTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);

    /* Frame Buffer */
    const frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTexture, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return {
        frameBuffer: frameBuffer,
        colorTexture: colorTexture,
        depthTexture: depthTexture
    };
};
