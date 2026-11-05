
import { auth, firestore } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ==========================
// NOVAPLAY ORTAK SİSTEM
// ==========================

let xp = 0;
let level = 1;
let coins = 0;

let currentUser = null;
let dataLoaded = false;
const SHOP_ITEM_IDS = [
    "avatarWolf",
    "avatarRobot",
    "avatarCat",
    "avatarFox",
    "avatarAlien",
    "frameSilver",
    "frameGold",
    "frameDiamond",
    "carStarter",
    "carGT",
    "carSpeed"
];

function getShopInventory() {
    const inventory = {};

    SHOP_ITEM_IDS.forEach(id => {
        inventory[id] = localStorage.getItem(id) === "true";
    });

    return inventory;
}
function getRequiredXP(level) {
    return level * 100;
}

// ==========================
// VERİLERİ YÜKLE
// ==========================

function loadNovaData() {
    xp = Number(localStorage.getItem("novaXP")) || 0;
    level = Number(localStorage.getItem("novaLevel")) || 1;
    coins = Number(localStorage.getItem("novaCoins")) || 0;

    window.updateProfile();
    window.updateCoins();
    applyFrame();
}

function getLocalProfileData() {
    return {
        xp,
        level,
        coins,

        selectedAvatar:
            localStorage.getItem("selectedAvatar") || "👤",

        frameGold:
            localStorage.getItem("frameGold") === "true",

        frameDiamond:
            localStorage.getItem("frameDiamond") === "true",

        ownedItems: getShopInventory(),

        selectedCar:
            localStorage.getItem("selectedCar") || "carStarter"
    };
}

// ==========================
// FIRESTORE KAYDI
// ==========================

async function saveNovaData() {
    if (!currentUser || !dataLoaded) return;

    try {
        await setDoc(
            doc(firestore, "users", currentUser.uid),
            {
                xp,
                level,
                coins,

                selectedAvatar:
                    localStorage.getItem("selectedAvatar") || "👤",

                frameGold:
                    localStorage.getItem("frameGold") === "true",

                frameDiamond:
                    localStorage.getItem("frameDiamond") === "true",

                ownedItems: getShopInventory(),

                selectedCar:
                    localStorage.getItem("selectedCar") || "carStarter"
            },
            { merge: true }
        );

    } catch (error) {
        console.error("NovaPlay veri kaydetme hatası:", error);
    }
}

// ==========================
// HESAP VERİLERİNİ YÜKLE
// ==========================

async function loadAccountData(user) {
    dataLoaded = false;

    const userRef = doc(firestore, "users", user.uid);

    try {
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
            const data = snapshot.data();

            xp = Number(data.xp) || 0;
            level = Number(data.level) || 1;
            coins = Number(data.coins) || 0;

            localStorage.setItem("novaXP", xp);
            localStorage.setItem("novaLevel", level);
            localStorage.setItem("novaCoins", coins);

            localStorage.setItem(
                "selectedAvatar",
                data.selectedAvatar || "👤"
            );

            // Çerçeveleri temizle
            localStorage.removeItem("frameGold");
            localStorage.removeItem("frameDiamond");

            if (data.frameGold) {
                localStorage.setItem("frameGold", "true");
            }

            if (data.frameDiamond) {
                localStorage.setItem("frameDiamond", "true");
            }

            // Eski hesaptan kalan yerel ürünleri temizle
            SHOP_ITEM_IDS.forEach(id => {
                localStorage.removeItem(id);
            });

            // Firestore envanterini yükle
            const ownedItems = data.ownedItems || {};

            SHOP_ITEM_IDS.forEach(id => {
                if (ownedItems[id] === true) {
                    localStorage.setItem(id, "true");
                }
            });

            localStorage.setItem(
                "selectedCar",
                data.selectedCar || "carStarter"
            );

        } else {
            // İlk giriş: Yerel verileri hesaba aktar
            const oldData = getLocalProfileData();

            await setDoc(userRef, {
                ...oldData,
                createdAt: new Date()
            });
        }

        dataLoaded = true;

        updateProfile();
        updateCoins();
        updateAvatar();
        applyFrame();

        console.log("NovaPlay hesap verileri yüklendi.");

    } catch (error) {
        console.error("Hesap verileri yüklenemedi:", error);
        dataLoaded = false;
    }
}

