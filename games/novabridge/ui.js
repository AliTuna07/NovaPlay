// ======================================
// OYUN BİTTİ EKRANI
// ======================================

let gameOverScreen = null;


// ======================================
// BAŞLANGIÇ BUTONLARI
// ======================================

function setupStartButtons() {

    const createButton =
        document.getElementById(
            "createRoom"
        );

    const joinButton =
        document.getElementById(
            "joinRoom"
        );

    const randomButton =
        document.getElementById(
            "randomRoom"
        );


    // ==============================
    // ODA OLUŞTUR
    // ==============================

    if (createButton) {

        createButton.addEventListener(
            "click",
            () => {

                console.log(
                    "🏠 Oda oluşturma seçildi"
                );

                window.dispatchEvent(
    new CustomEvent(
        "novabridge-start"
    )
);

            }
        );

    }


    // ==============================
    // ODAYA KATIL
    // ==============================

    if (joinButton) {

        joinButton.addEventListener(
            "click",
            () => {

                console.log(
                    "🚪 Odaya katıl seçildi"
                );

                window.dispatchEvent(
                    new CustomEvent(
                        "novabridge-start"
                    )
                );

            }
        );

    }


    // ==============================
    // RASTGELE GİR
    // ==============================

    if (randomButton) {

        randomButton.addEventListener(
            "click",
            () => {

                console.log(
                    "🎲 Rastgele oda aranıyor..."
                );

                window.dispatchEvent(
                    new CustomEvent(
                        "novabridge-start"
                    )
                );

            }
        );

    }

}


if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        setupStartButtons
    );

}
else {

    setupStartButtons();

}


// ======================================
// DOM HAZIR OLUNCA BUTONLARI BAĞLA
// ======================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        setupStartButtons
    );

}
else {

    setupStartButtons();

}


// ======================================
// OYUN BİTTİ
// ======================================

export function showGameOver(
    onSpectate,
    onExit
) {

    if (gameOverScreen) return;


    gameOverScreen =
        document.createElement("div");


    gameOverScreen.id =
        "game-over-screen";


    gameOverScreen.innerHTML = `

        <div class="game-over-box">

            <h1>OYUN BİTTİ</h1>

            <p id="game-over-message">
                3 saniye sonra seçenekler açılacak...
            </p>

            <div
                id="game-over-buttons"
                style="display:none;"
            >

                <button id="spectate-button">
                    👁️ İzleyici Olarak Katıl
                </button>

                <button id="exit-button">
                    🚪 Oyundan Çık
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        gameOverScreen
    );


    // ==================================
    // GERİ SAYIM
    // ==================================

    let seconds = 3;


    const message =
        document.getElementById(
            "game-over-message"
        );


    const countdown =
        setInterval(
            () => {

                seconds--;


                if (seconds > 0) {

                    message.textContent =
                        `${seconds} saniye sonra seçenekler açılacak...`;

                }
                else {

                    clearInterval(
                        countdown
                    );


                    message.style.display =
                        "none";


                    document.getElementById(
                        "game-over-buttons"
                    ).style.display =
                        "flex";

                }

            },
            1000
        );


    // ==================================
    // İZLEYİCİ
    // ==================================

    document.getElementById(
        "spectate-button"
    ).addEventListener(
        "click",
        () => {

            onSpectate();

            gameOverScreen.remove();

            gameOverScreen = null;

        }
    );


    // ==================================
    // OYUNDAN ÇIK
    // ==================================

    document.getElementById(
        "exit-button"
    ).addEventListener(
        "click",
        () => {

            onExit();

        }
    );

}
