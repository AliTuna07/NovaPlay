/* ===========================================
   NovaPlay Bug Report
   Part 1
=========================================== */

import {
    db,
    ref,
    push,
    set,
    update,
    onValue,
    remove
} from "./firebase.js";
const ADMINS = [
    "NovaPlayer"
];
const isAdmin = ADMINS.includes(currentUser);
const bugList = document.getElementById("bugList");
const bugTitle = document.getElementById("bugTitle");
const bugDescription = document.getElementById("bugDescription");
const sendBug = document.getElementById("sendBug");
const searchBug = document.getElementById("searchBug");
const loginWarning = document.getElementById("loginWarning");
const bugGame = document.getElementById("bugGame");
const bugType = document.getElementById("bugType");

/* ===========================================
   Kullanıcı
=========================================== */

function getUsername() {

    return localStorage.getItem("username") || "Misafir";

}

const currentUser = getUsername();

/* ===========================================
   Giriş Kontrolü
=========================================== */

if (currentUser === "Misafir") {

    loginWarning.style.display = "block";

    bugTitle.disabled = true;
    bugDescription.disabled = true;
    sendBug.disabled = true;

}


let reports = [];

/* ===========================================
   Tarih
=========================================== */

function formatDate(date) {

    return new Date(date).toLocaleString("tr-TR");

}

/* ===========================================
   Yeni Hata
=========================================== */

async function addReport() {

    const title = bugTitle.value.trim();
    const description = bugDescription.value.trim();

    if (!title || !description) {

        alert("Lütfen bütün alanları doldur.");
        return;

    }

    const reportsRef = ref(db, "reports");

const newReport = push(reportsRef);

try {

    await set(newReport, {

        id: newReport.key,

        user: currentUser,

        game: bugGame.value,

        type: bugType.value,

        title,

        description,

        solved: false,

        likes: {},

        comments: {},

        created: Date.now()

    });

    console.log("✅ Firebase'e başarıyla kaydedildi");

    bugTitle.value = "";
    bugDescription.value = "";

} catch (err) {

    console.error("❌ Firebase Hatası:", err);

}

}
/* ===========================================
   Kart Oluştur
=========================================== */

function createCard(report) {

    const card = document.createElement("div");

    card.className = "bug-card";

    card.innerHTML = `

        <div class="bug-top">

            <div class="bug-title">

                ${escapeHTML(report.title)}

            </div>

            <span class="badge ${report.solved ? "fixed" : "open"}">

                ${report.solved ? "Çözüldü" : "Açık"}

            </span>

        </div>
<div class="bug-tags">

    <span class="game-tag">

        🎮 ${escapeHTML(report.game)}

    </span>

    <span class="type-tag ${report.type}">

        ${getTypeIcon(report.type)}
        ${getTypeName(report.type)}

    </span>

</div>
        <div class="bug-user">

            👤 ${escapeHTML(report.user)}

            •

            ${formatDate(report.created)}

        </div>

        <div class="bug-description">

            ${escapeHTML(report.description)}

        </div>

        <div class="bug-actions">

            <button
                class="action-btn like-btn"
                data-id="${report.id}">

                👍 ${report.likes ? Object.keys(report.likes).length : 0}

            </button>

            <button
                class="action-btn comment-btn"
                data-id="${report.id}">

                💬 ${report.comments ? Object.keys(report.comments).length : 0}

            </button>

           ${isAdmin ? `
<button
    class="action-btn solved-btn"
    data-id="${report.id}">
    ${report.solved ? "↩ Aç" : "✔ Çözüldü"}
</button>
` : ""}
${isAdmin ? `
<button
    class="action-btn delete-btn"
    data-id="${report.id}">
    🗑 Sil
</button>
` : ""}

        </div>

        <div
            id="comments-${report.id}"
            class="comments-area">

        </div>

    `;

    return card;

}

/* ===========================================
   Listele
=========================================== */

function renderReports(filter = "") {

    bugList.innerHTML = "";

    const text = filter.toLowerCase();

    reports.forEach(report => {

        if (
            !report.title.toLowerCase().includes(text) &&
            !report.description.toLowerCase().includes(text)
        ) {
            return;
        }

        bugList.appendChild(
            createCard(report)
        );

    });

}