// ==========================
// AUTH DURUMU
// ==========================

onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (user) {
        await loadAccountData(user);
        console.log("Giriş yapıldı:", user.email);
    } else {
        dataLoaded = false;
        loadNovaData();
        console.log("Misafir modu aktif.");
    }
        updateAccountPanel();

    window.dispatchEvent(new Event("novaAuthChanged"));
});

// ==========================
// E-POSTA İLE KAYIT
// ==========================

async function registerWithEmail(email, password) {
    try {
        const result = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        return result.user;

    } catch (error) {
        console.error("Kayıt hatası:", error);
        throw error;
    }
}

// ==========================
// E-POSTA İLE GİRİŞ
// ==========================

async function loginWithEmail(email, password) {
    try {
        const result = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        return result.user;

    } catch (error) {
        console.error("Giriş hatası:", error);
        throw error;
    }
}

// ==========================
// GOOGLE İLE GİRİŞ
// ==========================

async function loginWithGoogle() {
    try {
        const result = await signInWithPopup(
            auth,
            (await import("./firebase.js")).googleProvider
        );

        return result.user;

    } catch (error) {
        console.error("Google giriş hatası:", error);
        throw error;
    }
}

// ==========================
// ÇIKIŞ
// ==========================

async function logoutNovaAccount() {
    await signOut(auth);
}

// ==========================
// XP SİSTEMİ
// ==========================

function updateProfile() {
    const xpFill = document.getElementById("xp-fill");
    const levelText = document.getElementById("levelText");

    if (!xpFill || !levelText) return;

    const requiredXP = getRequiredXP(level);
    const percent = Math.min((xp / requiredXP) * 100, 100);

    xpFill.style.width = percent + "%";

    levelText.textContent =
        `⭐ Seviye ${level} (${xp}/${requiredXP} XP)`;
}

function addXP(amount) {
    if (!Number.isFinite(amount) || amount <= 0) return;

    xp += amount;

    while (xp >= getRequiredXP(level)) {
        xp -= getRequiredXP(level);
        level++;

        showNotification("🎉 Seviye " + level + " oldun!");
        launchConfetti();
    }

    localStorage.setItem("novaXP", xp);
    localStorage.setItem("novaLevel", level);

    updateProfile();
    saveNovaData();
}

// ==========================
// COIN SİSTEMİ
// ==========================

function addCoins(amount) {
    if (!Number.isFinite(amount) || amount === 0) return;

    const newBalance = coins + amount;

    // Bakiye eksiye düşmesin
    if (newBalance < 0) return;

    coins = newBalance;

    localStorage.setItem("novaCoins", coins);

    updateCoins();
    saveNovaData();
}

function updateCoins() {
    const coinText = document.getElementById("coinText");

    if (coinText) {
        coinText.textContent = "🪙 " + coins;
    }
}

// ==========================
// ÖDÜL
// ==========================

function rewardPlayer(xpAmount, coinAmount) {
    addXP(xpAmount);
    addCoins(coinAmount);

    showNotification(
        `⭐ +${xpAmount} XP   🪙 +${coinAmount} NovaCoin`
    );
}

// ==========================
// AVATAR
// ==========================

function setAvatar(avatar) {
    if (typeof avatar !== "string") return;

    localStorage.setItem("selectedAvatar", avatar);

    updateAvatar();
    saveNovaData();
}

function updateAvatar() {
    const avatarBox = document.getElementById("avatar");

    if (avatarBox) {
        avatarBox.textContent =
            localStorage.getItem("selectedAvatar") || "👤";
    }
}

// ==========================
// ÇERÇEVE
// ==========================

function equipFrame(frame) {
    localStorage.removeItem("frameGold");
    localStorage.removeItem("frameDiamond");

    if (frame === "gold") {
        localStorage.setItem("frameGold", "true");
    }

    if (frame === "diamond") {
        localStorage.setItem("frameDiamond", "true");
    }

    applyFrame();
    saveNovaData();
}

