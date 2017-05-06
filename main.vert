attribute vec3 position;
attribute vec3 normal;
uniform mat4 viewMatrix;
uniform mat4 projMatrix;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    gl_Position = projMatrix * viewMatrix * vec4(position, 1.);
    vPosition = position;
    vNormal = normal;
}
