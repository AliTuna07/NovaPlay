/* ==========================================
   NovaMines
   script.js
========================================== */

const boardElement = document.getElementById("board");
const restartBtn = document.getElementById("restartBtn");
const backBtn = document.getElementById("backBtn");
const playAgainBtn = document.getElementById("playAgainBtn");

/* ------------------------------
   Oyunu Başlat
------------------------------ */

function initGame() {

    createBoard();

    boardElement.innerHTML = "";

    for (let row = 0; row < BOARD_SIZE; row++) {

        for (let col = 0; col < BOARD_SIZE; col++) {

            const cell = board[row][col];

            const div = document.createElement("div");

            div.className = "cell";

            cell.element = div;

            // Sol tık
            div.addEventListener("click", () => {

                openCell(row, col);

            });

            // Sağ tık
            div.addEventListener("contextmenu", (event) => {

                event.preventDefault();

                toggleFlag(row, col);

            });

            boardElement.appendChild(div);

        }

    }

    // Sayaçları sıfırla
    if (typeof resetTimer === "function") {

        resetTimer();

    }

    if (typeof updateCounters === "function") {

        updateCounters();

    }

    // Sonuç panelini gizle
    const panel = document.getElementById("resultPanel");

    if (panel) {

        panel.classList.add("hidden");

    }

}

/* ------------------------------
   Butonlar
------------------------------ */

restartBtn.addEventListener("click", () => {

    initGame();

});

playAgainBtn.addEventListener("click", () => {

    initGame();

});

backBtn.addEventListener("click", () => {

    window.location.href = "../../index.html";

});

/* ------------------------------
   Başlat
------------------------------ */

window.addEventListener("load", () => {

    initGame();

});