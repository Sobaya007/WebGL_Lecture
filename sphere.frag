precision mediump float;

uniform sampler2D tex;
varying vec3 vNormal;
varying vec2 vUV;
void main() {
    gl_FragColor = texture2D(tex, vUV);
}
