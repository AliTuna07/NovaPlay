// ==========================
// NOVA XP SİSTEMİ
// ==========================

let xp = Number(localStorage.getItem("novaXP")) || 0;
let level = Number(localStorage.getItem("novaLevel")) || 1;

function getRequiredXP(level){
    return level * 100;
}

function updateProfile(){

    const xpFill = document.getElementById("xp-fill");
    const levelText = document.getElementById("levelText");

    if(!xpFill || !levelText) return;

    const requiredXP = getRequiredXP(level);

    const percent = Math.min((xp / requiredXP) * 100, 100);

    xpFill.style.width = percent + "%";

    levelText.textContent =
        `⭐ Seviye ${level} (${xp}/${requiredXP} XP)`;
}

function addXP(amount){

    xp += amount;

    while(xp >= getRequiredXP(level)){
        xp -= getRequiredXP(level);
        level++;

        showNotification("🎉 Tebrikler! ⭐ Seviye " + level + " oldun!");
        launchConfetti();
    }

    localStorage.setItem("novaXP", xp);
    localStorage.setItem("novaLevel", level);

    updateProfile();
}
var confettiCanvas = document.getElementById("confettiCanvas");
var confettiCtx = confettiCanvas.getContext("2d");

function resizeConfettiCanvas(){
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeConfettiCanvas);
resizeConfettiCanvas();

function launchConfetti(){

    const pieces = [];

    const colors = [
        "#00ff88",
        "#00c8ff",
        "#ffd700",
        "#ff4d4d",
        "#ffffff",
        "#ff66ff"
    ];

    for(let i = 0; i < 180; i++){

        pieces.push({
            x: Math.random() * confettiCanvas.width,
            y: -20,
            size: Math.random() * 8 + 4,
            speed: Math.random() * 4 + 3,
            drift: (Math.random() - 0.5) * 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360
        });

    }

    function animate(){

        confettiCtx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);

        pieces.forEach(p=>{

            p.y += p.speed;
            p.x += p.drift;
            p.rotation += 8;

            confettiCtx.save();

            confettiCtx.translate(p.x,p.y);
            confettiCtx.rotate(p.rotation*Math.PI/180);

            confettiCtx.fillStyle = p.color;
            confettiCtx.fillRect(
                -p.size/2,
                -p.size/2,
                p.size,
                p.size
            );

            confettiCtx.restore();

        });

        for(let i=pieces.length-1;i>=0;i--){

            if(pieces[i].y > confettiCanvas.height+20){
                pieces.splice(i,1);
            }

        }

        if(pieces.length>0){
            requestAnimationFrame(animate);
        }else{
            confettiCtx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
        }

    }

    animate();

}

window.addEventListener("load", updateProfile);
// Oyun kartları
const cards = document.querySelectorAll(".card");

cards.forEach((card) => {
    card.addEventListener("click", () => {
        cards.forEach((item) => item.classList.remove("selected"));
        card.classList.add("selected");
    });
});


// Arama sistemi
const searchBox = document.getElementById("searchInput");
const games = document.querySelectorAll(".game-card");

if (searchBox) {
    searchBox.addEventListener("input", function () {
        const searchText = searchBox.value.toLowerCase();

        games.forEach(game => {
            const title = game.innerText.toLowerCase();

            if (title.includes(searchText)) {
                game.style.display = "block";
            } else {
                game.style.display = "none";
            }
        });
    });
}


// Profil sistemi
const profileBtn = document.getElementById("profileBtn");
const profileModal = document.getElementById("profileModal");

if (profileBtn && profileModal) {

    profileBtn.addEventListener("click", () => {
        profileModal.style.display = "block";
    });

}


function saveProfile() {

    const nameInput = document.getElementById("nameInput");
    const username = document.getElementById("username");

    if (nameInput.value.trim() !== "") {

        username.textContent = nameInput.value;

        localStorage.setItem(
            "username",
            nameInput.value
        );
        localStorage.setItem(
    "avatar",
    selectedAvatar
);

document.getElementById("avatar").textContent = selectedAvatar;

        profileModal.style.display = "none";
    }

}


const oldName = localStorage.getItem("username");

if (oldName) {
    document.getElementById("username").textContent = oldName;
}
// Avatar sistemi

let selectedAvatar = "👤";

function selectAvatar(avatar) {
    selectedAvatar = avatar;
}


function saveAvatar() {
    const avatarBox = document.getElementById("avatar");

    avatarBox.textContent = selectedAvatar;

    localStorage.setItem("avatar", selectedAvatar);
}


const oldAvatar = localStorage.getItem("avatar");

if (oldAvatar) {
    document.getElementById("avatar").textContent = oldAvatar;
}
function showNotification(message){

    const notification = document.getElementById("notification");
    const text = document.getElementById("notificationText");

    text.textContent = message;

    notification.classList.add("show");

    setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);

}
window.confettiCtx = confettiCanvas.getContext("2d");
function resizeConfettiCanvas(){
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeConfettiCanvas);
resizeConfettiCanvas();

function launchConfetti(){

    const pieces = [];

    const colors = [
        "#00ff88",
        "#00c8ff",
        "#ffd700",
        "#ff4d4d",
        "#ffffff",
        "#ff66ff"
    ];

    for(let i = 0; i < 180; i++){

        pieces.push({
            x: Math.random() * confettiCanvas.width,
            y: -20,
            size: Math.random() * 8 + 4,
            speed: Math.random() * 4 + 3,
            drift: (Math.random() - 0.5) * 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360
        });

    }

    function animate(){

        confettiCtx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);

        pieces.forEach(p=>{

            p.y += p.speed;
            p.x += p.drift;
            p.rotation += 8;

            confettiCtx.save();

            confettiCtx.translate(p.x,p.y);
            confettiCtx.rotate(p.rotation*Math.PI/180);

            confettiCtx.fillStyle = p.color;
            confettiCtx.fillRect(
                -p.size/2,
                -p.size/2,
                p.size,
                p.size
            );

            confettiCtx.restore();

        });

        for(let i=pieces.length-1;i>=0;i--){

            if(pieces[i].y > confettiCanvas.height+20){
                pieces.splice(i,1);
            }

        }

        if(pieces.length>0){
            requestAnimationFrame(animate);
        }else{
            confettiCtx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
        }

    }

    animate();

}
