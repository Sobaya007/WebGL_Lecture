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
     * 行列計算
     */

    //OpenGLの仕様上、見た目は転置してるように見えるけどまぁそういうもん。
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

    /*
     * レンダリング
     */
    gl.enable(gl.DEPTH_TEST);
    let m1 = mTranslate(0.5, 0, 0);
    let m2 = mTranslate(0,0,0);
    const R = mRotate(0,0,1, 0.1);
    const render = _ => {
        requestAnimationFrame(render);
        gl.clearColor(0,0,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
    };
})();
