let cameraShake = 0;
let levelCompleted = false;
let rewardsSaved = false;
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");



const game = {
    running: true,
    time: 180,
    lastSecond: Date.now()
};

const keys = {};

window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

function update() {

    if (!game.running) return;

    // Oyuncuyu güncelle
    if (typeof updatePlayer === "function") {
        updatePlayer(keys);
    }

    // Süre
    if (Date.now() - game.lastSecond >= 1000) {
        game.lastSecond = Date.now();

        if (game.time > 0) {
            game.time--;
            
            updateHUD();
        } else {
    game.running = false;
    showGameOver();
}
    }
updateBombs(keys);
updateEnemies();
updatePowerUps();
if (cameraShake > 0) {
    cameraShake--;
}
if (
    exitDoor.revealed
) {

    const px = Math.floor(player.x / TILE);
    const py = Math.floor(player.y / TILE);

    if (
        px === exitDoor.x &&
        py === exitDoor.y
    ) {

        completeLevel();

    }

}
}

function draw() {

    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.save();

    if(cameraShake>0){

        ctx.translate(

            (Math.random()-0.5)*6,
            (Math.random()-0.5)*6

        );

    }

   drawWorld();
drawPowerUps();
drawBombs();
drawEnemies();
drawPlayer();

    ctx.restore();

}

game.time = getLevel().time;

function gameLoop() {

    update();
    draw();

    requestAnimationFrame(gameLoop);

}
startMusic();
gameLoop();
function completeLevel() {

    if (levelCompleted) return;

    levelCompleted = true;
    game.running = false;

    saveRewards();
    stopMusic();
playSound("win", 1);

    setTimeout(() => {

        const next = confirm(
`🎉 Bölüm Tamamlandı!

🪙 Kazanılan NovaCoin: ${player.coins}
⭐ Kazanılan XP: ${player.xp}

Tamam'a basarsan sonraki bölüm,
İptal'e basarsan ana menüye dönersin.`
        );

        if (next) {

           
            currentLevel++;

localStorage.setItem(
    "bombermanLevel",
    currentLevel
);

location.reload();

        } else {

            // NovaPlay ana menüsü
            location.href = "../../index.html";

        }

    }, 300);

}
function saveRewards() {

    if (rewardsSaved) return;

    rewardsSaved = true;

    const totalCoins = Number(localStorage.getItem("novaCoins") || 0);
    const totalXP = Number(localStorage.getItem("novaXP") || 0);

    localStorage.setItem(
        "novaCoins",
        totalCoins + player.coins
    );

    localStorage.setItem(
        "novaXP",
        totalXP + player.xp
    );

}
window.addEventListener("beforeunload", () => {
    stopMusic();
});
function showGameOver() {

    stopMusic();
    playSound("lose", 1);

    const screen = document.getElementById("gameOverScreen");
    const title = document.getElementById("gameOverTitle");
    const coins = document.getElementById("gameOverCoins");
    const xp = document.getElementById("gameOverXP");

    if (title) title.textContent = "⏰ Süre Doldu!";
    if (coins) coins.textContent = player.coins;
    if (xp) xp.textContent = player.xp;

    if (screen) {
        screen.classList.remove("hidden");
        screen.style.display = "flex";
    }
}