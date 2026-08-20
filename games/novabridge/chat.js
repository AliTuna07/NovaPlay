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
// CHAT BAŞLAT
// ======================================

export function initChat(
    roomId,
    playerId,
    username = "Oyuncu"
) {

    if (!roomId || !playerId) {

        console.warn(
            "❌ Chat başlatılamadı. Room ID veya Player ID eksik."
        );

        return;
    }


    // Eski listener varsa kaldır
    if (messagesListener) {

        messagesListener();

        messagesListener = null;

    }


    chatRoomId = roomId;

    chatPlayerId = playerId;

    chatUsername =
        username || "Oyuncu";


    messagesRef = ref(
        db,
        `rooms/${chatRoomId}/messages`
    );


    const messagesQuery = query(
        messagesRef,
        orderByChild("timestamp"),
        limitToLast(50)
    );


    // ==================================
    // MESAJLARI DİNLE
    // ==================================

    messagesListener = onValue(
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
        "💬 NovaBridge sohbeti başlatıldı:",
        roomId
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
        String(text || "")
            .trim();


    if (!text) {
        return;
    }


    // Maksimum 200 karakter
    text =
        text.substring(
            0,
            200
        );


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


        console.log(
            "💬 Mesaj gönderildi."
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

        console.warn(
            "❌ #chatMessages bulunamadı."
        );

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


            // ==================================
            // OYUNCU ADI
            // ==================================

            const nameElement =
                document.createElement(
                    "strong"
                );


            nameElement.textContent =
                message.username ||
                "Oyuncu";


            // ==================================
            // MESAJ
            // ==================================

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


            // ==================================
            // KENDİ MESAJIMIZ
            // ==================================

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
// CHAT AÇ
// ======================================

export function showChat() {

    const chatBox =
        document.getElementById(
            "chatBox"
        );


    const chatToggle =
        document.getElementById(
            "chatToggle"
        );


    if (!chatBox) {
        return;
    }


    chatBox.classList.remove(
        "chat-hidden"
    );


    if (chatToggle) {

        chatToggle.textContent =
            "✕";

    }

}


// ======================================
// CHAT GİZLE
// ======================================

export function hideChat() {

    const chatBox =
        document.getElementById(
            "chatBox"
        );


    const chatToggle =
        document.getElementById(
            "chatToggle"
        );


    if (!chatBox) {
        return;
    }


    chatBox.classList.add(
        "chat-hidden"
    );


    if (chatToggle) {

        chatToggle.textContent =
            "💬";

    }

}


// ======================================
// CHAT KAPAT
// ======================================

export function closeChat() {

    if (messagesListener) {

        messagesListener();

        messagesListener = null;

    }


    chatRoomId = null;

    chatPlayerId = null;

    chatUsername = "Oyuncu";

    messagesRef = null;


    hideChat();


    const container =
        document.getElementById(
            "chatMessages"
        );


    if (container) {

        container.innerHTML = "";

    }


    console.log(
        "💬 Chat kapatıldı."
    );

}


// ======================================
// CHAT UI
// ======================================

// ======================================
// CHAT BUTONU
// ======================================

function setupChatUI() {

    const chatToggle =
        document.getElementById("chatToggle");

    const chatBox =
        document.getElementById("chatBox");

    const input =
        document.getElementById("chatInput");

    const sendButton =
        document.getElementById("chatSend");


    console.log("💬 Chat UI kontrolü:", {
        chatToggle,
        chatBox,
        input,
        sendButton
    });


    if (!chatToggle || !chatBox) {

        console.error(
            "❌ Chat butonu veya chat kutusu bulunamadı!"
        );

        return;
    }


    // Başlangıçta kapalı
    chatBox.classList.add("chat-hidden");

    chatToggle.textContent = "💬";


    // ==================================
    // CHAT AÇ / KAPAT
    // ==================================

    chatToggle.onclick = function (event) {

        event.preventDefault();

        event.stopPropagation();


        const isHidden =
            chatBox.classList.contains(
                "chat-hidden"
            );


        if (isHidden) {

            chatBox.classList.remove(
                "chat-hidden"
            );

            chatToggle.textContent = "✕";

            console.log(
                "💬 Sohbet açıldı."
            );


            if (input) {

                setTimeout(() => {

                    input.focus();

                }, 100);

            }

        }
        else {

            chatBox.classList.add(
                "chat-hidden"
            );

            chatToggle.textContent = "💬";

            console.log(
                "💬 Sohbet kapatıldı."
            );


            if (input) {
                input.blur();
            }

        }

    };


    // ==================================
    // MESAJ GÖNDER
    // ==================================

    async function sendMessage() {

        if (!input) {
            return;
        }


        const text =
            input.value.trim();


        if (!text) {
            return;
        }


        await sendChatMessage(text);


        input.value = "";

        input.focus();

    }


    // ==================================
    // GÖNDER BUTONU
    // ==================================

    if (sendButton) {

        sendButton.onclick = function (event) {

            event.preventDefault();

            event.stopPropagation();

            sendMessage();

        };

    }


    // ==================================
    // ENTER
    // ==================================

    if (input) {

        input.onkeydown = function (event) {

            event.stopPropagation();

            window.chatTyping = true;


            if (event.key === "Enter") {

                event.preventDefault();

                sendMessage();

            }

        };


        input.onfocus = function () {

            window.chatTyping = true;

        };


        input.onblur = function () {

            window.chatTyping = false;

        };

    }

}


// ======================================
// BAŞLAT
// ======================================

setupChatUI();