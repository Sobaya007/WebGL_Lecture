(_ => {
    /*
     * Canvasの設定
     * サイズ整えます
     */
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = Math.min(window.innerWidth, window.innerHeight);
    document.body.appendChild(canvas);
    const gl = canvas.getContext("webgl");
    if (!gl) {
        document.body.innerHTML = "WebGL使えません。お使いのブラウザはクソ!w";
        return;
    }

    /*
     * Vertex Buffer
     */
    const vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0, 0.5, 0.2,
        0.5, -0.5, 0.2,
        -0.5, -0.5, 0.2,
        0.0, -0.5, 0.8,
        0.5, 0.5, 0.8,
        -0.5, 0.5, 0.8
    ]), gl.STATIC_DRAW);

    /*
     * Shader Programの作成
     */
    const createShader = path => {
        return new Promise((resolve, reject) => {
            // ファイル拡張子からShaderの種類を判定
            const shaderType = (_ => {
                const extension = path.split(".")[1];
                switch (extension) {
                    case "vert":
                        return gl.VERTEX_SHADER;
                    case "frag":
                        return gl.FRAGMENT_SHADER;
                }
            })();

            // shaderファイルを取得
            const xhr = new XMLHttpRequest();
            xhr.open("GET", path, true);
            xhr.addEventListener("load", event => {
                const code = event.target.response;
                // Shaderのもとを作成
                const shader = gl.createShader(shaderType);
                // Shaderとソースコードを結び付ける
                gl.shaderSource(shader, code);

                // Shaderをコンパイル
                gl.compileShader(shader);

                if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    resolve(shader);
                } else {
                    console.error(gl.getShaderInfoLog(shader));
                    reject();
                }
            });
            xhr.send(null);
        });
    };

    const program = gl.createProgram();
    // Vertex Shaderを作成
    createShader("main.vert").then(vs => {
        // ProgramとVertex Shaderを結び付ける
        gl.attachShader(program, vs);
        // Fragment Shaderを作成
        return createShader("main.frag");
    }).then(fs => {
        // ProgramとFragment Shaderを結び付ける
        gl.attachShader(program, fs);
        // リンク
        gl.linkProgram(program);

        // 使用開始
        gl.useProgram(program);

        /*
         * Vertex BufferとShader Programの結び付け
         */
        const attributeLocation = gl.getAttribLocation(program, "position");
        gl.enableVertexAttribArray(attributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
        gl.vertexAttribPointer(attributeLocation, 3, gl.FLOAT, false, 0, 0);

        requestAnimationFrame(render);
    });

    /*
     * レンダリング
     */
    gl.enable(gl.DEPTH_TEST);
    const render = _ => {
        requestAnimationFrame(render);
        gl.clearColor(0,0,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        const colorLocation = gl.getUniformLocation(program, "color");
        const translationLocation = gl.getUniformLocation(program, "translation");
        gl.uniform3f(colorLocation, 1,0,0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.uniform3f(colorLocation, 0,0,1);
        gl.drawArrays(gl.TRIANGLES, 3, 3);
        gl.flush();
    };
})();
