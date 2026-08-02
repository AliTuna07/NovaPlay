const keys = {

    left: false,
    right: false

};
window.accelerating = false;
window.braking = false;

window.addEventListener("keydown", e => {

    if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") {

        window.accelerating = true;

    }

});

window.addEventListener("keyup", e => {

    if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") {

        window.accelerating = false;

    }

});
window.addEventListener("keydown", (e) => {

    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {

        if (!keys.left) {

            keys.left = true;

            if (window.playerLane > 0) {

                window.playerLane--;

            }

        }

    }

    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {

        if (!keys.right) {

            keys.right = true;

            if (window.playerLane < 3) {

                window.playerLane++;

            }

        }

    }
    if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") {

    window.braking = true;

}

});

window.addEventListener("keyup", (e) => {

    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {

        keys.left = false;

    }

    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {

        keys.right = false;

    }
if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") {

    window.braking = false;

}
});