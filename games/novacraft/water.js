import { createBlock } from "./blocks.js";

export function createWater(scene, x, y, z) {
    const water = createBlock(x, y, z, {
        name: "Water",
        color: 0x3399ff,
        transparent: true,
        opacity: 0.55
    });
    water.material.transparent = true;
    water.material.opacity = 0.55;
    scene.add(water);
}