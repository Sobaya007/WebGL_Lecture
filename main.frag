precision mediump float;

uniform vec3 color;
uniform vec3 cameraEye;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    const vec3 lightDir = normalize(vec3(1,1,1));
    vec3 toCamera = normalize(vPosition - cameraEye);
    vec3 lightRef = reflect(lightDir, normalize(vNormal));
    float amb = 0.1;
    float dif = max(0., dot(normalize(vNormal), lightDir));
    float spc = pow(max(0., dot(toCamera, lightRef)), 10.);
    gl_FragColor = vec4((amb + dif) * color + spc * 0.5, 1);
}
