#extension GL_OES_standard_derivatives : enable
precision mediump float;

uniform sampler2D tex;
uniform sampler2D spheremap;
uniform sampler2D normalmap;
uniform sampler2D shadowMap;
uniform mat4 shadowViewMatrix;
uniform mat4 shadowProjMatrix;
varying vec3 viewPosition;
varying vec3 viewNormal;
varying vec4 vPosition;
varying vec3 vNormal;
varying vec2 vUV;
varying vec3 viewLightDir;

#define PI 3.1415926535

void main() {
    float tanx = -dFdy(vUV.t) * viewNormal.z;
    float tany = dFdx(vUV.t) * viewNormal.z;
    float tanz = -(viewNormal.x * tanx + viewNormal.y * tany);
    vec3 tan = normalize(vec3(tanx, tany, tanz));
    vec3 bin = normalize(cross(viewNormal, tan));
    vec4 normalElements = texture2D(normalmap, vUV) - vec4(0.5);
    const float scale = 10.;
    vec3 normal = normalize(
            tan * normalElements.r * scale +
            bin * normalElements.g * scale +
            viewNormal * normalElements.b);

    vec3 toCamera = normalize(viewPosition);
    vec3 lightRef = normalize(reflect(viewLightDir,normal));
    float amb = 0.2;
    float dif = max(0., dot(normal, viewLightDir));
    float spc = pow(max(0., dot(toCamera, lightRef)), 10.);
    vec3 color = texture2D(tex, vUV).rgb;

    vec3 cameraRef = normalize(reflect(toCamera, normalize(vNormal)));
    float t = atan(cameraRef.z, cameraRef.x);
    float p = atan(cameraRef.y, length(cameraRef.xz));
    vec3 refColor = texture2D(spheremap, vec2(t / PI / 2. + 0.5, -p / PI + 0.5)).rgb;

    gl_FragColor = vec4(vec3((amb + dif) * color + spc * 0.5), 1);
    gl_FragColor.rgb = 0.8 * gl_FragColor.rgb + refColor * 0.2;

    // Shadow!! FOOOOOOOOOOOOOOOOOOOOOOOO
    vec4 pos4FromLight = shadowProjMatrix * shadowViewMatrix * vPosition;
    vec3 posFromLight = pos4FromLight.xyz / pos4FromLight.w;
    vec2 shadowUV = posFromLight.xy * 0.5 + 0.5;
    if (0. <= shadowUV.x && shadowUV.x <= 1.
            && 0. <= shadowUV.y && shadowUV.y <= 1.) {
        float shadowMapZ = texture2D(shadowMap, shadowUV).r;
        float zFromLight = posFromLight.z * 0.5 + 0.5;

        if (zFromLight > shadowMapZ + 0.01) {
            gl_FragColor.rgb *= 0.5;
        }
    }
}
