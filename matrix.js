/*
 * 行列計算
 */

//OpenGLの仕様上、見た目は転置してるように見えるけどまぁそういうもん。
const mTranslate = (x,y,z) => [
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    x,y,z,1
];

const mRotate = (x,y,z,t) => {
    const c = Math.cos(t);
    const s = Math.sin(t);
    return [
        x*x*(1-c)+c, x*y*(1-c)+s*z, z*x*(1-c)-s*y, 0,
        x*y*(1-c)-s*z, y*y*(1-c)+c, y*z*(1-c)+s*x, 0,
        z*x*(1-c)+s*y, y*z*(1-c)-s*x, z*z*(1-c)+c, 0,
        0,0,0,1
    ];
};
const mScale = (x,y,z) => [
    x,0,0,0,
    0,y,0,0,
    0,0,z,0,
    0,0,0,1
];

const lookAt = (eye, forward, up) => {
    const side = normalize(cross(up, forward));
    up = normalize(cross(forward, side));
    return [
        side.x, up.x, forward.x, 0,
        side.y, up.y, forward.y, 0,
        side.z, up.z, forward.z, 0,
        -dot(eye, side), -dot(eye, up), -dot(eye, forward), 1
    ];
};

const perspective = (asp, fov, near, far) => {
    const t = Math.tan(fov / 2);
    return [
        1 / (asp * t),0,0,0,
        0,1/t,0,0,
        0,0,(near+far) / (near-far), -1,
        0,0,2*near*far/(near-far),0
    ];
};

const mult = (a,b) => {
    const res = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            let m = 0;
            for (let k = 0; k < 4; k++) {
                m += a[i*4+k] * b[k*4+j];
            }
            res.push(m);
        }
    }
    return res;
};
