const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const record = document.getElementById('record');
const lyricsScroll = document.getElementById('lyricsScroll');

// Song Library Data
const songLibrary = {
    until: {
        title: "Your Universe ✨",
        src: "Asset/Your Universe.mp3",
        lyrics: [
            { time: 0, text: "🎶 (Soft piano intro begins) 🎶" },
            // Verse 1
            { time: 1, text: "Tell me something" },
            { time: 4, text: "When the rain falls on my face" },
            { time: 8, text: "How do you quickly replace it with" },
            { time: 12, text: "A golden summer smile?" },
            { time: 16, text: "Tell me something" },
            { time: 20, text: "When I'm feelin' tired and afraid" },
            { time: 24, text: "How do you know just what to say" },
            { time: 28, text: "To make everything alright?" },
            // Chorus 1
            { time: 36, text: "I don't think that you even realize" },
            { time: 41, text: "The joy you make me feel when I'm inside" },
            { time: 46, text: "Your universe" },
            { time: 49, text: "You hold me like I'm the one who's precious" },
            { time: 54, text: "I hate to break it to you but it's just" },
            { time: 58, text: "The other way around" },
            { time: 62, text: "You can thank your stars all you want but" },
            { time: 66, text: "I'll always be the lucky one" },
            // Short instrumental break
            { time: 72, text: "🎶 (Gentle instrumental) 🎶" },
            // Verse 2 (first part)
            { time: 80, text: "Tell me something" },
            { time: 84, text: "When I'm 'bout to lose control" },
            { time: 88, text: "How do you patiently hold my hand" },
            { time: 92, text: "And gently calm me down?" },
            // Verse 2 (second part)
            { time: 96, text: "Tell me something" },
            { time: 100, text: "When you sing and when you laugh" },
            { time: 104, text: "Why do I always photograph my heart" },
            { time: 108, text: "Flyin' way above the clouds?" },
            // Chorus 2
            { time: 115, text: "I don't think that you even realize" },
            { time: 120, text: "The joy you make me feel when I'm inside" },
            { time: 125, text: "Your universe" },
            { time: 128, text: "You hold me like I'm the one who's precious" },
            { time: 133, text: "I hate to break it to you but it's just" },
            { time: 137, text: "The other way around" },
            { time: 141, text: "You can thank your stars all you want but" },
            { time: 145, text: "I'll always be the lucky one" },
            // Bridge / Instrumental
            { time: 152, text: "🎶 (Emotional instrumental bridge) 🎶" },
            // Final Chorus
            { time: 166, text: "I don't think that you even realize" },
            { time: 171, text: "The joy you make me feel when I'm inside" },
            { time: 176, text: "Your universe" },
            { time: 179, text: "You hold me like I'm the one who's precious" },
            { time: 184, text: "I hate to break it to you but it's just" },
            { time: 188, text: "The other way around" },
            // Outro
            { time: 195, text: "You can thank your stars all you want" },
            { time: 201, text: "But I'll always be the lucky one" },
            { time: 207, text: "I'll always be the lucky one" },
            { time: 214, text: "I'll always be the lucky one" },
            { time: 221, text: "🎶 (Music slowly fades) 🎶" },
            { time: 230, text: "I'll always be the lucky one..." },
            { time: 240, text: "🎶 (End) 🎶" }
        ]
    },
    music: {
        title: "Until I Found You ✨",
        src: "Asset/until.mp3",
        lyrics: [
            { time: 0, text: "🎶 (Music begins) 🎶" },
            { time: 10.6, text: "Georgia, wrap me up in all your..." },
            { time: 17.0, text: "I want you, in my arms" },
            { time: 22.4, text: "Oh, let me hold you" },
            { time: 27.8, text: "I'll never let you go again, like I did" },
            { time: 33.4, text: "Oh, I used to say" },
            { time: 36.8, text: "\"I would never fall in love again until I found her\"" },
            { time: 42.0, text: "I said, \"I would never fall unless it's you I fall into\"" },
            { time: 51.0, text: "I was lost within the darkness, but then I found her" },
            { time: 59.0, text: "I found you" },
            { time: 65.0, text: "🎶 (Instrumental) 🎶" },
            { time: 72.0, text: "Georgia, pulled me in, I asked to..." },
            { time: 79.0, text: "Love her, once again" },
            { time: 84.5, text: "You fell, I caught you" },
            { time: 89.0, text: "I'll never let you go again, like I did" },
            { time: 94.5, text: "Oh, I used to say" },
            { time: 98.0, text: "\"I would never fall in love again until I found her\"" },
            { time: 104.5, text: "I said, \"I would never fall unless it's you I fall into\"" },
            { time: 112.0, text: "I was lost within the darkness, but then I found her" },
            { time: 120.0, text: "I found you" },
            { time: 126.0, text: "🎶 (Guitar Solo) 🎶" },
            { time: 137.0, text: "\"I would never fall in love again until I found her\"" },
            { time: 143.5, text: "I said, \"I would never fall unless it's you I fall into\"" },
            { time: 151.0, text: "I was lost within the darkness, but then I found her" },
            { time: 158.0, text: "I found you" },
            { time: 163.0, text: "🎶 (Outro) 🎶" }
        ]

    }
};

let currentLyricsData = songLibrary.until.lyrics;
let isPlaying = false;

