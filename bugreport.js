/* ===========================================
   NovaPlay Bug Report
   Part 1
=========================================== */

const STORAGE_KEY = "novaBugReports";

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

/* ===========================================
   Storage
=========================================== */

function loadReports() {

    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) return [];

    try {

        return JSON.parse(data);

    } catch {

        return [];

    }

}

function saveReports(reports) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(reports)
    );

}

let reports = loadReports();

/* ===========================================
   Tarih
=========================================== */

function formatDate(date) {

    return new Date(date).toLocaleString("tr-TR");

}

/* ===========================================
   Yeni Hata
=========================================== */

function addReport() {

    const title = bugTitle.value.trim();
    const description = bugDescription.value.trim();

    if (!title || !description) {

        alert("Lütfen bütün alanları doldur.");

        return;

    }

    const report = {

    id: Date.now(),

    user: currentUser,

    game: bugGame.value,

    type: bugType.value,

    title,

    description,

    solved:false,

    likes:[],

    comments:[],

    created:new Date().toISOString()

};

    reports.unshift(report);

    saveReports(reports);

    bugTitle.value = "";
    bugDescription.value = "";

    renderReports();

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

                👍 ${report.likes.length}

            </button>

            <button
                class="action-btn comment-btn"
                data-id="${report.id}">

                💬 ${report.comments.length}

            </button>

            <button
                class="action-btn solved-btn"
                data-id="${report.id}">

                ${report.solved ? "↩ Aç" : "✔ Çözüldü"}

            </button>

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

function findReport(id) {

    return reports.find(report => report.id == id);

}

/* ===========================================
   Beğeni
=========================================== */

function toggleLike(id) {

    const report = findReport(id);

    if (!report) return;

    const index = report.likes.indexOf(currentUser);

    if (index === -1) {

        report.likes.push(currentUser);

    } else {

        report.likes.splice(index, 1);

    }

    saveReports(reports);

    renderReports(searchBug.value);

}

/* ===========================================
   Çözüldü
=========================================== */

function toggleSolved(id) {

    const report = findReport(id);

    if (!report) return;

    report.solved = !report.solved;

    saveReports(reports);

    renderReports(searchBug.value);

}

/* ===========================================
   Yorum Ekle
=========================================== */

function addComment(id) {

    if (currentUser === "Misafir") {

        alert("Yorum yapabilmek için giriş yapmalısın.");

        return;

    }

    const text = prompt("Yorumun:");

    if (!text) return;

    const comment = text.trim();

    if (!comment) return;

    const report = findReport(id);

    if (!report) return;

    report.comments.push({

        user: currentUser,

        text: comment,

        date: new Date().toISOString()

    });

    saveReports(reports);

    renderReports(searchBug.value);

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

        report.comments.forEach(comment => {

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

    const id = Number(e.target.dataset.id);

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

function initBugReport() {

    renderReports();

}

initBugReport();
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