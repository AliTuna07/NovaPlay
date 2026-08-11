export const keys = {};

export let mouseLocked = false;

let mouseDeltaX = 0;
let mouseDeltaY = 0;


// =====================================
// KLAVYE
// =====================================

window.addEventListener("keydown", (event) => {

    keys[event.code] = true;

});


window.addEventListener("keyup", (event) => {

    keys[event.code] = false;

});


// =====================================
// POINTER LOCK
// =====================================

document.addEventListener(
    "click",
    () => {

        if (!mouseLocked) {

            const canvas =
                document.querySelector("canvas");

            if (canvas) {
                canvas.requestPointerLock();
            }

        }

    }
);


// =====================================
// POINTER LOCK DEĞİŞİMİ
// =====================================

document.addEventListener(
    "pointerlockchange",
    () => {

        mouseLocked =
            document.pointerLockElement !== null;

    }
);


// =====================================
// MOUSE
// =====================================

document.addEventListener(
    "mousemove",
    (event) => {

        if (!mouseLocked) {
            return;
        }

        mouseDeltaX +=
            event.movementX;

        mouseDeltaY +=
            event.movementY;

    }
);


// =====================================
// MOUSE DELTA
// =====================================

export function getMouseDelta() {

    const delta = {

        x: mouseDeltaX,

        y: mouseDeltaY

    };

    mouseDeltaX = 0;
    mouseDeltaY = 0;

    return delta;

}