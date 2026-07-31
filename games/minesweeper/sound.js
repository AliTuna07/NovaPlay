/* ==========================================
   NovaMines
   sound.js
========================================== */

const sounds = {
    click: new Audio("assets/sounds/click.mp3"),
    explosion: new Audio("assets/sounds/explosion.mp3"),
    win: new Audio("assets/sounds/win.mp3"),
    lose: new Audio("assets/sounds/lose.mp3")
};

Object.values(sounds).forEach(sound => {

    sound.preload = "auto";
    sound.volume = 0.7;

});

function playSound(name){

    const sound = sounds[name];

    if(!sound) return;

    sound.pause();
    sound.currentTime = 0;

    sound.play().catch(() => {});

}