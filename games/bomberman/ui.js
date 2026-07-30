// =========================
// NovaPlay Bomberman
// ui.js
// =========================

const hud = {
    lives: document.getElementById("lives"),
    coins: document.getElementById("coins"),
    xp: document.getElementById("xp"),
    bombs: document.getElementById("bombs"),
    power: document.getElementById("power"),
    timer: document.getElementById("timer")
};

function updateHUD() {

    if (hud.lives)  hud.lives.textContent = player.lives;
    if (hud.coins)  hud.coins.textContent = player.coins;
    if (hud.xp)     hud.xp.textContent = player.xp;
    if (hud.bombs)  hud.bombs.textContent = player.bombs;
    if (hud.power)  hud.power.textContent = player.power;
    if (hud.timer)  hud.timer.textContent = game.time;
    if (hud.level)  hud.level.textContent = currentLevel;

}
level:document.getElementById("level"),

// İlk yüklemede HUD'u güncelle
window.addEventListener("load", () => {
    updateHUD();
});
