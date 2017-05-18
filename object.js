const makeCreateObject = (gl, ext) => (attributeList, shaderName) => new Promise((resolve, reject) => {
    const vbos = {};
    Object.keys(attributeList[0]).map(attributeName => {
        const attributeObjectList = attributeList.map(a => a[attributeName]);
        const size = Object.keys(attributeObjectList[0]).length;
        const attributeListFlatten = Array.prototype.concat.apply([], attributeObjectList.map(obj => Object.keys(obj).map(k => obj[k])));
        const vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attributeListFlatten), gl.STATIC_DRAW);
        vbos[attributeName] = {
            vbo: vbo,
            size: size
        };
    });

    createShaderProgram(gl, shaderName).then(program => {
        /*
         * Vertex BufferとShader Programの結び付け
         */
        const vao = ext.createVertexArrayOES();
        ext.bindVertexArrayOES(vao);
        Object.keys(vbos).forEach(attributeName => {
            const aLoc = gl.getAttribLocation(program, attributeName);
            gl.enableVertexAttribArray(aLoc);
            gl.bindBuffer(gl.ARRAY_BUFFER, vbos[attributeName].vbo);
            gl.vertexAttribPointer(aLoc, vbos[attributeName].size, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        });

        resolve({program: program, vao: vao});
    });
});
