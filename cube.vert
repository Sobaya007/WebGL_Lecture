attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
uniform mat4 viewMatrix;
uniform mat4 projMatrix;
varying vec3 viewPosition;
varying vec3 viewNormal;
varying vec3 vNormal;
varying vec2 vUV;
varying vec3 viewLightDir;

void main() {
    gl_Position = projMatrix * viewMatrix * vec4(position, 1.);
    viewPosition = (viewMatrix * vec4(position, 1.)).xyz;
    viewNormal = (viewMatrix * vec4(normal, 0.)).xyz;
    vNormal = normal;
    vUV = uv;

    vec3 lightDir = normalize(vec3(+1,-1,0));
    viewLightDir = (viewMatrix * vec4(lightDir, 0)).xyz;
}
