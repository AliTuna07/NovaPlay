// sound.js

const sounds = {
    waiting: new Audio("./sounds/waiting.mp3"),
    game: new Audio("./sounds/game.mp3"),
    glassBreak: new Audio("./sounds/glass-break.mp3"),
    jump: new Audio("./sounds/jump.mp3"),
    fall: new Audio("./sounds/fall.mp3"),
    finish: new Audio("./sounds/finish.mp3"),
    roundEnd: new Audio("./sounds/round-end.mp3"),
    doorOpen: new Audio("./sounds/door-open.mp3"),
};

sounds.waiting.loop = true;
sounds.game.loop = true;

export function playWaitingMusic() {
    stopGameMusic();

    sounds.waiting.currentTime = 0;
    sounds.waiting.play().catch(() => {});
}

export function playGameMusic() {
    stopWaitingMusic();

    sounds.game.currentTime = 0;
    sounds.game.play().catch(() => {});
}

export function stopWaitingMusic() {
    sounds.waiting.pause();
    sounds.waiting.currentTime = 0;
}

export function stopGameMusic() {
    sounds.game.pause();
    sounds.game.currentTime = 0;
}

export function playSound(name) {

    const sound = sounds[name];

    if (!sound) return;

    sound.currentTime = 0;
    sound.play().catch(() => {});

}