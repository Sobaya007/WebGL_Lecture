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
    const ext = gl.getExtension('OES_vertex_array_object');
    if(!ext){
        document.body.innerHTML = "WebGLの拡張機能が使えません。お使いのブラウザはクソ!w";
        return;
    }
    if(!gl.getExtension('OES_standard_derivatives')){
        document.body.innerHTML = "WebGLの拡張機能が使えません。お使いのブラウザはクソ!w";
        return;
    }
    const createObject = makeCreateObject(gl, ext);
    const createTexture = makeCreateTexture(gl);

    const tex0 = createTexture("./dman.png");
    const tex1 = createTexture("./skydome.png");
    const normalMap = createTexture("./dman_normal.png");

    /*
     * Cube
     */
    const cubeInfo = {};
    const cubeAttributes = [];
    for (let i = 0; i < 6; i++) {
        const s = i % 2 ? +1 : -1;
        const swap = (a, i) => [a[(0+i)%3], a[(1+i)%3], a[(2+i)%3]];
        const positions = [
            [+s, +s, +s],
            [+s, +s, -s],
            [+s, -s, +s],
            [+s, -s, -s]
        ].map(a => swap(a, Math.floor(i / 2)))
         .map(a => a.map(b => b * 0.2));
        const normals = [
            [+s,0,0],
            [+s,0,0],
            [+s,0,0],
            [+s,0,0]
        ].map(a => swap(a, Math.floor(i / 2)));
        const uvs = [
            [0,0],
            [0,1],
            [1,0],
            [1,1]
        ];
        for (let j = 0; j < 4; j++) {
            cubeAttributes.push({
                position: positions[j],
                normal: normals[j],
                uv: uvs[j],
            });
        }
    }
    const cube = createObject(cubeAttributes, "cube");

    Promise.all([cube, tex0, tex1, normalMap]).then(res => {
        const [cube, tex0, tex1, normalMap] = res;
        cubeInfo.program = cube.program;
        cubeInfo.vao = cube.vao;

        const texLocation = gl.getUniformLocation(cube.program, "tex");
        const spheremapLocation = gl.getUniformLocation(cube.program, "spheremap");
        const normalmapLocation = gl.getUniformLocation(cube.program, "normalmap");

        gl.useProgram(cube.program);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex0);
        gl.uniform1i(texLocation, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, tex1);
        gl.uniform1i(spheremapLocation, 1);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, normalMap);
        gl.uniform1i(normalmapLocation, 2);
    });

    /*
     * Sphere
     */
    const sphereAttributes = [];
    const getPoint = (t,p) => [Math.cos(t) * Math.cos(p), Math.sin(p), Math.sin(t) * Math.cos(p)].map(a => a * 4);
    const getUV = (t,p) => [t / (2 * Math.PI) + 0.5, -p / Math.PI + 0.5];
    for (let j = 0; j < 10; j++) {
        const p = Math.PI * (j / 10 - 0.5);
        const pn = Math.PI * ((j+1) / 10 - 0.5);
        for (let i = 0; i < 40; i++) {
            const t = Math.PI * 2 * i / 40;
            const tn = Math.PI * 2 * (i+1) / 40;
            sphereAttributes.push({
                position: getPoint(t, p),
                normal: getPoint(t, p),
                uv: getUV(t, p)
            });
            sphereAttributes.push({
                position: getPoint(t, pn),
                normal: getPoint(t, pn),
                uv: getUV(t, pn)
            });
            sphereAttributes.push({
                position: getPoint(tn, p),
                normal: getPoint(tn, p),
                uv: getUV(tn, p)
            });
            sphereAttributes.push({
                position: getPoint(tn, pn),
                normal: getPoint(tn, pn),
                uv: getUV(tn, pn)
            });
        }
    }
    const sphereInfo = {};
    const sphere = createObject(sphereAttributes, "sphere");
    Promise.all([sphere, tex1]).then(res => {
        const [sphere, tex1] = res;
        sphereInfo.program = sphere.program;
        sphereInfo.vao = sphere.vao;

        gl.useProgram(sphere.program);
        const texLocation = gl.getUniformLocation(sphere.program, "tex");
        gl.uniform1i(texLocation, 1);
    });

    /* Render Buffer (for Depth) */
    const renderBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 512, 512);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    /* Target Texture */
    const targetTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);

    /* Frame Buffer */
    const frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    const planeAttributes = [
        {
            position: [0, -1, 0],
            uv: [0,0]
        },
        {
            position: [+1, -1, 0],
            uv: [1,0]
        },
        {
            position: [0, +1, 0],
            uv: [0,1]
        },
        {
            position: [+1, +1, 0],
            uv: [1,1]
        },
    ];
    const planeInfo = {};
    const plane = createObject(planeAttributes, "plane");
    plane.then(plane => {
        planeInfo.program = plane.program;
        planeInfo.vao = plane.vao;

        const texLocation = gl.getUniformLocation(plane.program, "tex");
        gl.useProgram(plane.program);
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, targetTexture);
        gl.uniform1i(texLocation, 3);
    });

    /*
     * レンダリング
     */
    gl.enable(gl.DEPTH_TEST);

    const renderScene = (eye, forward, up) => {
        gl.clearColor(0,0,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        /*
         * カメラ計算
         */
        const viewMatrix = lookAt(eye, forward, up);
        const projMatrix = perspective(1, Math.PI / 3, 0.1, 5);

        if (cubeInfo.program) {
            const eyeLocation = gl.getUniformLocation(cubeInfo.program, "cameraEye");
            const viewMatrixLocation = gl.getUniformLocation(cubeInfo.program, "viewMatrix");
            const projMatrixLocation = gl.getUniformLocation(cubeInfo.program, "projMatrix");
            gl.useProgram(cubeInfo.program);
            ext.bindVertexArrayOES(cubeInfo.vao);
            gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
            gl.uniformMatrix4fv(projMatrixLocation, false, projMatrix);
            gl.uniform3f(eyeLocation, eye.x, eye.y, eye.z);
            for (let i = 0; i < 6; i++) {
                gl.drawArrays(gl.TRIANGLE_STRIP, i*4, 4);
            }
        }
        if (sphereInfo.program) {
            const viewMatrixLocation = gl.getUniformLocation(sphereInfo.program, "viewMatrix");
            const projMatrixLocation = gl.getUniformLocation(sphereInfo.program, "projMatrix");
            gl.useProgram(sphereInfo.program);
            ext.bindVertexArrayOES(sphereInfo.vao);
            gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
            gl.uniformMatrix4fv(projMatrixLocation, false, projMatrix);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4 * 40 * 10);
        }
    };

    const eye = vec3(0, 0.4, 1);
    const c = Math.cos(0.01);
    const s = Math.sin(0.01);
    const up = vec3(0,1,0);

    const render = _ => {
        requestAnimationFrame(render);

        [eye.x, eye.z] = [eye.x * c - eye.z * s, eye.x * s + eye.z * c];
        const forward = normalize(vec3(eye.x, eye.y, eye.z));

        /* テクスチャへのレンダリング */
        gl.viewport(0,0,512,512);
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        renderScene(eye, forward, up);

        /* 普通のレンダリング */
        gl.viewport(0,0,canvas.width, canvas.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        renderScene(eye, forward, up);
        if (planeInfo.program) {
            const texLocation = gl.getUniformLocation(planeInfo.program, "tex");
            gl.useProgram(planeInfo.program);
            gl.activeTexture(gl.TEXTURE3);
            gl.bindTexture(gl.TEXTURE_2D, targetTexture);
            gl.uniform1i(texLocation, 3);
            ext.bindVertexArrayOES(planeInfo.vao);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }

        gl.flush();
    };
    requestAnimationFrame(render);
})();