/* ===========================================
   Güvenlik
=========================================== */

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}
/* ===========================================
   NovaPlay Bug Report
   Part 2
=========================================== */

/* ===========================================
   Rapor Bul
=========================================== */

function findReport(id){

    return reports.find(r => r.id === id);

}

/* ===========================================
   Beğeni
=========================================== */

function toggleLike(id) {

    const report = findReport(id);

    if (!report) return;

    const likes = report.likes || {};

    if (likes[currentUser]) {

        delete likes[currentUser];

    } else {

        likes[currentUser] = true;

    }

    update(
        ref(db, "reports/" + id),
        {
            likes
        }
    );

}
/* ===========================================
   Çözüldü
=========================================== */

function toggleSolved(id) {

    const report = findReport(id);

    if (!report) return;

    update(
        ref(db, "reports/" + id),
        {
            solved: !report.solved
        }
    );

}
/* ===========================================
   Yorum Ekle
=========================================== */

async function addComment(id) {

    if (currentUser === "Misafir") {

        alert("Yorum yapabilmek için giriş yapmalısın.");
        return;

    }

    const text = prompt("Yorumun:");

    if (!text) return;

    const comment = text.trim();

    if (!comment) return;

    const commentRef = push(
        ref(db, "reports/" + id + "/comments")
    );

    await set(commentRef, {

        user: currentUser,

        text: comment,

        date: Date.now()

    });

}

/* ===========================================
   Yorumları Göster
=========================================== */

function renderComments() {

    reports.forEach(report => {

        const area = document.getElementById(
            "comments-" + report.id
        );

        if (!area) return;

        area.innerHTML = "";

        Object.values(report.comments || {}).forEach(comment=>{
            const div = document.createElement("div");

            div.className = "comment";

            div.innerHTML = `

                <div class="comment-user">

                    👤 ${escapeHTML(comment.user)}

                    <span>

                    ${formatDate(comment.date)}

                    </span>

                </div>

                <div class="comment-text">

                    ${escapeHTML(comment.text)}

                </div>

            `;

            area.appendChild(div);

        });

    });

}
/* ===========================================
   NovaPlay Bug Report
   Part 3
=========================================== */

/* ===========================================
   Gönder
=========================================== */

sendBug.addEventListener("click", addReport);

/* ===========================================
   Arama
=========================================== */

searchBug.addEventListener("input", () => {

    renderReports(searchBug.value);

});

/* ===========================================
   Kart Butonları
=========================================== */

bugList.addEventListener("click", (e) => {

  const id = e.target.dataset.id;
if (e.target.classList.contains("delete-btn")) {

    deleteReport(id);
    return;

}
if (!id) return;
    if (e.target.classList.contains("like-btn")) {

        toggleLike(id);
        return;

    }

    if (e.target.classList.contains("comment-btn")) {

        addComment(id);
        return;

    }

    if (e.target.classList.contains("solved-btn")) {

        toggleSolved(id);
        return;

    }

});

/* ===========================================
   Enter ile Gönder
=========================================== */

bugTitle.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        e.preventDefault();

        addReport();

    }

});

/* ===========================================
   Başlat
=========================================== */

const reportsRef = ref(db, "reports");

onValue(reportsRef, (snapshot)=>{

    reports = [];

    snapshot.forEach(child=>{

        reports.unshift(child.val());

    });

    renderReports(searchBug.value);

    setTimeout(renderComments,0);

});
function getTypeIcon(type){

    switch(type){

        case "Bug":
            return "🐞";

        case "Suggestion":
            return "💡";

        case "Performance":
            return "⚡";

        case "Graphic":
            return "🎨";

        default:
            return "";

    }

}

function getTypeName(type){

    switch(type){

        case "Bug":
            return "Hata";

        case "Suggestion":
            return "Öneri";

        case "Performance":
            return "Performans";

        case "Graphic":
            return "Grafik";

        default:
            return type;

    }

}
async function deleteReport(id){

    if(!isAdmin) return;

    if(!confirm("Bu bildirimi silmek istiyor musun?"))
        return;

    await remove(ref(db,"reports/"+id));

}