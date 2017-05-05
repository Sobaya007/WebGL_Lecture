attribute vec2 position;
uniform vec2 translation;

void main() {
    gl_Position = vec4(position + translation, 0., 1.);
}
