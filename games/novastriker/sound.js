const sounds = {
    shoot: new Audio("./sounds/shoot.mp3"),
    reload: new Audio("./sounds/reload.mp3"),
    playerHurt: new Audio("./sounds/playerHurt.mp3"),
    botAttack: new Audio("./sounds/botAttack.mp3"),
    botDeath: new Audio("./sounds/botDeath.mp3"),
    win: new Audio("./sounds/win.mp3"),
    lose: new Audio("./sounds/lose.mp3"),
    ambience: new Audio("./sounds/ambience.mp3")
};

sounds.ambience.loop = true;
sounds.ambience.volume = 0.35;

export function playSound(name) {
    const sound = sounds[name];

    if (!sound) return;

    sound.currentTime = 0;
    sound.play().catch(() => {});
}

export function playAmbience() {
    sounds.ambience.play().catch(() => {});
}

export function stopAmbience() {
    sounds.ambience.pause();
    sounds.ambience.currentTime = 0;
}