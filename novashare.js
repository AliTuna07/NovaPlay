import {
    db,
    ref,
    push,
    set,
    onValue
} from "./firebase.js";
const gameUrl = document.getElementById("gameUrl");
const gameName = document.getElementById("gameName");
const gameDescription = document.getElementById("gameDescription");
const category = document.getElementById("category");


const uploadBtn = document.getElementById("uploadBtn");

const gameList = document.getElementById("gameList");

const games = [];

uploadBtn.addEventListener("click", () => {

    const title = gameName.value.trim();
    const description = gameDescription.value.trim();
    const selectedCategory = category.value;
const url = gameUrl.value.trim();

if(url === ""){

    alert("Oyun linkini gir.");
    return;

}
    if(title === ""){

        alert("Oyun adını gir.");
        return;

    }

   

  const game = {

    title,
    description,
    category: selectedCategory,
    url

};

   const gameRef = push(ref(db, "games"));

set(gameRef, {
    title,
    description,
    category: selectedCategory,
    url,
    author: localStorage.getItem("username") || "Misafir",
    likes: 0,
    createdAt: Date.now()
})
.then(() => {
    alert("🎉 Oyun başarıyla paylaşıldı!");
})
.catch((error) => {
    console.error(error);
    alert("❌ Firebase'e kaydedilemedi!");
});


    
    gameName.value = "";
gameDescription.value = "";
gameUrl.value = "";

category.selectedIndex = 0;
});

onValue(ref(db, "games"), (snapshot)=>{

    gameList.innerHTML = "";

    if(!snapshot.exists()) return;

    snapshot.forEach(child=>{

        const game = child.val();

       const card = document.createElement("div");

card.className = "gameCard";

card.innerHTML = `
    <div class="gameCover">
        🎮
    </div>

    <div class="gameInfo">

        <h3>${game.title}</h3>

        <p>${game.description}</p>

        <p>👤 ${game.author}</p>

        <button class="playBtn">
            ▶ Oyna
        </button>

    </div>
`;

card.querySelector(".playBtn").onclick = () => {

    location.href =
        "player.html?url=" +
        encodeURIComponent(game.url);

};

gameList.appendChild(card);
    });

});