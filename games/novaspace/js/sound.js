// =====================================
// 🔊 NOVACRAFT SES SİSTEMİ
// =====================================

const blockPlaceSound =
    new Audio(
        new URL(
            "../sounds/block-place.mp3",
            import.meta.url
        ).href
    );


// =====================================
// 🎵 ARKA PLAN MÜZİĞİ
// =====================================

const backgroundMusic =
    new Audio(
        new URL(
            "../sounds/background.mp3",
            import.meta.url
        ).href
    );

backgroundMusic.loop = true;
backgroundMusic.volume = 0.25;


// =====================================
// 🧱 BLOK KOYMA SESİ
// =====================================

export function playBlockPlaceSound() {

    blockPlaceSound.currentTime = 0;

    blockPlaceSound.play().catch(() => {});

}


// =====================================
// 🎵 MÜZİĞİ BAŞLAT
// =====================================

export function startBackgroundMusic() {

    backgroundMusic.volume = 0.08;

    backgroundMusic.play()
        .then(() => {

            console.log(
                "🎵 Arka plan müziği başladı!"
            );

        })
        .catch((error) => {

            console.error(
                "🎵 Müzik hatası:",
                error.name,
                error.message
            );

        });

}