function applyFrame() {
    const profile = document.querySelector(".profile-box");
    const avatar = document.getElementById("avatar");

    if (!profile || !avatar) return;

    profile.classList.remove("gold-profile", "diamond-profile");
    avatar.classList.remove("gold-frame", "diamond-frame");

    if (localStorage.getItem("frameGold") === "true") {
        profile.classList.add("gold-profile");
        avatar.classList.add("gold-frame");
    } else if (localStorage.getItem("frameDiamond") === "true") {
        profile.classList.add("diamond-profile");
        avatar.classList.add("diamond-frame");
    }
}

// ==========================
// BİLDİRİM
// ==========================

function showNotification(message) {
    const notification = document.getElementById("notification");
    const text = document.getElementById("notificationText");

    if (!notification || !text) return;

    text.textContent = message;
    notification.classList.add("show");

    setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);
}

// ==========================
// KONFETİ
// ==========================

function launchConfetti() {
    const confettiCanvas = document.getElementById("confettiCanvas");

    if (!confettiCanvas) return;

    const confettiCtx = confettiCanvas.getContext("2d");

    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const colors = [
        "#00ff88",
        "#00c8ff",
        "#ffd700",
        "#ff4d4d",
        "#ffffff",
        "#ff66ff"
    ];

    const pieces = [];

    for (let i = 0; i < 180; i++) {
        pieces.push({
            x: Math.random() * confettiCanvas.width,
            y: -20,
            size: Math.random() * 8 + 4,
            speed: Math.random() * 4 + 3,
            drift: (Math.random() - 0.5) * 4,
            rotation: Math.random() * 360,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }

    function animate() {
        confettiCtx.clearRect(
            0,
            0,
            confettiCanvas.width,
            confettiCanvas.height
        );

        pieces.forEach(p => {
            p.y += p.speed;
            p.x += p.drift;
            p.rotation += 8;

            confettiCtx.save();
            confettiCtx.translate(p.x, p.y);
            confettiCtx.rotate(p.rotation * Math.PI / 180);
            confettiCtx.fillStyle = p.color;

            confettiCtx.fillRect(
                -p.size / 2,
                -p.size / 2,
                p.size,
                p.size
            );

            confettiCtx.restore();
        });

        for (let i = pieces.length - 1; i >= 0; i--) {
            if (pieces[i].y > confettiCanvas.height + 20) {
                pieces.splice(i, 1);
            }
        }

        if (pieces.length > 0) {
            requestAnimationFrame(animate);
        }
    }

    animate();
}

// ==========================
// GLOBAL FONKSİYONLAR
// ==========================

window.addXP = addXP;
window.addCoins = addCoins;
window.saveNovaData = saveNovaData;
window.updateProfile = updateProfile;
window.rewardPlayer = rewardPlayer;
window.showNotification = showNotification;
window.updateCoins = updateCoins;
window.setAvatar = setAvatar;
window.equipFrame = equipFrame;
window.applyFrame = applyFrame;
window.registerWithEmail = registerWithEmail;
window.loginWithEmail = loginWithEmail;
window.loginWithGoogle = loginWithGoogle;
window.logoutNovaAccount = logoutNovaAccount;
window.updateProfile = updateProfile;
window.updateCoins = updateCoins;




window.getNovaUser = () => currentUser;

// ==========================
// BAŞLANGIÇ
// ==========================

loadNovaData();

// ==========================
// NOVAPLAY HESAP EKRANI
// ==========================

function updateAccountPanel() {
    const loggedOut = document.getElementById("accountLoggedOut");
    const loggedIn = document.getElementById("accountLoggedIn");
    const welcome = document.getElementById("accountWelcome");

    if (!loggedOut || !loggedIn) return;

    if (currentUser) {
        loggedOut.style.display = "none";
        loggedIn.style.display = "block";

        if (welcome) {
            welcome.textContent =
                "Hoş geldin, " + (currentUser.displayName || currentUser.email);
        }
    } else {
        loggedOut.style.display = "block";
        loggedIn.style.display = "none";
    }
}

function showAccountMessage(message, isError = false) {
    const messageBox = document.getElementById("accountMessage");

    if (!messageBox) return;

    messageBox.textContent = message;
    messageBox.style.color = isError ? "#ff5555" : "#00ff88";
}

async function handleLogin() {
    const email = document.getElementById("accountEmail").value.trim();
    const password = document.getElementById("accountPassword").value;

    if (!email || !password) {
        showAccountMessage("E-posta ve şifre gerekli.", true);
        return;
    }

    try {
        await loginWithEmail(email, password);
        showAccountMessage("Giriş başarılı!");
    } catch (error) {
        showAccountMessage(getAuthErrorMessage(error), true);
    }
}

async function handleRegister() {
    const email = document.getElementById("accountEmail").value.trim();
    const password = document.getElementById("accountPassword").value;

    if (!email || !password) {
        showAccountMessage("E-posta ve şifre gerekli.", true);
        return;
    }

    if (password.length < 6) {
        showAccountMessage("Şifre en az 6 karakter olmalı.", true);
        return;
    }

    try {
        await registerWithEmail(email, password);
        showAccountMessage("Hesabın oluşturuldu!");
    } catch (error) {
        showAccountMessage(getAuthErrorMessage(error), true);
    }
}

async function handleGoogleLogin() {
    try {
        await loginWithGoogle();
        showAccountMessage("Google girişi başarılı!");
    } catch (error) {
        showAccountMessage(getAuthErrorMessage(error), true);
    }
}

async function handleLogout() {
    try {
        await logoutNovaAccount();
        showAccountMessage("Çıkış yapıldı.");
    } catch (error) {
        showAccountMessage(getAuthErrorMessage(error), true);
    }
}

function getAuthErrorMessage(error) {
    switch (error.code) {
        case "auth/email-already-in-use":
            return "Bu e-posta zaten kullanılıyor.";

        case "auth/invalid-email":
            return "Geçerli bir e-posta adresi gir.";

        case "auth/weak-password":
            return "Şifre yeterince güçlü değil.";

        case "auth/invalid-credential":
            return "E-posta veya şifre hatalı.";

        case "auth/popup-closed-by-user":
            return "Google giriş penceresi kapatıldı.";

        case "auth/popup-blocked":
            return "Tarayıcı açılır pencereyi engelledi.";

        case "auth/network-request-failed":
            return "İnternet bağlantısını kontrol et.";

        default:
            console.error(error);
            return "Bir hata oluştu: " + error.message;
    }
}

window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleGoogleLogin = handleGoogleLogin;
window.handleLogout = handleLogout;

// ==========================
// MAĞAZA MENÜSÜ
// ==========================

function openShopMenu() {

    const options = document.getElementById("sideMenuOptions");
    options?.classList.remove("active");

    const shopModal = document.getElementById("shopModal");

    if (!shopModal) {
        console.error("shopModal bulunamadı!");
        return;
    }

    shopModal.style.display = "flex";

    window.updateCoins?.();

    if (typeof window.drawShop === "function") {
        window.drawShop();
    } else {
        console.error("drawShop fonksiyonu yüklenemedi!");
    }
}

window.openShopMenu = openShopMenu;
// ==========================
// HESAP MODALI
// ==========================

function openAccountModal() {
    document.getElementById("accountModal").classList.add("active");
}

function closeAccountModal() {
    document.getElementById("accountModal")
        .classList.remove("active");
}

function closeAccountOutside(event) {
    if (event.target.id === "accountModal") {
        closeAccountModal();
    }
}

window.openAccountModal = openAccountModal;
window.closeAccountModal = closeAccountModal;
window.closeAccountOutside = closeAccountOutside;
// ==========================
// YAN MENÜ
// ==========================

function toggleSideMenu() {
    const options = document.getElementById("sideMenuOptions");

    if (!options) return;

    options.classList.toggle("active");
}

document.addEventListener("click", function(event) {
    const menu = document.getElementById("sideMenu");

    if (menu && !menu.contains(event.target)) {
        document.getElementById("sideMenuOptions")
            ?.classList.remove("active");
    }
});

window.toggleSideMenu = toggleSideMenu;

// =====================================
// NOVAPLAY - DEVELOPER TOOLS CAYDIRICI
// =====================================

document.addEventListener("keydown", function (e) {
    // F12
    if (e.key === "F12") {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    // Ctrl + Shift + I / J / C
    if (
        e.ctrlKey &&
        e.shiftKey &&
        ["I", "J", "C"].includes(e.key.toUpperCase())
    ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    // Ctrl + U (sayfa kaynağı)
    if (e.ctrlKey && e.key.toUpperCase() === "U") {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
}, true);

// Sağ tık menüsünü engelle
document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
});