function buildLyricsDOM(lyricsArray) {
    lyricsScroll.innerHTML = '';
    lyricsArray.forEach((lyric, index) => {
        const el = document.createElement('div');
        el.className = 'lyric-line';
        el.id = `line-${index}`;
        el.innerText = lyric.text;
        lyricsScroll.appendChild(el);
    });
}

// Initial Build
buildLyricsDOM(currentLyricsData);

// Calculate initial centering
function centerActiveLine() {
    const activeLine = document.querySelector('.lyric-line.active') || document.getElementById('line-0');
    if (activeLine) {
        const wrapper = document.querySelector('.lyrics-wrapper');
        if (!wrapper) return;

        const containerHeight = wrapper.clientHeight;
        const lineOffsetTop = activeLine.offsetTop; // Relative to offsetParent (lyrics-scroll or wrapper)
        const lineHeight = activeLine.clientHeight;

        // Scroll top to center the active line
        const scrollTop = lineOffsetTop - (containerHeight / 2) + (lineHeight / 2);

        wrapper.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
        });
    }
}

// Center initially
setTimeout(() => {
    document.getElementById('line-0').classList.add('active');
    centerActiveLine();
}, 100);


function loadSong(songKey) {
    if (songKey === 'custom') {
        document.getElementById('customSongInput').click();
        return;
    }

    const song = songLibrary[songKey];
    if (!song) return;

    if (isPlaying) {
        audioPlayer.pause();
        record.classList.remove('playing');
        playBtn.innerHTML = "▶ Play Song";
        isPlaying = false;
    }

    audioPlayer.src = song.src;
    document.querySelector('.song-title').innerText = song.title;
    currentLyricsData = song.lyrics;

    buildLyricsDOM(currentLyricsData);

    setTimeout(() => {
        const firstLine = document.getElementById('line-0');
        if (firstLine) {
            firstLine.classList.add('active');
            centerActiveLine();
        }
    }, 100);
}

const songSelector = document.getElementById('songSelector');
if (songSelector) {
    songSelector.addEventListener('change', (e) => {
        if (e.target.value !== 'custom') {
            loadSong(e.target.value);
        }
    });
}

playBtn.addEventListener('click', () => {
    if (isPlaying) {
        audioPlayer.pause();
        record.classList.remove('playing');
        playBtn.innerHTML = "▶ Play Song";
    } else {
        audioPlayer.play().catch(e => {
            console.log("Playback failed", e);
            alert("Could not play audio. Check if the song file exists!");
        });
        record.classList.add('playing');
        playBtn.innerHTML = "⏸ Pause Song";
    }
    isPlaying = !isPlaying;
});

// Custom Song Upload Handler
const customSongInput = document.getElementById('customSongInput');
if (customSongInput) {
    customSongInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            audioPlayer.src = objectUrl;

            // Update title
            const songTitleEl = document.querySelector('.song-title');
            if (songTitleEl) {
                // Shorten name if it's too long
                let name = file.name.replace(/\.[^/.]+$/, "");
                if (name.length > 20) name = name.substring(0, 20) + "...";
                songTitleEl.innerText = name;
            }

            // Auto-play the new song
            audioPlayer.play().catch(err => console.log("Playback failed", err));
            isPlaying = true;
            record.classList.add('playing');
            playBtn.innerHTML = "⏸ Pause Song";
        } else {
            // Revert dropdown if canceled
            if (songSelector) songSelector.value = "until";
        }
    });
}

// Update lyrics scrolling based on audio time
audioPlayer.addEventListener('timeupdate', () => {
    const currentTime = audioPlayer.currentTime;

    // Find the current active lyric index
    let activeIndex = 0;
    for (let i = 0; i < currentLyricsData.length; i++) {
        if (currentTime >= currentLyricsData[i].time) {
            activeIndex = i;
        } else {
            break;
        }
    }

    // Only update DOM if the active line changed
    const activeLine = document.getElementById(`line-${activeIndex}`);
    if (activeLine && !activeLine.classList.contains('active')) {
        // Remove active class from all
        document.querySelectorAll('.lyric-line').forEach(el => el.classList.remove('active'));

        // Add active class to current
        activeLine.classList.add('active');

        // Animate scroll
        centerActiveLine();
    }
});

// Handle window resize so lyrics stay centered
window.addEventListener('resize', centerActiveLine);

// When ended
audioPlayer.addEventListener('ended', () => {
    isPlaying = false;
    record.classList.remove('playing');
    playBtn.innerHTML = "▶ Play Song";

    // Reset to beginning
    document.querySelectorAll('.lyric-line').forEach(el => el.classList.remove('active'));
    const firstLine = document.getElementById('line-0');
    if (firstLine) {
        firstLine.classList.add('active');
        centerActiveLine();
    }
});
// Theme Toggle for song page
function initSongThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        updateThemeButton(true);
    }

    themeToggle.addEventListener('click', () => {
        const isLightMode = document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
        updateThemeButton(isLightMode);
    });
}

function updateThemeButton(isLightMode) {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const icon = themeToggle.querySelector('.theme-icon');
    const text = themeToggle.querySelector('.theme-text');

    if (isLightMode) {
        icon.textContent = '☀️';
        text.textContent = 'Light Mode';
    } else {
        icon.textContent = '🌙';
        text.textContent = 'Dark Mode';
    }
}

initSongThemeToggle();