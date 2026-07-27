// ==========================
// NOVAPLAY ORTAK SİSTEM
// XP + COIN + CONFETTI
// ==========================

// XP
let xp = Number(localStorage.getItem("novaXP")) || 0;
let level = Number(localStorage.getItem("novaLevel")) || 1;

// Coin
let coins = Number(localStorage.getItem("novaCoins")) || 0;

// Gerekli XP
function getRequiredXP(level){
    return level * 100;
}

// Profili Güncelle
function updateProfile(){

    const xpFill = document.getElementById("xp-fill");
    const levelText = document.getElementById("levelText");

    if(!xpFill || !levelText) return;

    const requiredXP = getRequiredXP(level);
    const percent = Math.min((xp / requiredXP) * 100,100);

    xpFill.style.width = percent + "%";
    levelText.textContent =
        `⭐ Seviye ${level} (${xp}/${requiredXP} XP)`;
}

// XP Ekle
function addXP(amount){

    xp += amount;

    while(xp >= getRequiredXP(level)){
        xp -= getRequiredXP(level);
        level++;

        showNotification("🎉 Seviye " + level + " oldun!");
        launchConfetti();
    }

    localStorage.setItem("novaXP",xp);
    localStorage.setItem("novaLevel",level);

    updateProfile();
}

// Coin Ekle
function addCoins(amount){

    coins += amount;

    localStorage.setItem("novaCoins",coins);

    updateCoins();
}

// Coin Yazısını Güncelle
function updateCoins(){

    const coinText = document.getElementById("coinText");

    if(coinText){
        coinText.textContent = "🪙 " + coins;
    }

}

// Bildirim
function showNotification(message){

    const notification = document.getElementById("notification");
    const text = document.getElementById("notificationText");

    if(!notification || !text) return;

    text.textContent = message;

    notification.classList.add("show");

    setTimeout(()=>{
        notification.classList.remove("show");
    },3000);

}
function rewardPlayer(xpAmount, coinAmount){

    addXP(xpAmount);
    addCoins(coinAmount);

    showNotification(
        `⭐ +${xpAmount} XP   🪙 +${coinAmount} NovaCoin`
    );

}

// Konfeti
function launchConfetti(){

    const confettiCanvas = document.getElementById("confettiCanvas");

    if(!confettiCanvas) return;

    const confettiCtx = confettiCanvas.getContext("2d");

    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const colors=[
        "#00ff88",
        "#00c8ff",
        "#ffd700",
        "#ff4d4d",
        "#ffffff",
        "#ff66ff"
    ];

    const pieces=[];

    for(let i=0;i<180;i++){

        pieces.push({

            x:Math.random()*confettiCanvas.width,
            y:-20,

            size:Math.random()*8+4,

            speed:Math.random()*4+3,

            drift:(Math.random()-0.5)*4,

            rotation:Math.random()*360,

            color:colors[Math.floor(Math.random()*colors.length)]

        });

    }

    function animate(){

        confettiCtx.clearRect(
            0,
            0,
            confettiCanvas.width,
            confettiCanvas.height
        );

        pieces.forEach(p=>{

            p.y+=p.speed;
            p.x+=p.drift;
            p.rotation+=8;

            confettiCtx.save();

            confettiCtx.translate(p.x,p.y);

            confettiCtx.rotate(p.rotation*Math.PI/180);

            confettiCtx.fillStyle=p.color;

            confettiCtx.fillRect(
                -p.size/2,
                -p.size/2,
                p.size,
                p.size
            );

            confettiCtx.restore();

        });

        for(let i=pieces.length-1;i>=0;i--){

            if(pieces[i].y>confettiCanvas.height+20){

                pieces.splice(i,1);

            }

        }

        if(pieces.length>0){

            requestAnimationFrame(animate);

        }

    }

    animate();

}

// Sayfa açılınca
window.addEventListener("load",()=>{
const avatarBox = document.getElementById("avatar");

const selectedAvatar =
localStorage.getItem("selectedAvatar");

if(avatarBox && selectedAvatar){

    avatarBox.textContent = selectedAvatar;

}
    updateProfile();
    updateCoins();

});
function setAvatar(avatar){

    localStorage.setItem("selectedAvatar", avatar);

    const avatarBox = document.getElementById("avatar");

    if(avatarBox){
        avatarBox.textContent = avatar;
    }

}
