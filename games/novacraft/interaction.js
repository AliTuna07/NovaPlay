import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { createBlock, blockTypes } from "./blocks.js";

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(0, 0);
let preview;

function getHit(camera, blocks) {
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(blocks, false);
    return hits.length > 0 ? hits[0] : null;
}

function removeBlock(scene, blocks, block, inventory, updateInventory) {
    const type = block.userData?.type;
    if (type?.name && type.name !== "Water") {
        inventory[type.name] = (inventory[type.name] ?? 0) + 1;
        updateInventory();
    }

    scene.remove(block);
    const index = blocks.indexOf(block);
    if (index > -1) {
        blocks.splice(index, 1);
    }
}

function addBlock(scene, blocks, hit, selectedBlock, inventory, updateInventory) {
    const position = hit.object.position.clone().add(hit.face.normal);
    if (blocks.some(block => block.position.equals(position))) {
        return;
    }

    const type = blockTypes[selectedBlock.index];
    if ((inventory[type.name] ?? 0) <= 0) {
        return;
    }

    inventory[type.name] -= 1;
    updateInventory();

    const newBlock = createBlock(position.x, position.y, position.z, type);
    scene.add(newBlock);
}

function updatePreview(camera, blocks, selectedBlock) {
    if (!preview) {
        return;
    }

    const hit = getHit(camera, blocks);
    if (hit) {
        const targetPosition = hit.object.position.clone().add(hit.face.normal);
        preview.position.copy(targetPosition);
        preview.material.color.setHex(blockTypes[selectedBlock.index].color);
        preview.visible = true;
    } else {
        preview.visible = false;
    }
}

export function setupInteraction(camera, scene, blocks, selectedBlock, inventory, updateInventory, updateLabel) {
    preview = new THREE.Mesh(
        new THREE.BoxGeometry(1.02, 1.02, 1.02),
        new THREE.MeshBasicMaterial({
            color: 0xffffff,
            opacity: 0.22,
            transparent: true,
            depthWrite: false
        })
    );
    preview.visible = false;
    scene.add(preview);

    window.addEventListener("mousedown", e => {
        const hit = getHit(camera, blocks);
        if (!hit) {
            return;
        }

        if (e.button === 0) {
            removeBlock(scene, blocks, hit.object, inventory, updateInventory);
        } else if (e.button === 2) {
            addBlock(scene, blocks, hit, selectedBlock, inventory, updateInventory);
        }

        updatePreview(camera, blocks, selectedBlock);
    });

    window.addEventListener("wheel", e => {
        selectedBlock.index = (selectedBlock.index + (e.deltaY > 0 ? 1 : -1) + blockTypes.length) % blockTypes.length;
        updateLabel();
        updateInventory();
        updatePreview(camera, blocks, selectedBlock);
    }, { passive: true });

    window.addEventListener("contextmenu", e => {
        e.preventDefault();
    });

    window.addEventListener("mousemove", () => {
        updatePreview(camera, blocks, selectedBlock);
    });
}
