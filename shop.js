const shop = document.getElementById("shop");
const coinDisplay = document.getElementById("coins");


function getCoins(){

    return Number(localStorage.getItem("novaCoins")) || 0;

}



const items = [


{
id:"avatarWolf",
category:"avatar",
icon:"🐺",
name:"Kurt Avatar",
rarity:"Yaygın",
price:100
},

{
id:"avatarRobot",
category:"avatar",
icon:"🤖",
name:"Robot Avatar",
rarity:"Nadir",
price:150
},

{
id:"avatarCat",
category:"avatar",
icon:"🐱",
name:"Kedi Avatar",
rarity:"Yaygın",
price:150
},

{
id:"avatarFox",
category:"avatar",
icon:"🦊",
name:"Tilki Avatar",
rarity:"Epik",
price:200
},

{
id:"avatarAlien",
category:"avatar",
icon:"👾",
name:"Uzaylı Avatar",
rarity:"Efsane",
price:300
},



{
id:"xp100",
category:"xp",
icon:"⭐",
name:"+100 XP",
rarity:"Yaygın",
price:250,
xp:100
},

{
id:"xp250",
category:"xp",
icon:"🌟",
name:"+250 XP",
rarity:"Nadir",
price:600,
xp:250
},

{
id:"xp500",
category:"xp",
icon:"✨",
name:"+500 XP",
rarity:"Epik",
price:900,
xp:500
},



{
id:"frameSilver",
category:"frame",
icon:"⚪",
name:"Gümüş Çerçeve",
rarity:"Yaygın",
price:750
},

{
id:"frameGold",
category:"frame",
icon:"🟡",
name:"Altın Çerçeve",
rarity:"Nadir",
price:1500
},

{
id:"frameDiamond",
category:"frame",
icon:"💎",
name:"Elmas Çerçeve",
rarity:"Efsane",
price:3000
},
// =====================
// ARABALAR
// =====================

{
id:"carStarter",
category:"car",
icon:"🚗",
name:"Neon Starter",
rarity:"Yaygın",
price:0
},

{
id:"carSpeed",
category:"car",
icon:"🏎️",
name:"Nova Speed",
rarity:"Nadir",
price:500
},

{
id:"carGT",
category:"car",
icon:"🚘",
name:"Nova GT",
rarity:"Epik",
price:1000
}

];



function drawShop(){


shop.innerHTML="";


const categories=[

{
id:"car",
title:"🏎️ Arabalar"
},

{
id:"avatar",
title:"👤 Avatarlar"
},

{
id:"xp",
title:"⭐ XP Paketleri"
},

{
id:"frame",
title:"🖼️ Profil Çerçeveleri"
}

];



categories.forEach(cat=>{


let title=document.createElement("h2");

title.className="categoryTitle";

title.textContent=cat.title;

shop.appendChild(title);



let row=document.createElement("div");

row.className="categoryRow";



items
.filter(item=>item.category===cat.id)
.forEach(item=>{


let card=document.createElement("div");

card.className="card";


card.innerHTML=`

<div class="itemImage">
${item.icon}
</div>


<h2>
${item.name}
</h2>


<p>
Nadirlik:
<span class="rare">
${item.rarity}
</span>
</p>


<p>
NovaPlay özel ürünü
</p>


<div class="price">
🪙 ${item.price}
</div>


<button class="buyBtn">
Satın Al
</button>

`;


const owned = localStorage.getItem(item.id) === "true";

const isCar = item.category === "car";
card.querySelector("button").onclick=()=>{


const owned = localStorage.getItem(item.id) === "true";


if(owned && item.category==="car"){

localStorage.setItem(
"selectedCar",
item.id
);

drawShop();

alert("🏎️ "+item.name+" seçildi!");

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
if(localStorage.getItem(item.id) === "true"){

        alert("Bu ürüne zaten sahipsin!");

        return;

    }

let coins=getCoins();


if(coins < item.price){

alert("Yeterli NovaCoin yok!");

return;

}



coins-=item.price;


localStorage.setItem(
"novaCoins",
coins
);



if(item.category==="xp"){

let xp=
Number(localStorage.getItem("xp")) || 0;


xp+=item.xp;


localStorage.setItem(
"xp",
xp
);


}


else{

localStorage.setItem(
item.id,
"true"
);

}
if(item.category==="car" && item.price===0){

localStorage.setItem(
item.id,
"true"
);

localStorage.setItem(
"selectedCar",
item.id
);

}



updateCoins();

drawShop();


alert("🎉 "+item.name+" satın alındı!");

}



function updateCoins(){

coinDisplay.textContent=getCoins();

}



updateCoins();

drawShop();