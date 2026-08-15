import {
    addItem,
    inventory,
    updateHotbar
} from "./inventory.js";

function countItem(type) {

    let total = 0;

    for (const slot of inventory.slots) {

        if (!slot) {
            continue;
        }

        if (slot.type === type) {

            total += slot.amount;

        }

    }

    return total;
}

function removeItem(type, amount) {

    for (const slot of inventory.slots) {

        if (!slot) {
            continue;
        }

        if (slot.type !== type) {
            continue;
        }

        const removeAmount =
            Math.min(
                amount,
                slot.amount
            );

        slot.amount -= removeAmount;

        amount -= removeAmount;

        if (slot.amount <= 0) {

            const index =
                inventory.slots.indexOf(slot);

            inventory.slots[index] = null;

        }

        if (amount <= 0) {
            break;
        }

    }

    updateHotbar();
}

export function craftPickaxe() {

    if (
        countItem("stone") < 3 ||
        countItem("wood") < 2
    ) {

        return;
    }

    removeItem("stone", 3);

    removeItem("wood", 2);

    addItem("pickaxe", 1);
}

export function craftAxe() {

    if (
        countItem("wood") < 3 ||
        countItem("stone") < 2
    ) {

        return;
    }

    removeItem("wood", 3);

    removeItem("stone", 2);

    addItem("axe", 1);
}

export function craftSword() {

    if (
        countItem("stone") < 2 ||
        countItem("wood") < 1
    ) {

        return;
    }

    removeItem("stone", 2);

    removeItem("wood", 1);

    addItem("sword", 1);
}
let craftingOpen = false;



export function isCraftingTableOpen() {

    return craftingOpen;
}
export function craftCraftingTable() {

    let wood = 0;

    for (const slot of inventory.slots) {

        if (
            slot &&
            slot.type === "wood"
        ) {

            wood += slot.amount;
        }
    }

    if (wood < 4) {
        return;
    }

    let remaining = 4;

    for (const slot of inventory.slots) {

        if (
            !slot ||
            slot.type !== "wood"
        ) {
            continue;
        }

        const remove =
            Math.min(
                remaining,
                slot.amount
            );

        slot.amount -= remove;

        remaining -= remove;

        if (slot.amount <= 0) {

            const index =
                inventory.slots.indexOf(slot);

            inventory.slots[index] =
                null;
        }

        if (remaining <= 0) {
            break;
        }
    }

    addItem(
        "crafting_table",
        1
    );

    updateHotbar();
}
export function openCraftingTable() {

    const menu =
        document.getElementById(
            "basicCraftMenu"
        );

    menu.style.display =
        "block";
}

export function closeCraftingTable() {

    const menu =
        document.getElementById(
            "basicCraftMenu"
        );

    menu.style.display =
        "none";
}