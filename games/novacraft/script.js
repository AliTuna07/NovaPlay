import { createWorld } from "./world.js";
import { updatePlayer, jump } from "./player.js";
import { setupInteraction } from "./interaction.js";
import { setupCameraControl } from "./camera.js";
import { setupControls } from "./controls.js";
import { blockTypes } from "./blocks.js";
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x87ceeb, 25, 120);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);
setupCameraControl(camera);
camera.position.set(0, 16, 20);
camera.lookAt(0, 8, 0);

const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("game"),
    antialias: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x87ceeb);

const ambient = new THREE.AmbientLight(0xffffff, 0.65);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(5, 10, 5);
scene.add(sun);

const selectedBlock = { index: 0 };
const blockName = document.getElementById("block-name");
const inventoryPanel = document.getElementById("inventory-panel");

const inventory = {
    Grass: 64,
    Dirt: 32,
    Stone: 16,
    Wood: 8,
    Leaf: 8
};

function updateBlockLabel() {
    blockName.textContent = blockTypes[selectedBlock.index].name;
}

function buildInventoryUI() {
    if (!inventoryPanel) {
        return;
    }

    inventoryPanel.innerHTML = blockTypes.map((type, index) => {
        const count = inventory[type.name] ?? 0;
        return `
            <button class="inventory-slot${selectedBlock.index === index ? " active" : ""}" data-index="${index}" type="button">
                <span>${type.name}</span>
                <strong>${count}</strong>
            </button>
        `;
    }).join("");

    inventoryPanel.querySelectorAll(".inventory-slot").forEach(button => {
        button.addEventListener("click", () => {
            selectedBlock.index = Number(button.dataset.index);
            updateBlockLabel();
            updateInventoryUI();
        });
    });
}

function updateInventoryUI() {
    if (!inventoryPanel) {
        return;
    }

    inventoryPanel.querySelectorAll(".inventory-slot").forEach(button => {
        const typeName = blockTypes[Number(button.dataset.index)].name;
        button.querySelector("strong").textContent = inventory[typeName] ?? 0;
        button.classList.toggle("active", Number(button.dataset.index) === selectedBlock.index);
    });
}

updateBlockLabel();
buildInventoryUI();

const blocks = createWorld(scene);
const updateControls = setupControls(camera, blocks);
setupInteraction(camera, scene, blocks, selectedBlock, inventory, updateInventoryUI, updateBlockLabel);

function animate() {
    requestAnimationFrame(animate);
    updateControls();
    updatePlayer(camera, blocks);
    renderer.render(scene, camera);
}

animate();

window.addEventListener("keydown", e => {
    if (e.code === "Space") {
        jump();
    }
});

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});