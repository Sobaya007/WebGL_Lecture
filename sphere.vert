attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
uniform mat4 viewMatrix;
uniform mat4 projMatrix;
varying vec3 vNormal;
varying vec2 vUV;

void main() {
    gl_Position = projMatrix * viewMatrix * vec4(position, 1.);
    vNormal = normal;
    vUV = uv;
}
