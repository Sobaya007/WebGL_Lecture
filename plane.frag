precision mediump float;

varying vec2 vUV;
uniform sampler2D tex;

void main() {
    vec2 uv = vUV;
    gl_FragColor = texture2D(tex, uv);
}
