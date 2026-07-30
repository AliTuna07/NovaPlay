// =========================
// NovaPlay Bomberman
// sound.js
// =========================

// NovaPlay genel ses ayarı
const SOUND_ENABLED =
    localStorage.getItem("novaSound") !== "off";

// Sesler
const sounds = {

    bomb: new Audio("../../assets/sounds/bomberman/bomb.wav"),

    explosion: new Audio("../../assets/sounds/bomberman/explosion.wav"),

    powerup: new Audio("../../assets/sounds/bomberman/powerup.wav"),

    coin: new Audio("../../assets/sounds/bomberman/coin.wav"),

    hurt: new Audio("../../assets/sounds/bomberman/hurt.wav"),

    win: new Audio("../../assets/sounds/bomberman/win.wav"),

    music: new Audio("../../assets/sounds/bomberman/music.mp3")

};

sounds.music.loop = true;
sounds.music.volume = 0.35;

// Efekt çal
function playSound(name, volume = 1){

    if(!SOUND_ENABLED) return;

    const sound = sounds[name];

    if(!sound) return;

    const clone = sound.cloneNode();

    clone.volume = volume;

    clone.play().catch(()=>{});

}

// Müziği başlat
function startMusic(){

    if(!SOUND_ENABLED) return;

    sounds.music.currentTime = 0;

    sounds.music.play().catch(()=>{});

}

// Müziği durdur
function stopMusic(){

    sounds.music.pause();

}