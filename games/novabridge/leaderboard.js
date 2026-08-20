import { db } from "./firebase.js";

import {
    ref,
    onValue,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

// ======================================
// GENEL LEADERBOARD
// ======================================

const leaderboardRef =
    ref(db, "leaderboard");


// ======================================
// LEADERBOARD PANELİ
// ======================================

function createLeaderboardUI() {

    if (
        document.getElementById(
            "leaderboard"
        )
    ) {
        return;
    }

    const leaderboard =
        document.createElement("div");

    leaderboard.id =
        "leaderboard";

    leaderboard.innerHTML = `

        <div class="leaderboard-title">
            🏆 LEADERBOARD
        </div>

        <div
            id="leaderboard-list"
            class="leaderboard-list"
        >
            <div class="leaderboard-loading">
                Yükleniyor...
            </div>
        </div>

    `;

    document.body.appendChild(
        leaderboard
    );

    loadLeaderboard();

}


// ======================================
// LEADERBOARD VERİLERİNİ DİNLE
// ======================================

function loadLeaderboard() {

    onValue(
        leaderboardRef,
        snapshot => {

            const list =
                document.getElementById(
                    "leaderboard-list"
                );

            if (!list) {
                return;
            }


            // ==================================
            // HİÇ OYUNCU YOK
            // ==================================

            if (
                !snapshot.exists()
            ) {

                list.innerHTML = `

                    <div class="leaderboard-empty">
                        Henüz kazanan yok.
                    </div>

                `;

                return;

            }


            const data =
                snapshot.val();


            // ==================================
            // OYUNCULARI DİZİYE ÇEVİR
            // ==================================

            const players =
                Object.entries(data)
                    .map(
                        ([id, player]) => ({

                            id,

                            name:
                                player.name ||
                                "Oyuncu",

                            wins:
                                player.wins ||
                                0

                        })
                    )
                    .sort(
                        (a, b) =>
                            b.wins - a.wins
                    );


            // İlk 10 oyuncu
            const topPlayers =
                players.slice(0, 10);


            // ==================================
            // LİSTEYİ OLUŞTUR
            // ==================================

            list.innerHTML =
                topPlayers
                    .map(
                        (player, index) => {

                            let rank;

                            if (index === 0) {

                                rank = "🥇";

                            }
                            else if (
                                index === 1
                            ) {

                                rank = "🥈";

                            }
                            else if (
                                index === 2
                            ) {

                                rank = "🥉";

                            }
                            else {

                                rank =
                                    `${index + 1}.`;

                            }


                            return `

                                <div
                                    class="
                                        leaderboard-row
                                        ${index < 3
                                            ? "top-player"
                                            : ""}
                                    "
                                >

                                    <div
                                        class="
                                            leaderboard-rank
                                        "
                                    >
                                        ${rank}
                                    </div>

                                    <div
                                        class="
                                            leaderboard-name
                                        "
                                    >
                                        ${escapeHTML(
                                            player.name
                                        )}
                                    </div>

                                    <div
                                        class="
                                            leaderboard-wins
                                        "
                                    >
                                        🏆
                                        ${player.wins}
                                    </div>

                                </div>

                            `;

                        }
                    )
                    .join("");

        }
    );

}


// ======================================
// KAZANMA EKLE
// ======================================

export async function addWin(
    playerId,
    playerName
) {

    if (!playerId) {
        return;
    }


    const playerRef =
        ref(
            db,
            `leaderboard/${playerId}`
        );


    try {

        await runTransaction(
            playerRef,
            currentData => {

                // İlk galibiyet
                if (!currentData) {

                    return {

                        name:
                            playerName ||
                            "Oyuncu",

                        wins: 1

                    };

                }


                // Mevcut oyuncu
                return {

                    name:
                        playerName ||
                        currentData.name ||
                        "Oyuncu",

                    wins:
                        (currentData.wins || 0) + 1

                };

            }
        );


        console.log(
            "🏆 Genel leaderboard güncellendi!"
        );

    }
    catch (error) {

        console.error(
            "❌ Leaderboard güncellenemedi:",
            error
        );

    }

}


// ======================================
// HTML GÜVENLİĞİ
// ======================================

function escapeHTML(text) {

    return String(text)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ======================================
// BAŞLAT
// ======================================

export function initLeaderboard() {

    createLeaderboardUI();

}