
import { db } from "./firebase.js";

import {
    ref,
    set,
    update,
    onValue,
    onDisconnect,
    remove,
    push,
    get,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
// ============================================
// AFTERMATH ONLINE V2
// ============================================

const MAX_PLAYERS = 10;
const POSITION_UPDATE_INTERVAL = 100;
const CONNECTION_TIMEOUT = 15000;

let connected = false;

let currentRoomId = null;
let currentPlayerId = null;
let currentTeam = null;

let playersListener = null;
let connectionListener = null;
let playersCallback = null;

let lastPositionUpdate = 0;
let connectionPromise = null;

// ============================================
// FIREBASE BAĞLANTISI
// ============================================

connectionListener = onValue(
    ref(db, ".info/connected"),
    snapshot => {
        connected = snapshot.val() === true;

        console.log(
            connected
                ? "🔥 Aftermath Firebase bağlantısı hazır."
                : "⏳ Firebase bağlantısı bekleniyor..."
        );
    },
    error => {
        connected = false;
        console.error("Firebase bağlantı dinleyicisi:", error);
    }
);

export function isFirebaseConnected() {
    return connected;
}

export function isInRoom() {
    return Boolean(currentRoomId && currentPlayerId);
}

export function getCurrentRoomId() {
    return currentRoomId;
}

export function getCurrentPlayerId() {
    return currentPlayerId;
}

export function getCurrentTeam() {
    return currentTeam;
}

export function onPlayersUpdate(callback) {
    playersCallback = callback;
}

function waitForFirebaseConnection() {
    if (connected) {
        return Promise.resolve();
    }

    if (connectionPromise) {
        return connectionPromise;
    }

    connectionPromise = new Promise((resolve, reject) => {
        let finished = false;

        const timeoutId = setTimeout(() => {
            finish(
                new Error(
                    "Firebase bağlantısı 15 saniye içinde kurulamadı."
                )
            );
        }, CONNECTION_TIMEOUT);

        const unsubscribe = onValue(
            ref(db, ".info/connected"),
            snapshot => {
                if (snapshot.val() === true) {
                    finish(null);
                }
            },
            error => {
                finish(error);
            }
        );

        function finish(error) {
            if (finished) return;
            finished = true;

            clearTimeout(timeoutId);
            unsubscribe();

            if (error) {
                reject(error);
            } else {
                resolve();
            }
        }
    }).finally(() => {
        connectionPromise = null;
    });

    return connectionPromise;
}

// ============================================
// ODA OLUŞTUR
// ============================================

export async function createRoom(playerName = "Oyuncu") {
    await waitForFirebaseConnection();

    if (isInRoom()) {
        await leaveRoom();
    }

    const roomRef = push(ref(db, "rooms"));
    const roomId = roomRef.key;

    if (!roomId) {
        throw new Error("Firebase oda kimliği oluşturamadı.");
    }

    const roomData = {
        mode: "team-deathmatch",
        status: "waiting",
        maxPlayers: MAX_PLAYERS,
        createdAt: Date.now()
    };

    // Boş players nesnesi yazmıyoruz.
    // Firebase boş nesneleri veritabanında saklamaz.
    await set(roomRef, roomData);

    console.log("🆕 Oda kaydedildi:", roomId);

    try {
        await joinRoom(roomId, playerName);

        console.log("✅ Oda oluşturuldu ve katılım tamamlandı.");

        return roomId;
    } catch (error) {
        // Hata ayıklarken odayı otomatik silmiyoruz.
        console.error(
            "Oda oluşturuldu ancak katılım başarısız:",
            roomId,
            error
        );

        throw error;
    }
}

// ============================================
// ODAYA KATIL
// ============================================

export async function joinRoom(roomId, playerName = "Oyuncu") {
    await waitForFirebaseConnection();

    roomId = String(roomId || "").trim();

    if (!roomId) {
        throw new Error("Oda kodu boş olamaz.");
    }

    if (isInRoom()) {
        if (currentRoomId === roomId) {
            return roomId;
        }

        await leaveRoom();
    }

    const roomRef = ref(db, `rooms/${roomId}`);
    const roomSnapshot = await get(roomRef);

    if (!roomSnapshot.exists()) {
        throw new Error("Oda bulunamadı: " + roomId);
    }

    const room = roomSnapshot.val();

    if (room.mode !== "team-deathmatch") {
        throw new Error("Bu oda Aftermath takım maçına ait değil.");
    }

    if (room.status !== "waiting") {
        throw new Error("Bu oda şu anda oyuncu kabul etmiyor.");
    }

    // Oyuncu listesini ayrı oku.
    // Boş liste için Firebase'de null dönmesi normaldir.
    const playersRef = ref(db, `rooms/${roomId}/players`);
    const playersSnapshot = await get(playersRef);
    const players = playersSnapshot.val() || {};

    const maxPlayers = Number(room.maxPlayers) || MAX_PLAYERS;
    const playerCount = Object.keys(players).length;

    if (playerCount >= maxPlayers) {
        throw new Error("Oda dolu.");
    }

    const blueCount = Object.values(players).filter(
        player => player?.team === "blue"
    ).length;

    const redCount = Object.values(players).filter(
        player => player?.team === "red"
    ).length;

    const team = blueCount <= redCount ? "blue" : "red";

    const playerRef = push(playersRef);
    const playerId = playerRef.key;

    if (!playerId) {
        throw new Error("Oyuncu kimliği oluşturulamadı.");
    }

    const safeName =
        String(playerName || "Oyuncu").trim().slice(0, 20) || "Oyuncu";

    const playerData = {
        id: playerId,
        name: safeName,
        team,

        x: 0,
        y: 2,
        z: 12,
        rotationY: 0,

        health: 100,
        score: 0,
        kills: 0,
        deaths: 0,
        alive: true,

        joinedAt: Date.now()
    };

    let disconnectRegistered = false;

    try {
        // Önce bağlantı koparsa kaydın temizlenmesini ayarla.
        await onDisconnect(playerRef).remove();
        disconnectRegistered = true;

        // Oyuncuyu doğrudan kendi anahtarına yaz.
        await set(playerRef, playerData);

        currentRoomId = roomId;
        currentPlayerId = playerId;
        currentTeam = team;

        lastPositionUpdate = 0;

        startPlayersListener(roomId);

        console.log("✅ Online odaya katıldın:", roomId);
        console.log("🪪 Oyuncu kimliğin:", playerId);
        console.log("🛡️ Takımın:", team);

        return roomId;
    } catch (error) {
        if (disconnectRegistered) {
            await onDisconnect(playerRef).cancel().catch(() => {});
        }

        await remove(playerRef).catch(() => {});

        currentRoomId = null;
        currentPlayerId = null;
        currentTeam = null;

        console.error("Oyuncu kaydı başarısız:", error);

        throw error;
    }
}

// ============================================
// OYUNCULARI DİNLE
// ============================================

function startPlayersListener(roomId) {
    stopPlayersListener();

    const playersRef = ref(db, `rooms/${roomId}/players`);

    playersListener = onValue(
        playersRef,
        snapshot => {
            const players = snapshot.val() || {};

            if (playersCallback) {
                playersCallback(players);
            }

            console.log(
                "👥 Odadaki oyuncu sayısı:",
                Object.keys(players).length
            );
        },
        error => {
            console.error("Oyuncu listesi okunamadı:", error);
        }
    );
}

function stopPlayersListener() {
    if (playersListener) {
        playersListener();
        playersListener = null;
    }
}

// ============================================
// KONUM GÜNCELLE
// ============================================

export function updateMyPosition(position) {
    if (!isInRoom() || !connected || !position) {
        return;
    }

    const now = performance.now();

    if (now - lastPositionUpdate < POSITION_UPDATE_INTERVAL) {
        return;
    }

    lastPositionUpdate = now;

    const x = Number(position.x);
    const y = Number(position.y);
    const z = Number(position.z);
    const rotationY = Number(position.rotationY) || 0;

    if (![x, y, z, rotationY].every(Number.isFinite)) {
        console.warn("Geçersiz oyuncu konumu gönderilmedi.");
        return;
    }

    const playerRef = ref(
        db,
        `rooms/${currentRoomId}/players/${currentPlayerId}`
    );

    update(playerRef, {
        x,
        y,
        z,
        rotationY
    }).catch(error => {
        console.error("Konum gönderilemedi:", error);
    });
}

// ============================================
// CAN VE SKOR GÜNCELLE
// ============================================

export function updateMyStats(stats = {}) {
    if (!isInRoom() || !connected) {
        return;
    }

    const allowedFields = [
        "health",
        "score",
        "kills",
        "deaths",
        "alive"
    ];

    const safeStats = {};

    for (const field of allowedFields) {
        if (Object.hasOwn(stats, field)) {
            safeStats[field] = stats[field];
        }
    }

    if (Object.keys(safeStats).length === 0) {
        return;
    }

    const playerRef = ref(
        db,
        `rooms/${currentRoomId}/players/${currentPlayerId}`
    );

    update(playerRef, safeStats).catch(error => {
        console.error("İstatistikler gönderilemedi:", error);
    });
}

// ============================================
// RASTGELE MAÇA KATIL
// ============================================

export async function joinRandomRoom(playerName = "Oyuncu") {
    await waitForFirebaseConnection();

    if (isInRoom()) {
        await leaveRoom();
    }

    const roomsSnapshot = await get(ref(db, "rooms"));
    const rooms = roomsSnapshot.val() || {};

    const candidates = Object.entries(rooms)
        .filter(([, room]) => {
            return (
                room?.mode === "team-deathmatch" &&
                room?.status === "waiting"
            );
        })
        .sort((a, b) => {
            return (a[1].createdAt || 0) - (b[1].createdAt || 0);
        });

    for (const [roomId, room] of candidates) {
        try {
            const playersSnapshot = await get(
                ref(db, `rooms/${roomId}/players`)
            );

            const players = playersSnapshot.val() || {};
            const maxPlayers = Number(room.maxPlayers) || MAX_PLAYERS;

            if (Object.keys(players).length >= maxPlayers) {
                continue;
            }

            await joinRoom(roomId, playerName);

            console.log("🎮 Mevcut maça katıldın:", roomId);

            return roomId;
        } catch (error) {
            console.warn(
                "Bu odaya katılınamadı:",
                roomId,
                error.message
            );
        }
    }

    console.log("🆕 Uygun oda bulunamadı, yeni oda oluşturuluyor.");

    return await createRoom(playerName);
}

// ============================================
// ODADAN AYRIL
// ============================================

export async function leaveRoom() {
    const roomId = currentRoomId;
    const playerId = currentPlayerId;

    stopPlayersListener();

    // Yerel durumu temizle.
    currentRoomId = null;
    currentPlayerId = null;
    currentTeam = null;
    lastPositionUpdate = 0;

    if (roomId && playerId) {
        const playerRef = ref(
            db,
            `rooms/${roomId}/players/${playerId}`
        );

        await onDisconnect(playerRef).cancel().catch(() => {});

        await remove(playerRef).catch(error => {
            console.error("Oyuncu kaydı silinemedi:", error);
        });
    }

    if (playersCallback) {
        playersCallback({});
    }

    console.log("🚪 Online odadan ayrıldın.");
}
// ============================================
// RAKİBE HASAR VER
// ============================================

export async function damagePlayer(targetPlayerId, damage) {
    if (!isInRoom() || !connected) {
        return { success: false, reason: "connection" };
    }

    if (!targetPlayerId || targetPlayerId === currentPlayerId) {
        return { success: false, reason: "invalid-target" };
    }

    const safeDamage = Math.max(0, Math.min(100, Number(damage)));

    if (!Number.isFinite(safeDamage) || safeDamage <= 0) {
        return { success: false, reason: "invalid-damage" };
    }

    const targetRef = ref(
        db,
        `rooms/${currentRoomId}/players/${targetPlayerId}`
    );

    try {
        const result = await runTransaction(targetRef, player => {
            if (!player || player.alive !== true) {
                return;
            }

            const currentHealth = Number(player.health);

            if (!Number.isFinite(currentHealth) || currentHealth <= 0) {
                return;
            }

            const newHealth = Math.max(0, currentHealth - safeDamage);

            return {
                ...player,
                health: newHealth,
                alive: newHealth > 0
            };
        });

        if (!result.committed) {
            return { success: false, reason: "not-alive" };
        }

        const updatedPlayer = result.snapshot.val();

        return {
            success: true,
            health: updatedPlayer.health,
            killed: updatedPlayer.health <= 0
        };
    } catch (error) {
        console.error("Rakibe hasar verilemedi:", error);
        return { success: false, reason: "firebase-error" };
    }
}
export async function awardKill() {
    if (!isInRoom() || !currentPlayerId || !connected) {
        return false;
    }

    const playerRef = ref(
        db,
        `rooms/${currentRoomId}/players/${currentPlayerId}`
    );

    try {
        const result = await runTransaction(playerRef, player => {
            if (!player) return;

            return {
                ...player,
                kills: (Number(player.kills) || 0) + 1,
                score: (Number(player.score) || 0) + 100
            };
        });

        return result.committed;
    } catch (error) {
        console.error("Kill ödülü verilemedi:", error);
        return false;
    }
}

export async function getCurrentKillCount() {
    if (!isInRoom() || !connected) return 0;

    try {
        const playerRef = ref(
            db,
            `rooms/${currentRoomId}/players/${currentPlayerId}`
        );

        const snapshot = await get(playerRef);

        if (!snapshot.exists()) return 0;

        return Number(snapshot.val().kills) || 0;
    } catch (error) {
        console.error("Öldürme sayısı okunamadı:", error);
        return 0;
    }
}
