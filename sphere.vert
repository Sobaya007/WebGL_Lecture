attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
uniform mat4 viewMatrix;
uniform mat4 projMatrix;
uniform vec2 rot;
varying vec3 vNormal;
varying vec2 vUV;

void main() {
    gl_Position = projMatrix * viewMatrix * vec4(vec3(position.x * rot.x - position.z * rot.y, position.y, position.x * rot.y + position.z * rot.x), 1.);
    vNormal = normal;
    vUV = uv;
}
