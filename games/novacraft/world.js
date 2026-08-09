import { createWater } from "./water.js";
import { createTree } from "./trees.js";
import { createBlock, blockTypes, blocks } from "./blocks.js";

function getHeight(x, z) {
    const noise =
        Math.sin(x * 0.18) * 5 +
        Math.cos(z * 0.2) * 5 +
        Math.sin((x + z) * 0.14) * 4 +
        Math.sin(x * 0.08) * 2;
    return Math.max(0, Math.floor(noise + 8));
}

export function createWorld(scene) {
    const size = 28;

    for (let x = -size; x <= size; x++) {
        for (let z = -size; z <= size; z++) {
            const height = getHeight(x, z);
            const topType = height > 1 ? blockTypes[0] : blockTypes[1];

            for (let y = 0; y <= height; y++) {
                let type = blockTypes[2];
                if (y === height) {
                    type = topType;
                } else if (y >= height - 2) {
                    type = blockTypes[1];
                }

                const block = createBlock(x, y, z, type);
                scene.add(block);
            }

            if (height <= 1) {
                createWater(scene, x, 1, z);
            }

            if (height > 1 && Math.random() < 0.08) {
                createTree(scene, blocks, x, height + 1, z);
            }
        }
    }

    return blocks;
}
