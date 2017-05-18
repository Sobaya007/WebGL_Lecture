/*
 * Shader Programの作成
 */
const createShader = (gl, path) => new Promise((resolve, reject) => {
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

const createShaderProgram = (gl, shaderName) => new Promise((resolve, reject) => {
    const program = gl.createProgram();
    // Vertex Shaderを作成
    const promise = createShader(gl, shaderName + ".vert").then(vs => {
        // ProgramとVertex Shaderを結び付ける
        gl.attachShader(program, vs);
        // Fragment Shaderを作成
        return createShader(gl, shaderName + ".frag");
    }).then(fs => {
        // ProgramとFragment Shaderを結び付ける
        gl.attachShader(program, fs);
        // リンク
        gl.linkProgram(program);

        resolve(program);
    });
});
