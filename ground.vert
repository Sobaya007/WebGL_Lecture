attribute vec3 position;
attribute vec2 uv;

uniform mat4 viewMatrix;
uniform mat4 projMatrix;

varying vec4 vPosition;
varying vec2 vUV;

void main() {
    vec3 pos = position * 10.;
    pos.yz = vec2(-pos.z, pos.y);
    pos.y -= .5;
    gl_Position = projMatrix * viewMatrix * vec4(pos, 1);

    vPosition = vec4(pos, 1);
    vUV = uv;
}
