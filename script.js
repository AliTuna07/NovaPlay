// Oyun kartları
const cards = document.querySelectorAll(".game-card");

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
    "selectedAvatar",
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

    const avatarIds = {
        "🐺": "avatarWolf",
        "🤖": "avatarRobot",
        "🐱": "avatarCat",
        "🦊": "avatarFox",
        "👾": "avatarAlien"
    };

    // Varsayılan avatar her zaman kullanılabilir
    if (avatar === "👤") {
        selectedAvatar = avatar;
        return;
    }

    // Satın alınmış mı?
    if (localStorage.getItem(avatarIds[avatar]) === "true") {
        selectedAvatar = avatar;
    } else {
        alert("❌ Bu avatarı önce NovaShop'tan satın almalısın!");
    }
}


function saveAvatar() {
    const avatarBox = document.getElementById("avatar");

    avatarBox.textContent = selectedAvatar;

    localStorage.setItem("selectedAvatar", selectedAvatar);
}
function loadAvatarInventory(){

    const inventory = document.getElementById("avatarInventory");

    if(!inventory) return;

    inventory.innerHTML = "";

    const avatars = [

        {
            icon:"👤",
            id:null
        },

        {
            icon:"🐺",
            id:"avatarWolf"
        },

        {
            icon:"🤖",
            id:"avatarRobot"
        },

        {
            icon:"🐱",
            id:"avatarCat"
        },

        {
            icon:"🦊",
            id:"avatarFox"
        },

        {
            icon:"👾",
            id:"avatarAlien"
        }

    ];

    avatars.forEach(a=>{

        if(a.id && localStorage.getItem(a.id)!=="true"){
            return;
        }

        const btn=document.createElement("button");

        btn.textContent=a.icon;

btn.onclick=()=>{

    selectedAvatar = a.icon;
    saveAvatar();

};

        inventory.appendChild(btn);

    });

}

const oldAvatar = localStorage.getItem("selectedAvatar");

if(oldAvatar && oldAvatar.length < 10){
    document.getElementById("avatar").textContent = oldAvatar;
}



window.addEventListener("load", () => {

    updateProfile();
    updateCoins();
    loadAvatarInventory();

});
function diamondEffect(){

    const avatar=document.getElementById("avatar");

    if(!avatar) return;

    const sparkle=document.createElement("span");

    sparkle.textContent="✦";

    sparkle.className="diamond-sparkle";

    avatar.appendChild(sparkle);


    setTimeout(()=>{
        sparkle.remove();
    },1000);

}