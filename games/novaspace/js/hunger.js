// =====================================
// 🍗 NOVACRAFT AÇLIK SİSTEMİ
// =====================================

export const hunger = {

    value: 20,

    max: 20,

    // Açlığın azalması için sayaç
    timer: 0,

    // Kaç saniyede 1 açlık azalacak
    interval: 30

};


// =====================================
// 🍗 AÇLIK ARTIR
// =====================================

export function addHunger(amount) {

    hunger.value += amount;

    hunger.value =
        Math.min(
            hunger.value,
            hunger.max
        );

    updateHungerBar();

}


// =====================================
// 🍗 AÇLIK AZALT
// =====================================

export function removeHunger(amount) {

    hunger.value -= amount;

    hunger.value =
        Math.max(
            hunger.value,
            0
        );

    updateHungerBar();

}


// =====================================
// ⏱️ AÇLIĞI GÜNCELLE
// =====================================

export function updateHunger(delta) {

    hunger.timer += delta;

    if (
        hunger.timer >=
        hunger.interval
    ) {

        hunger.timer = 0;

        removeHunger(1);

    }

}


// =====================================
// ❤️ AÇLIK BARI
// =====================================

export function updateHungerBar() {

    const bar =
        document.getElementById(
            "hunger-fill"
        );

    if (!bar) {
        return;
    }


    const percent =
        (
            hunger.value /
            hunger.max
        ) * 100;


    bar.style.width =
        percent + "%";

}
// =====================================
// 🥩 ET YE
// =====================================

export function eatRawMeat() {

    addHunger(6);

}