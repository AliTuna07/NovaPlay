import {
    update3DInventory
} from "./inventory3d.js";
// =====================================
// YENİ OYUNCU ENVANTERİ
// =====================================
export const inventory = {

    slots: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
    ],

    selectedSlot: 0

};


// =====================================
// BLOK İKONLARI
// =====================================
// =====================================
// ⚔️ EŞYA TÜRLERİ
// =====================================

export const itemTypes = {
    sword: {
        name: "Kılıç",
        maxStack: 1
    },

    pickaxe: {
        name: "Kazma",
        maxStack: 1
    },

    axe: {
        name: "Balta",
        maxStack: 1
    }
};



// =====================================
// SLOT SEÇ
// =====================================

export function selectSlot(index) {

    if (
        index < 0 ||
        index >= 9
    ) {

        return;

    }

    inventory.selectedSlot =
        index;

    updateHotbar();

}


// =====================================
// BLOK EKLE
// =====================================

export function addBlock(
    type,
    amount = 1
) {

    // Önce aynı türü bul
    for (
        const slot of inventory.slots
    ) {

        if (
            slot &&
            slot.type === type &&
            slot.amount < 64
        ) {

            slot.amount += amount;

            updateHotbar();

            return true;

        }

    }


    // Boş slot bul
    for (
        let i = 0;
        i < inventory.slots.length;
        i++
    ) {

        if (
            !inventory.slots[i]
        ) {

            inventory.slots[i] = {

                type: type,

                amount: amount

            };

            updateHotbar();

            return true;

        }

    }


    return false;

}
// =====================================
// 🥩 GENEL EŞYA EKLE
// =====================================

export function addItem(
    type,
    amount = 1
) {
const itemInfo =
    itemTypes[type];

const maxStack =
    itemInfo?.maxStack ?? 64;
    // Önce aynı türü bul
    for (
        const slot of inventory.slots
    ) {

        if (
            slot &&
            slot.type === type &&
            slot.amount < maxStack
        ) {

            const space =
                maxStack - slot.amount;

            const addAmount =
                Math.min(
                    amount,
                    space
                );

            slot.amount +=
                addAmount;

            amount -=
                addAmount;

            if (amount <= 0) {

                updateHotbar();

                return true;

            }

        }

    }


    // Boş slot bul
    for (
        let i = 0;
        i < inventory.slots.length;
        i++
    ) {

        if (
            !inventory.slots[i]
        ) {

            inventory.slots[i] = {

                type: type,

                amount: amount

            };

            updateHotbar();

            return true;

        }

    }


    updateHotbar();

    return false;
}

// =====================================
// BLOK ÇIKAR
// =====================================

export function removeBlock(
    type,
    amount = 1
) {

    const slot =
        inventory.slots.find(
            slot =>
                slot &&
                slot.type === type &&
                slot.amount >= amount
        );


    if (!slot) {

        return false;

    }


    slot.amount -= amount;


    if (
        slot.amount <= 0
    ) {

        const index =
            inventory.slots.indexOf(
                slot
            );

        inventory.slots[index] =
            null;

    }


    updateHotbar();

    return true;

}


// =====================================
// SEÇİLİ BLOK
// =====================================

export function getSelectedBlock() {

    return inventory.slots[
        inventory.selectedSlot
    ];

}


// =====================================
// HOTBAR
// =====================================

export function updateHotbar() {

    const slots =
        document.querySelectorAll(".slot");

    slots.forEach((element, index) => {

        const data =
            inventory.slots[index];

        element.classList.toggle(
            "selected",
            index === inventory.selectedSlot
        );


        // Eski emoji / ikonları temizle
        const oldIcon =
            element.querySelector(".block-icon");

        if (oldIcon) {
            oldIcon.remove();
        }


        // Eski 3D canvası temizle
        const oldCanvas =
            element.querySelector(".block-preview");

        if (oldCanvas) {
            oldCanvas.remove();
        }


        // Eski miktarı temizle
        const oldAmount =
            element.querySelector(".item-count");

        if (oldAmount) {
            oldAmount.remove();
        }


        if (!data) {
            return;
        }


        // Sadece miktar
        const counter =
            document.createElement("span");

        counter.className =
            "item-count";

        counter.textContent =
            data.amount;

        element.appendChild(
            counter
        );

    });


    // Gerçek 3D blokları oluştur
    update3DInventory(
        inventory
    );

}
// =====================================
// 1-9 SLOT SEÇİMİ
// =====================================

window.addEventListener(
    "keydown",
    (event) => {

        const number =
            Number(event.key);


        if (
            number >= 1 &&
            number <= 9
        ) {

            selectSlot(
                number - 1
            );

        }

    }
);


// =====================================
// E ENVANTER
// =====================================

let inventoryOpen = false;


window.addEventListener(
    "keydown",
    (event) => {

        if (
            event.code !== "KeyE"
        ) {

            return;

        }


        inventoryOpen =
            !inventoryOpen;


        const inventoryElement =
            document.getElementById(
                "inventory"
            );


        if (
            inventoryOpen
        ) {

            inventoryElement.style.display =
                "block";


            document.exitPointerLock();

        }

        else {

            inventoryElement.style.display =
                "none";


            const canvas =
                document.querySelector(
                    "canvas"
                );


            if (canvas) {

                canvas.requestPointerLock();

            }

        }

    }
);
