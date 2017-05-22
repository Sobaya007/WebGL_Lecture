precision mediump float;
uniform sampler2D shadowMap;
uniform mat4 shadowViewMatrix;
uniform mat4 shadowProjMatrix;
varying vec4 vPosition;
varying vec2 vUV;

const float UNI = 0.02;

void main() {
    vec2 uv = vUV;
    uv = mod(uv / UNI, 1.) - .5;
    if (uv.x * uv.y > 0.) {
        gl_FragColor.rgb = vec3(0.5);
    } else {
        gl_FragColor.rgb = vec3(0.8);
    }
    gl_FragColor.a = 1.;

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
