import {
    ref,
    push,
    onValue,
    query,
    orderByChild,
    limitToLast
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

import { db } from "./firebase.js";

// ======================================
// CHAT DURUMU
// ======================================

let chatRoomId = null;
let chatPlayerId = null;
let chatUsername = "Oyuncu";

let messagesRef = null;
let messagesListener = null;


// ======================================
// SOHBETİ BAŞLAT
// ======================================

export function initChat(roomId, playerId, username = "Oyuncu") {

    if (!roomId || !playerId) {
        console.warn("❌ Chat başlatılamadı. Room ID veya Player ID yok.");
        return;
    }

    chatRoomId = roomId;
    chatPlayerId = playerId;
    chatUsername = username || "Oyuncu";

    messagesRef =
        ref(
            db,
            `rooms/${chatRoomId}/messages`
        );


    const messagesQuery =
        query(
            messagesRef,
            orderByChild("timestamp"),
            limitToLast(50)
        );


    // Eski listener varsa kapat
    if (messagesListener) {
        messagesListener();
        messagesListener = null;
    }


    // ==================================
    // MESAJLARI DİNLE
    // ==================================

    messagesListener =
        onValue(
            messagesQuery,
            snapshot => {

                const messages = [];

                snapshot.forEach(
                    child => {

                        messages.push({
                            id: child.key,
                            ...child.val()
                        });

                    }
                );

                renderMessages(messages);

            }
        );


    console.log(
        "💬 NovaBridge sohbeti başlatıldı."
    );

}


// ======================================
// MESAJ GÖNDER
// ======================================

export async function sendChatMessage(text) {

    if (!messagesRef) {
        console.warn(
            "❌ Chat henüz başlatılmadı."
        );
        return;
    }


    text =
        String(text)
            .trim();


    if (!text) {
        return;
    }


    // Maksimum 200 karakter
    if (text.length > 200) {
        text =
            text.substring(
                0,
                200
            );
    }


    try {

        await push(
            messagesRef,
            {
                playerId:
                    chatPlayerId,

                username:
                    chatUsername,

                text:
                    text,

                timestamp:
                    Date.now()
            }
        );

    }
    catch (error) {

        console.error(
            "❌ Mesaj gönderilemedi:",
            error
        );

    }

}


// ======================================
// MESAJLARI GÖSTER
// ======================================

function renderMessages(messages) {

    const container =
        document.getElementById(
            "chatMessages"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    messages.forEach(
        message => {

            const messageElement =
                document.createElement(
                    "div"
                );

            messageElement.className =
                "chat-message";


            const nameElement =
                document.createElement(
                    "strong"
                );

            nameElement.textContent =
                message.username ||
                "Oyuncu";


            const textElement =
                document.createElement(
                    "span"
                );

            textElement.textContent =
                ": " +
                (
                    message.text ||
                    ""
                );


            messageElement.appendChild(
                nameElement
            );

            messageElement.appendChild(
                textElement
            );


            // Kendi mesajımız
            if (
                message.playerId ===
                chatPlayerId
            ) {

                messageElement.classList.add(
                    "own-message"
                );

            }


            container.appendChild(
                messageElement
            );

        }
    );


    // En alta kaydır
    container.scrollTop =
        container.scrollHeight;

}


// ======================================
// CHAT KAPAT
// ======================================

export function closeChat() {

    if (messagesListener) {

        messagesListener();

        messagesListener = null;

    }

    const chatBox =
        document.getElementById("chatBox");

    if (chatBox) {
        chatBox.style.display = "none";
    }

    chatRoomId = null;
    chatPlayerId = null;
    chatUsername = "Oyuncu";
    messagesRef = null;
}
// ======================================
// CHAT UI
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const input =
            document.getElementById(
                "chatInput"
            );

        const sendButton =
            document.getElementById(
                "chatSend"
            );


        if (!input || !sendButton) {
            return;
        }


        // Gönder butonu
        sendButton.addEventListener(
            "click",
            () => {

                sendChatMessage(
                    input.value
                );

                input.value = "";

                input.focus();

            }
        );


        // Enter ile gönder
        input.addEventListener(
    "keydown",
    event => {

        window.chatTyping = true;

        if (event.key === "Enter") {

            event.preventDefault();

            sendChatMessage(
                input.value
            );

            input.value = "";

            return;
        }

    }
);

    }
);
// ======================================
// CHAT GÖSTER / GİZLE
// ======================================

export function showChat() {

    const chatBox =
        document.getElementById("chatBox");

    if (chatBox) {
        chatBox.style.display = "flex";
    }

}


export function hideChat() {

    const chatBox =
        document.getElementById("chatBox");

    if (chatBox) {
        chatBox.style.display = "none";
    }

}
// ======================================
// CHAT AÇ / KAPAT
// ======================================

const chatToggle =
    document.getElementById("chatToggle");

const chatBox =
    document.getElementById("chatBox");

if (chatToggle && chatBox) {

    chatToggle.addEventListener(
        "click",
        () => {

            const isHidden =
                chatBox.classList.toggle(
                    "chat-hidden"
                );

            chatToggle.textContent =
                isHidden
                    ? "💬"
                    : "✕";

        }
    );

}