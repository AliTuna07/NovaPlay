// =====================================
// 🎮 NOVARACE KONTROLLER
// =====================================

const keys = {
    left: false,
    right: false
};

window.accelerating = false;
window.braking = false;


// =====================================
// ⌨️ KLAVYE KONTROLLERİ
// =====================================

window.addEventListener("keydown", (e) => {

    // GAZ
    if (
        e.key === "w" ||
        e.key === "W" ||
        e.key === "ArrowUp"
    ) {
        window.accelerating = true;
    }


    // SOL
    if (
        e.key === "ArrowLeft" ||
        e.key === "a" ||
        e.key === "A"
    ) {

        if (!keys.left) {

            keys.left = true;

            if (window.playerLane > 0) {
                window.playerLane--;
            }

        }

    }


    // SAĞ
    if (
        e.key === "ArrowRight" ||
        e.key === "d" ||
        e.key === "D"
    ) {

        if (!keys.right) {

            keys.right = true;

            if (window.playerLane < 3) {
                window.playerLane++;
            }

        }

    }


    // FREN
    if (
        e.key === "s" ||
        e.key === "S" ||
        e.key === "ArrowDown"
    ) {
        window.braking = true;
    }

});


// =====================================
// ⌨️ KLAVYE BIRAKMA
// =====================================

window.addEventListener("keyup", (e) => {

    // GAZ
    if (
        e.key === "w" ||
        e.key === "W" ||
        e.key === "ArrowUp"
    ) {
        window.accelerating = false;
    }


    // SOL
    if (
        e.key === "ArrowLeft" ||
        e.key === "a" ||
        e.key === "A"
    ) {
        keys.left = false;
    }


    // SAĞ
    if (
        e.key === "ArrowRight" ||
        e.key === "d" ||
        e.key === "D"
    ) {
        keys.right = false;
    }


    // FREN
    if (
        e.key === "s" ||
        e.key === "S" ||
        e.key === "ArrowDown"
    ) {
        window.braking = false;
    }

});


// =====================================
// 📱 MOBİL KONTROLLER
// =====================================

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const gasBtn = document.getElementById("gasBtn");
const brakeBtn = document.getElementById("brakeBtn");


// =====================================
// 📱 SOL BUTON
// =====================================

if (leftBtn) {

    const moveLeft = (e) => {

        e.preventDefault();

        if (window.playerLane > 0) {
            window.playerLane--;
        }

    };

    leftBtn.addEventListener("touchstart", moveLeft, {
        passive: false
    });

    leftBtn.addEventListener("click", moveLeft);

}


// =====================================
// 📱 SAĞ BUTON
// =====================================

if (rightBtn) {

    const moveRight = (e) => {

        e.preventDefault();

        if (window.playerLane < 3) {
            window.playerLane++;
        }

    };

    rightBtn.addEventListener("touchstart", moveRight, {
        passive: false
    });

    rightBtn.addEventListener("click", moveRight);

}


// =====================================
// 📱 GAZ BUTONU
// =====================================

if (gasBtn) {

    const startGas = (e) => {

        e.preventDefault();

        window.accelerating = true;

    };

    const stopGas = (e) => {

        e.preventDefault();

        window.accelerating = false;

    };

    gasBtn.addEventListener("touchstart", startGas, {
        passive: false
    });

    gasBtn.addEventListener("touchend", stopGas, {
        passive: false
    });

    gasBtn.addEventListener("touchcancel", stopGas, {
        passive: false
    });

}


// =====================================
// 📱 FREN BUTONU
// =====================================

if (brakeBtn) {

    const startBrake = (e) => {

        e.preventDefault();

        window.braking = true;

    };

    const stopBrake = (e) => {

        e.preventDefault();

        window.braking = false;

    };

    brakeBtn.addEventListener("touchstart", startBrake, {
        passive: false
    });

    brakeBtn.addEventListener("touchend", stopBrake, {
        passive: false
    });

    brakeBtn.addEventListener("touchcancel", stopBrake, {
        passive: false
    });

}