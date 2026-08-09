import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export const blocks = [];

export const blockTypes = [
    { name: "Grass", color: 0x55aa55 },
    { name: "Dirt", color: 0x8b5a2b },
    { name: "Stone", color: 0x999999 },
    { name: "Wood", color: 0x8b4513 },
    { name: "Leaf", color: 0x228b22 },
    { name: "Water", color: 0x3399ff, transparent: true, opacity: 0.55 }
];

const geometry = new THREE.BoxGeometry(1, 1, 1);
const materials = new Map();

function getMaterial(type) {
    const key = `${type.color}-${type.transparent || false}-${type.opacity ?? 1}`;
    if (!materials.has(key)) {
        const material = new THREE.MeshStandardMaterial({
            color: type.color,
            transparent: !!type.transparent,
            opacity: type.opacity ?? 1,
            flatShading: false
        });
        materials.set(key, material);
    }
    return materials.get(key);
}

export function createBlock(x, y, z, typeIndex = 0) {
    let type;
    if (typeof typeIndex === "number" && Number.isInteger(typeIndex) && typeIndex >= 0 && typeIndex < blockTypes.length) {
        type = blockTypes[typeIndex];
    } else if (typeof typeIndex === "number") {
        type = { name: "Custom", color: typeIndex, transparent: false, opacity: 1 };
    } else {
        type = typeIndex;
    }
    const material = getMaterial(type);
    const block = new THREE.Mesh(geometry, material);
    block.position.set(x, y, z);
    block.userData = { type };
    blocks.push(block);
    return block;
}
