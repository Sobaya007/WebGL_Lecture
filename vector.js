/*
 * ベクトル計算
 */
const vec3 = (x,y,z) => {
    return {
        x: x,
        y: y,
        z: z
    };
};

const len = v => Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);

const normalize = v => {
    const l = len(v);
    return {
        x: v.x / l,
        y: v.y / l,
        z: v.z / l
    };
};

const dot = (a,b) => a.x * b.x + a.y * b.y + a.z * b.z;

const cross = (a,b) => vec3(
    a.y * b.z - a.z * b.y,
    a.z * b.x - a.x * b.z,
    a.x * b.y - a.y * b.x
);
