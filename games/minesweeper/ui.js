/* ==========================================
   NovaMines
   ui.js
========================================== */

const mineCountElement = document.getElementById("mineCount");
const flagCountElement = document.getElementById("flagCount");
const timerElement = document.getElementById("timer");

const resultPanel = document.getElementById("resultPanel");
const resultTitle = document.getElementById("resultTitle");
const resultText = document.getElementById("resultText");

/* ------------------------------
   Zaman
------------------------------ */

let timer = 0;
let timerInterval = null;

function startTimer() {

    if (timerInterval) return;

    timerInterval = setInterval(() => {

        timer++;
        timerElement.textContent = timer;

    }, 1000);

}

function stopTimer() {

    clearInterval(timerInterval);
    timerInterval = null;

}

function resetTimer() {

    stopTimer();

    timer = 0;

    timerElement.textContent = "0";

}

/* ------------------------------
   Sayaçlar
------------------------------ */

function updateCounters() {

    mineCountElement.textContent = MINE_COUNT;

    flagCountElement.textContent = flagsPlaced;

}

/* ------------------------------
   Sonuç
------------------------------ */

function showResult(win) {

    resultPanel.classList.remove("hidden");

    if (win) {
            playSound("win");

        resultTitle.textContent = "🎉 Tebrikler!";
        resultText.textContent =
            `Mayın tarlasını ${timer} saniyede tamamladın!`;

        // NovaPlay ortak efektleri
        if (typeof showNotification === "function") {
            showNotification("💣 NovaMines tamamlandı!");
        }

        if (typeof createConfetti === "function") {
            createConfetti();
        }

    } else {

        resultTitle.textContent = "💥 Oyun Bitti!";
        resultText.textContent =
            "Bir mayına bastın.";

        if (typeof showNotification === "function") {
            showNotification("💥 Mayına bastın!");
        }

    }

}