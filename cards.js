const lettersData = [
    "I don't think I say this enough, but I hope u know ur smile has a way of making everything feel lighter. Even on the toughest days, seeing you happy somehow makes the world feel a little bit brighter.",
    "One thing I really admire about you is ur strength. No matter what comes ur way, you always find a way to keep going, and that's something I look up to.",
    "It's your special day, and I genuinely hope this year brings you closer to everything u've been dreaming about. You deserve happiness, success, and all the good things life has to offer.",
    "In case you need a reminder today: u're loved by many(specifically me & the other babies u carried HAHHAHAHHA), capable, and more amazing than you probably give yourself credit for. Keep believing in yourself because there's so much you can do.",
    "Please never let anyone make you doubt your worth. You have such a beautiful heart, a kind soul, and so much potential ahead of you. Keep shining the way you always do ahh.",
    "I hope you always remember that you're appreciated more than you realize. The people around you are lucky to have someone as caring, genuine, and wonderful as you in their lives.",
    "I never had the chance to say this, so I'll take this opportunity to say it na since hindi ko naman sha kaya sabihin sayo sa chat wahahaha. You probably know naman na what I feel about u and I also hope napaparamdam ko sha. I admit nung una medjo takot pa ako to tell u what I feel kasi baka platonic lang sha and baka na-overwhelm lang, but later on I came to realize na I like u nga. Hindi ko pa masabi ung exact reason why nagustuhan kita, but I'm certain with this thing, I want to know the real Zyne... I want to learn those things that makes u happy. What I'm trying to say here is that kung ano man ung maging result netong meron tayo ngayon I'll be good with anything basta maging comfy ka lang.",
    "Happy Happy Birthday, boss wifey! I hope today is filled with laughter, good memories, and all the things that makes you happy. Here's to another year of growth, unforgettable moments, and more success."
];

const grid = document.getElementById('envelopes-grid');
const modal = document.getElementById('letterModal');
const closeBtn = document.getElementById('closeBtn');

const openedEnvelopesTracker = new Set();
const totalEnvelopes = 9;

function checkUnlockNightSky(id) {
    openedEnvelopesTracker.add(id);
    if (openedEnvelopesTracker.size === totalEnvelopes) {
        document.getElementById('night-sky-unlock').style.display = 'block';
        setTimeout(() => {
            document.getElementById('night-sky-unlock').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
    }
}

for (let i = 0; i < 7; i++) {
    const content = lettersData[i];
    const wrapper = document.createElement('div');
    wrapper.className = 'envelope-wrapper';

    wrapper.innerHTML = `
        <div class="envelope" id="env-letter-${i}">
            <div class="flap"></div>
            <div class="letter-inside">💌 Letter ${i + 1}</div>
            <div class="front"></div>
        </div>
    `;

    wrapper.addEventListener('click', () => {

        const env = wrapper.querySelector('.envelope');
        if (env.classList.contains('open')) return;

        env.classList.add('open');
        checkUnlockNightSky('letter-' + i);
        playChime();

        setTimeout(() => {
            openLetter(content, i + 1);
            setTimeout(() => env.classList.remove('open'), 600);
        }, 1200);
    });

    grid.appendChild(wrapper);
}

/* =========================
   CARD 8 (PHOTO)
========================= */
const photoWrapper = document.createElement('div');
photoWrapper.className = 'envelope-wrapper';

photoWrapper.innerHTML = `
    <div class="envelope photo-envelope" id="env-photo">
        <div class="flap"></div>
        <div class="letter-inside photo-inside">
            <img src="love_stone.jpg" class="card-photo">
            <div class="photo-label">💎 Check ur Necklace Bday Girl 💎</div>
        </div>
        <div class="front"></div>
    </div>
`;

photoWrapper.addEventListener('click', () => {
    const env = photoWrapper.querySelector('.envelope');
    if (env.classList.contains('open')) return;

    env.classList.add('open');
    checkUnlockNightSky('photo');
    playChime();

    setTimeout(() => {
        openPhotoOnly();
        setTimeout(() => env.classList.remove('open'), 600);
    }, 1200);
});

grid.appendChild(photoWrapper);

/* =========================
   CARD 9 (LAST LETTER)
========================= */
const lastLetterWrapper = document.createElement('div');
lastLetterWrapper.className = 'envelope-wrapper';

lastLetterWrapper.innerHTML = `
    <div class="envelope" id="env-letter-8">
        <div class="flap"></div>
        <div class="letter-inside">💌 Letter 8</div>
        <div class="front"></div>
    </div>
`;

lastLetterWrapper.addEventListener('click', () => {
    const env = lastLetterWrapper.querySelector('.envelope');
    if (env.classList.contains('open')) return;

    env.classList.add('open');
    checkUnlockNightSky('letter-last');
    playChime();

    setTimeout(() => {
        openLetter(lettersData[7], 8);
        setTimeout(() => env.classList.remove('open'), 600);
    }, 1200);
});

grid.appendChild(lastLetterWrapper);

/* =========================
   MODAL FUNCTIONS
========================= */
function openLetter(content, num) {
    document.getElementById('letter-content-body').innerHTML = `
        <div class="letter-text">
            <h3 style="color:#FF69B4;text-align:center;">💌 Letter #${num}</h3>
            <p>Dear Zyne,</p>
            <p>${content}</p>
            <p class="signature">With all my love,<br>Always cheering for you 💫</p>
        </div>
    `;
    modal.classList.add('active');
}

function openPhotoOnly() {
    document.getElementById('letter-content-body').innerHTML = `
        <div class="photo-card-content">
            <h3 style="color:#FF69B4;text-align:center;">
                💎 Check the Necklace, Birthday Girl 💎
            </h3>

            <div class="photo-container" style="text-align:center;">
                <img src="love_stone.jpg" style="max-width:85%;border-radius:15px;">
            </div>
        </div>
    `;
    modal.classList.add('active');
}

closeBtn.addEventListener('click', () => modal.classList.remove('active'));
document.querySelector('.letter-overlay').addEventListener('click', () => modal.classList.remove('active'));

/* =========================
   CHIME SOUND
========================= */
let audioCtx = null;
function playChime() {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 1.5);

        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 1.5);
    } catch (e) { }
}

/* =========================
   THEME TOGGLE
========================= */
function initCardsThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        updateThemeButton(true);
    }

    themeToggle.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        updateThemeButton(isLight);
    });
}

function updateThemeButton(isLight) {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const icon = themeToggle.querySelector('.theme-icon');
    const text = themeToggle.querySelector('.theme-text');

    icon.textContent = isLight ? '☀️' : '🌙';
    text.textContent = isLight ? 'Light Mode' : 'Dark Mode';
}

initCardsThemeToggle();
