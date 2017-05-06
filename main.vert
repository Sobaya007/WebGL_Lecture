attribute vec3 position;
uniform mat4 viewMatrix;
uniform mat4 projMatrix;

void main() {
    gl_Position = projMatrix * viewMatrix * vec4(position, 1.);
}
