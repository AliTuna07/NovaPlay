const shop = document.getElementById("shop");
const coinDisplay = document.getElementById("coins");

function getCoins() {
    return Number(localStorage.getItem("novaCoins")) || 0;
}

const items = [

    // =====================
    // AVATARLAR
    // =====================

    {
        id: "avatarWolf",
        category: "avatar",
        icon: "🐺",
        name: "Kurt Avatar",
        price: 100
    },

    {
        id: "avatarRobot",
        category: "avatar",
        icon: "🤖",
        name: "Robot Avatar",
        price: 150
    },

    {
        id: "avatarCat",
        category: "avatar",
        icon: "🐱",
        name: "Kedi Avatar",
        price: 150
    },

    {
        id: "avatarFox",
        category: "avatar",
        icon: "🦊",
        name: "Tilki Avatar",
        price: 200
    },

    {
        id: "avatarAlien",
        category: "avatar",
        icon: "👾",
        name: "Uzaylı Avatar",
        price: 300
    },



    // =====================
    // XP
    // =====================

    {
        id: "xp100",
        category: "xp",
        icon: "⭐",
        name: "+100 XP",
        price: 250,
        xp: 100
    },

    {
        id: "xp250",
        category: "xp",
        icon: "🌟",
        name: "+250 XP",
        price: 500,
        xp: 250
    },

    {
        id: "xp500",
        category: "xp",
        icon: "✨",
        name: "+500 XP",
        price: 900,
        xp: 500
    },



    // =====================
    // PROFİL ÇERÇEVELERİ
    // =====================

    {
        id: "frameSilver",
        category: "frame",
        icon: "⚪",
        name: "Gümüş Çerçeve",
        price: 300
    },

    {
        id: "frameGold",
        category: "frame",
        icon: "🟡",
        name: "Altın Çerçeve",
        price: 600
    },

    {
        id: "frameDiamond",
        category: "frame",
        icon: "💎",
        name: "Elmas Çerçeve",
        price: 1000
    }

];

updateCoins();
drawShop();

function updateCoins() {

    coinDisplay.textContent = getCoins();

}

function drawShop() {

    shop.innerHTML = "";

    const categories = [

        {
            id: "avatar",
            title: "👤 Avatarlar"
        },

        {
            id: "xp",
            title: "⭐ XP Paketleri"
        },

        {
            id: "frame",
            title: "🖼️ Profil Çerçeveleri"
        }

    ];

    categories.forEach(category => {

        const title = document.createElement("h2");

        title.className = "categoryTitle";
        title.textContent = category.title;

        shop.appendChild(title);

        const row = document.createElement("div");

        row.className = "categoryRow";

        items
            .filter(item => item.category === category.id)
            .forEach(item => {

                const owned = localStorage.getItem(item.id) === "true";
                const isXP = item.category === "xp";

                const card = document.createElement("div");

                card.className = "card";

                card.innerHTML = `
                    <div style="font-size:60px">${item.icon}</div>

                    <h2>${item.name}</h2>

                    <div class="price">
                        🪙 ${item.price}
                    </div>

                    <button class="buyBtn">

${
isXP
? "Satın Al"
:
(
owned
? "Kullan"
: "Satın Al"
)
}

</button>
                `;
card.querySelector("button").onclick = () => {

    if(item.category==="avatar" &&
       localStorage.getItem(item.id)==="true"){

        setAvatar(item.icon);

        alert(item.name + " kullanılıyor!");

        return;

    }

    buy(item);

};
                row.appendChild(card);

            });

        shop.appendChild(row);

    });

}
function buy(item){

    const owned = localStorage.getItem(item.id) === "true";
    const isXP = item.category === "xp";

    // Avatar ve çerçeveler tekrar alınamaz
    if(!isXP && owned){

        alert("Bu ürüne zaten sahipsin.");
        return;

    }

    let coins = getCoins();

    if(coins < item.price){

        alert("Yeterli NovaCoin yok!");
        return;

    }

    // Coin düş
    coins -= item.price;
    localStorage.setItem("novaCoins", coins);

    // XP paketleri
    if(isXP){

        addXP(item.xp);

    }else{

        // Avatar ve çerçeveyi sahip olunanlara ekle
        localStorage.setItem(item.id, "true");

    }

    updateCoins();
    drawShop();

    alert("🎉 " + item.name + " satın alındı!");

}