attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
uniform mat4 viewMatrix;
uniform mat4 projMatrix;
uniform vec3 lightDir;
uniform vec3 trans;
varying vec3 viewPosition;
varying vec3 viewNormal;
varying vec4 vPosition;
varying vec3 vNormal;
varying vec2 vUV;
varying vec3 viewLightDir;

void main() {
    gl_Position = projMatrix * viewMatrix * vec4(position + trans, 1.);
    viewPosition = (viewMatrix * vec4(position, 1.)).xyz;
    viewNormal = (viewMatrix * vec4(normal, 0.)).xyz;
    vPosition = vec4(position + trans, 1.);
    vNormal = normal;
    vUV = uv;

    viewLightDir = (viewMatrix * vec4(lightDir, 0)).xyz;
}
