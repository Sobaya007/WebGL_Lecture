attribute vec3 position;
attribute vec2 uv;

uniform vec2 trans;

varying vec2 vUV;

void main() {
    gl_Position = vec4(position * 0.25 + 0.75 - vec3(trans, 0), 1);
    vUV = uv;
}
