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

        alert("🎉 Tebrikler! Seviye " + level + " oldun!");
    }

    localStorage.setItem("novaXP", xp);
    localStorage.setItem("novaLevel", level);

    updateProfile();
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
addXP(10);
