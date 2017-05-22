precision mediump float;

varying vec2 vUV;
uniform sampler2D tex;

void main() {
    vec2 uv = vUV;
    uv.x = uv.x * .5 + .5;
    gl_FragColor = texture2D(tex, uv);
    gl_FragColor.rgb = vec3(1) - gl_FragColor.rgb;
}
