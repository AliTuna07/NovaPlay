const playBtn = document.getElementById('playBtn');
const cards = document.querySelectorAll('.card');

playBtn.addEventListener('click', () => {
    playBtn.classList.toggle('active');
    playBtn.textContent = playBtn.classList.contains('active') ? 'Oyun Başlatıldı' : 'Şimdi Oyna';
});

cards.forEach((card) => {
    card.addEventListener('click', () => {
        cards.forEach((item) => item.classList.remove('selected'));
        card.classList.add('selected');
    });
});
