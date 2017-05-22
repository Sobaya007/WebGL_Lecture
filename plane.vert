attribute vec3 position;
attribute vec2 uv;

varying vec2 vUV;

void main() {
    gl_Position = vec4(position, 1);
    vUV = uv;
}
