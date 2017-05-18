precision mediump float;

uniform vec3 cameraEye;
uniform sampler2D tex;
uniform sampler2D spheremap;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUV;

#define PI 3.1415926535

void main() {
    const vec3 lightDir = normalize(vec3(+1,-1,0));
    vec3 toCamera = normalize(vPosition - cameraEye);
    vec3 lightRef = normalize(reflect(lightDir, normalize(vNormal)));
    float amb = 0.2;
    float dif = max(0., dot(normalize(vNormal), lightDir));
    float spc = pow(max(0., dot(toCamera, lightRef)), 10.);
    vec3 color = texture2D(tex, vUV).rgb;

    vec3 cameraRef = normalize(reflect(toCamera, normalize(vNormal)));
    float t = atan(cameraRef.z, cameraRef.x);
    float p = atan(cameraRef.y, length(cameraRef.xz));
    vec3 refColor = texture2D(spheremap, vec2(t / PI / 2. + 0.5, -p / PI + 0.5)).rgb;

    gl_FragColor = vec4(vec3((amb + dif) * color + spc * 0.5), 1);
    gl_FragColor.rgb = 0.8 * gl_FragColor.rgb + refColor * 0.2;
}
