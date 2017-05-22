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
    const ext2 = gl.getExtension('WEBGL_depth_texture');
    if(!ext2){
        document.body.innerHTML = "WebGLの拡張機能が使えません。お使いのブラウザはクソ!w";
        return;
    }
    if(!gl.getExtension('OES_standard_derivatives')){
        document.body.innerHTML = "WebGLの拡張機能が使えません。お使いのブラウザはクソ!w";
        return;
    }
    const createObject = makeCreateObject(gl, ext);
    const createTexture = makeCreateTexture(gl);
    const createTargetTexture = makeCreateTargetTexture(gl);

    const tex0 = createTexture("./dman.png");
    const tex1 = createTexture("./skydome.png");
    const normalMap = createTexture("./dman_normal.png");

    /*
     * Light
     */
    const lightDir = normalize(vec3(+1,+1,+2)); //原点から見てどっちに太陽があるか

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
         .map(a => a.map(b => b * 0.04));
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
    const shadowMaps = [createTargetTexture(1024, 1024), createTargetTexture(1024, 1024)];
    let shadowMapCount = 0;
    const cube = createObject(cubeAttributes, "cube");

    Promise.all([cube, tex0, tex1, normalMap]).then(res => {
        const [cube, tex0, tex1, normalMap] = res;
        cubeInfo.program = cube.program;
        cubeInfo.vao = cube.vao;

        const texLocation = gl.getUniformLocation(cube.program, "tex");
        const spheremapLocation = gl.getUniformLocation(cube.program, "spheremap");
        const normalmapLocation = gl.getUniformLocation(cube.program, "normalmap");
        const shadowMapLocation = gl.getUniformLocation(cube.program, "shadowMap");

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
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, shadowMaps[shadowMapCount].depthTexture);
        gl.uniform1i(shadowMapLocation, 3);
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

    /*
     * Plane
     */
    const planeAttributes = [
        {
            position: [-1, -1, 0],
            uv: [0,0]
        },
        {
            position: [+1, -1, 0],
            uv: [1,0]
        },
        {
            position: [-1, +1, 0],
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
        gl.uniform1i(texLocation, 3);
    });

    /*
     * Ground
     */
    const groundInfo = {};
    const ground = createObject(planeAttributes, "ground");
    ground.then(ground => {
        groundInfo.program = ground.program;
        groundInfo.vao = ground.vao;

        const shadowMapLocation = gl.getUniformLocation(ground.program, "shadowMap");
        gl.useProgram(ground.program);
        gl.uniform1i(shadowMapLocation, 3);
    });

    /*
     * レンダリング
     */
    gl.enable(gl.DEPTH_TEST);
    const cubePositions = [[0.16441745706533245,0.3567497035924085,1.4299355871757498],[0.22107383362281124,0.32619942902739546,1.2816283869232317],[0.3939196276335151,0.415863494275107,1.3858246333746618],[0.5513157547768783,0.46592835849848036,1.4188723224964148],[0.5911675974747036,0.3836908896248172,1.1698740151995963],[0.759846440150097,0.46382144039121903,1.2858609707779043],[-0.003228811359211936,0.1569040562918671,0.3969898413467263],[0.2710979560359452,0.380248473800029,0.9322269682720419],[0.2570133119775909,0.3111565574951799,0.9241822919528315],[0.29375076312540066,0.2928867363964947,1.00436539818095],[-0.19366757982067195,0.11002085198589351,0.646683474078747],[0.15145557916818198,0.3706206414252554,1.2228903252039656],[0.3070013118456492,0.13306562365825952,0.35333789843901064],[0.5675825987458892,0.42182136707499696,1.075746590214472],[0.2014821649457197,0.19256829349781457,1.0546153394590663],[0.46382979611735853,0.4575992062424532,1.6933500686548333],[0.24141237897402515,0.2633562456156172,1.4698859641406454],[0.248289762978112,0.2970664453497015,1.637929422596305],[0.2709300897171207,0.36666419961620583,1.897872601914302],[0.6614327660589808,0.4968885633770904,1.5384832860731297],[0.35306651682171714,0.1630311391963291,0.9821246229910964],[0.4307169001637813,0.20714050287589647,1.1843828172027204],[0.7267720666744382,0.49782910624055376,1.810034169886531],[0.6070668428040904,0.3459245034942089,1.530374498550839],[0.5909205656503037,0.3029454106104249,1.498081944243266],[0.5586911549988729,0.18216770805000232,1.2793344324929183],[0.7861740537541794,0.3425685674803153,1.5800115395560461],[0.9361134970170354,0.4146928451261786,1.692060715971776],[0.667580472296788,0.1018856744514351,1.0476634036112906],[0.8605483433513161,0.21569673910247084,1.2122284159478682],[1.0267496641932703,0.33225735084392966,1.383634163251792],[1.116504619837927,0.44213691828608426,1.50947844308111]];

    const renderScene = (viewMatrix, projMatrix) => {
        gl.clearColor(0,0,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (cubeInfo.program) {
            const eyeLocation = gl.getUniformLocation(cubeInfo.program, "cameraEye");
            const viewMatrixLocation = gl.getUniformLocation(cubeInfo.program, "viewMatrix");
            const projMatrixLocation = gl.getUniformLocation(cubeInfo.program, "projMatrix");
            const lightDirLocation = gl.getUniformLocation(cubeInfo.program, "lightDir");
            const transLocation = gl.getUniformLocation(cubeInfo.program, "trans");
            const shadowViewMatrixLocation = gl.getUniformLocation(cubeInfo.program, "shadowViewMatrix");
            const shadowProjMatrixLocation = gl.getUniformLocation(cubeInfo.program, "shadowProjMatrix");
            gl.useProgram(cubeInfo.program);
            ext.bindVertexArrayOES(cubeInfo.vao);
            gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
            gl.uniformMatrix4fv(projMatrixLocation, false, projMatrix);
            gl.uniformMatrix4fv(shadowViewMatrixLocation, false, shadowViewMatrix);
            gl.uniformMatrix4fv(shadowProjMatrixLocation, false, shadowProjMatrix);
            gl.uniform3f(eyeLocation, eye.x, eye.y, eye.z);
            gl.uniform3f(lightDirLocation, lightDir.x, lightDir.y, lightDir.z);
            cubePositions.forEach(pos => {
                gl.uniform3f(transLocation, pos[0], pos[1], pos[2]);
                for (let i = 0; i < 6; i++) {
                    gl.drawArrays(gl.TRIANGLE_STRIP, i*4, 4);
                }
            });
        }
        if (groundInfo.program) {
            const viewMatrixLocation = gl.getUniformLocation(groundInfo.program, "viewMatrix");
            const projMatrixLocation = gl.getUniformLocation(groundInfo.program, "projMatrix");
            const shadowViewMatrixLocation = gl.getUniformLocation(groundInfo.program, "shadowViewMatrix");
            const shadowProjMatrixLocation = gl.getUniformLocation(groundInfo.program, "shadowProjMatrix");
            gl.useProgram(groundInfo.program);
            ext.bindVertexArrayOES(groundInfo.vao);
            gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
            gl.uniformMatrix4fv(projMatrixLocation, false, projMatrix);
            gl.uniformMatrix4fv(shadowViewMatrixLocation, false, shadowViewMatrix);
            gl.uniformMatrix4fv(shadowProjMatrixLocation, false, shadowProjMatrix);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
    };

    const eye = vec3(1, 1.6, 3);
    const c = Math.cos(0.003);
    const s = Math.sin(0.003);
    const up = vec3(0,1,0);

    const projMatrix = perspective(1, Math.PI / 3, 0.1, 8);

    const shadowProjMatrix = ortho(3.5, 3.5, -2,5);
    let shadowViewMatrix = lookAt(
        lightDir,
        lightDir,
        up);
    const render = _ => {
        requestAnimationFrame(render);

        [lightDir.x, lightDir.z] = [lightDir.x * c - lightDir.z * s, lightDir.x * s + lightDir.z * c];
        const forward = normalize(vec3(eye.x, eye.y, eye.z));
        const viewMatrix = lookAt(eye, forward, up);
        shadowViewMatrix = lookAt(
            lightDir,
            lightDir,
            up);

        /* Shadow mapへのレンダリング */
        gl.viewport(0,0,1024,1024);
        gl.bindFramebuffer(gl.FRAMEBUFFER, shadowMaps[shadowMapCount].frameBuffer);
        renderScene(shadowViewMatrix, shadowProjMatrix);

        /* 普通のレンダリング */
        gl.viewport(0,0,canvas.width, canvas.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        renderScene(viewMatrix, projMatrix);
        if (sphereInfo.program) {
            const viewMatrixLocation = gl.getUniformLocation(sphereInfo.program, "viewMatrix");
            const projMatrixLocation = gl.getUniformLocation(sphereInfo.program, "projMatrix");
            const rotLocation = gl.getUniformLocation(sphereInfo.program, "rot");
            gl.useProgram(sphereInfo.program);
            ext.bindVertexArrayOES(sphereInfo.vao);
            gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
            gl.uniformMatrix4fv(projMatrixLocation, false, projMatrix);
            gl.uniform2f(rotLocation, lightDir.x, lightDir.z);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4 * 40 * 10);
        }
        if (planeInfo.program) {
            const transLocation = gl.getUniformLocation(planeInfo.program, "trans");
            const texLocation = gl.getUniformLocation(planeInfo.program, "tex");
            gl.useProgram(planeInfo.program);

            gl.activeTexture(gl.TEXTURE3);
            gl.bindTexture(gl.TEXTURE_2D, shadowMaps[shadowMapCount].colorTexture);
            gl.uniform2f(transLocation, 0, 0);
            ext.bindVertexArrayOES(planeInfo.vao);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            gl.activeTexture(gl.TEXTURE3);
            gl.bindTexture(gl.TEXTURE_2D, shadowMaps[shadowMapCount].depthTexture);
            gl.uniform2f(transLocation, 0, 0.6);
            ext.bindVertexArrayOES(planeInfo.vao);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }

        gl.flush();

        shadowMapCount = 1 - shadowMapCount;
    };
    requestAnimationFrame(render);
})();


