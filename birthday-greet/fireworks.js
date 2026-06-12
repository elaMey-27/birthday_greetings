document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('fireworksCanvas');
    const ctx = canvas.getContext('2d');
    const instructionOverlay = document.getElementById('instructionOverlay');
    const finaleBtn = document.getElementById('finaleBtn');

    let cw = window.innerWidth;
    let ch = window.innerHeight;
    canvas.width = cw;
    canvas.height = ch;

    // Handle window resize / device orientation changes
    window.addEventListener('resize', () => {
        cw = window.innerWidth;
        ch = window.innerHeight;
        canvas.width = cw;
        canvas.height = ch;
    });

    // Background Music Logic
    const bgMusic = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicBtn');
    if (bgMusic && musicBtn) {
        const musicIcon = musicBtn.querySelector('.music-icon');
        const musicLabel = musicBtn.querySelector('.music-label');

        bgMusic.volume = 0;
        let isMuted = false;
        let hasStarted = false;

        // Restore previous session state
        const savedTime = sessionStorage.getItem('musicTime');
        if (savedTime) {
            bgMusic.currentTime = parseFloat(savedTime);
        }
        const savedMuted = sessionStorage.getItem('musicMuted');
        if (savedMuted === 'true') {
            isMuted = true;
            musicIcon.textContent = '🔇';
            musicLabel.textContent = 'Muted';
            musicBtn.classList.add('muted');
        }

        // Save state continuously
        setInterval(() => {
            if (!bgMusic.paused) {
                sessionStorage.setItem('musicTime', bgMusic.currentTime);
            }
            sessionStorage.setItem('musicMuted', isMuted);
        }, 250);

        function fadeInMusic() {
            if (isMuted) return; // don't fade in if muted
            const steps = 40;
            const interval = 2000 / steps;
            const stepVolume = 0.25 / steps;
            let current = 0;
            const timer = setInterval(() => {
                if (isMuted) { clearInterval(timer); return; }
                current += stepVolume;
                bgMusic.volume = Math.min(current, 0.25);
                if (current >= 0.25) clearInterval(timer);
            }, interval);
        }

        function startMusic() {
            if (hasStarted) return;
            hasStarted = true;
            bgMusic.play().then(() => {
                if (!isMuted && !savedTime) {
                    fadeInMusic(); // fade in from 0 if new
                } else if (!isMuted) {
                    bgMusic.volume = 0.25; // snap to volume if continuing
                }
            }).catch(() => {
                hasStarted = false; // Need interaction
            });
        }

        startMusic();

        const startOnInteract = () => {
            startMusic();
            document.removeEventListener('click', startOnInteract);
            document.removeEventListener('touchstart', startOnInteract);
        };
        document.addEventListener('click', startOnInteract);
        document.addEventListener('touchstart', startOnInteract);

        musicBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            isMuted = !isMuted;
            if (isMuted) {
                bgMusic.volume = 0;
                musicIcon.textContent = '🔇';
                musicLabel.textContent = 'Muted';
                musicBtn.classList.add('muted');
            } else {
                bgMusic.volume = 0.25;
                musicIcon.textContent = '🎵';
                musicLabel.textContent = 'Music On';
                musicBtn.classList.remove('muted');
            }
            sessionStorage.setItem('musicMuted', isMuted);
        });
    }

    // Web Audio API for Sound Effects
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();

    function playBoom() {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);

        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.7);

        playCrackle();
    }

    function playCrackle() {
        const bufferSize = audioCtx.sampleRate * 0.30; // 0.30 seconds
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1; // white noise
        }

        const noiseSource = audioCtx.createBufferSource();
        noiseSource.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

        noiseSource.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        noiseSource.start();
    }

    // Fireworks Physics variables
    let fireworks = [];
    let particles = [];

    // Colors
    const colors = [
        [255, 105, 180], // Pink
        [255, 51, 51],   // Red
        [255, 215, 0],   // Gold
        [135, 206, 235], // Sky Blue
        [221, 160, 221], // Plum/Lavender
        [255, 165, 0]    // Orange
    ];

    // Helper functions
    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    function calculateDistance(p1x, p1y, p2x, p2y) {
        return Math.sqrt(Math.pow(p1x - p2x, 2) + Math.pow(p1y - p2y, 2));
    }

    class Firework {
        constructor(sx, sy, tx, ty) {
            this.x = sx;
            this.y = sy;
            this.sx = sx;
            this.sy = sy;
            this.tx = tx;
            this.ty = ty;
            this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
            this.distanceTraveled = 0;

            // Calculate velocity
            const angle = Math.atan2(ty - sy, tx - sx);
            const speed = 14;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;

            this.coordinates = [];
            this.coordinateCount = 3;
            while (this.coordinateCount--) {
                this.coordinates.push([this.x, this.y]);
            }

            // Random color
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update(index) {
            this.coordinates.pop();
            this.coordinates.unshift([this.x, this.y]);

            this.vx *= 0.99; // tiny drag
            this.vy += 0.1;  // slight gravity on rocket

            this.x += this.vx;
            this.y += this.vy;

            this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x, this.y);

            if (this.distanceTraveled >= this.distanceToTarget) {
                createParticles(this.tx, this.ty, this.color);
                playBoom();
                fireworks.splice(index, 1);
            }
        }

        draw() {
            ctx.beginPath();
            const startX = this.coordinates[this.coordinates.length - 1][0];
            const startY = this.coordinates[this.coordinates.length - 1][1];
            ctx.moveTo(startX, startY);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = `rgb(${this.color[0]}, ${this.color[1]}, ${this.color[2]})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    class Particle {
        constructor(x, y, color, targetX = null, targetY = null) {
            this.x = x;
            this.y = y;

            this.isTextParticle = targetX !== null;
            this.tx = targetX;
            this.ty = targetY;

            if (this.isTextParticle) {
                // If it's a text particle, it explodes slightly then drifts to target
                const angle = random(0, Math.PI * 2);
                const speed = random(1, 15);
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
                this.friction = 0.92;
                this.gravity = 0; // turn off gravity for text particles
                this.alpha = 0; // fade in
                this.life = 0; // keep track of life so it stays for 4 secs
            } else {
                // Normal explosion
                const angle = random(0, Math.PI * 2);
                const speed = random(1, 15);
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
                this.friction = 0.95;
                this.gravity = 0.2;
                this.alpha = 1;
                this.decay = random(0.015, 0.03);
            }

            this.coordinates = [];
            this.coordinateCount = 7;
            while (this.coordinateCount--) {
                this.coordinates.push([this.x, this.y]);
            }

            // Slightly vary color
            this.color = [
                Math.min(255, color[0] + random(-20, 20)),
                Math.min(255, color[1] + random(-20, 20)),
                Math.min(255, color[2] + random(-20, 20))
            ];
        }

        update(index) {
            this.coordinates.pop();
            this.coordinates.unshift([this.x, this.y]);

            if (this.isTextParticle) {
                this.life++;

                // Stay for 1 minute (approx 3600 frames at 60fps), then fade out
                if (this.life > 600) {
                    this.alpha *= 0.6; // Exponential fade for a smooth, visible dimming
                    if (this.alpha <= 0.01) {
                        particles.splice(index, 1);
                        return;
                    }
                } else if (this.alpha < 1) {
                    this.alpha += 0.02; // Fade in
                }

                // Seek target
                const dx = this.tx - this.x;
                const dy = this.ty - this.y;

                // Steering
                this.vx += dx * 0.015;
                this.vy += dy * 0.015;

                // High friction so it settles into place
                this.vx *= 0.85;
                this.vy *= 0.85;

                // Remove wobble for sharper text
                this.x += this.vx;
                this.y += this.vy;

            } else {
                this.vx *= this.friction;
                this.vy *= this.friction;
                this.vy += this.gravity;
                this.x += this.vx;
                this.y += this.vy;
                this.alpha -= this.decay;

                if (this.alpha <= 0) {
                    particles.splice(index, 1);
                }
            }
        }

        draw() {
            ctx.beginPath();
            const startX = this.coordinates[this.coordinates.length - 1][0];
            const startY = this.coordinates[this.coordinates.length - 1][1];
            ctx.moveTo(startX, startY);

            // If particle stopped moving, drawing to the exact same point yields 0 pixels.
            // Add a tiny decimal offset to guarantee it renders on the canvas.
            if (startX === this.x && startY === this.y) {
                ctx.lineTo(this.x + 0.5, this.y + 0.5);
            } else {
                ctx.lineTo(this.x, this.y);
            }

            ctx.lineCap = 'round';
            ctx.strokeStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.alpha})`;
            ctx.lineWidth = this.isTextParticle ? 2.5 : 2;
            ctx.stroke();
        }
    }

    function createParticles(x, y, color) {
        let count = window.innerWidth < 600 ? 50 : 100;
        while (count--) {
            particles.push(new Particle(x, y, color));
        }
    }

    // Text Pixel Mapping for Finale
    let textPixels = [];

    function prepareTextPixels() {
        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d');
        offCanvas.width = cw;
        offCanvas.height = ch;

        offCtx.fillStyle = '#ffffff';
        const fontSize = window.innerWidth < 600 ? 30 : 60;
        offCtx.font = `bold ${fontSize}px "Playfair Display"`;
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';

        // Draw text
        const lineSpacing = fontSize * 1.2;
        offCtx.fillText('Happiest Birthday', cw / 2, ch / 2 - lineSpacing / 2);
        offCtx.fillText('Baby Sungittt!', cw / 2, ch / 2 + lineSpacing / 2);

        const imgData = offCtx.getImageData(0, 0, cw, ch).data;

        // Density step: reduced for higher resolution text
        const step = window.innerWidth < 600 ? 2 : 3;

        for (let y = 0; y < ch; y += step) {
            for (let x = 0; x < cw; x += step) {
                const alpha = imgData[(y * cw + x) * 4 + 3];
                if (alpha > 128) {
                    textPixels.push({ x, y });
                }
            }
        }
    }

    // Main render loop
    function loop() {
        requestAnimationFrame(loop);

        // Creates the trailing effect by not clearing completely
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, cw, ch);

        ctx.globalCompositeOperation = 'lighter';

        // Update and draw fireworks
        let i = fireworks.length;
        while (i--) {
            fireworks[i].draw();
            fireworks[i].update(i);
        }

        // Update and draw particles
        let j = particles.length;
        while (j--) {
            particles[j].draw();
            particles[j].update(j);
        }
    }

    // Interaction
    let isFinaleActive = false;

    canvas.addEventListener('click', (e) => {
        if (isFinaleActive) return; // disable manual launch during finale

        if (audioCtx.state === 'suspended') audioCtx.resume();
        instructionOverlay.style.opacity = '0'; // hide instructions

        // Launch from bottom center-ish
        const startX = cw / 2 + random(-100, 100);
        const startY = ch;
        fireworks.push(new Firework(startX, startY, e.clientX, e.clientY));
    });

    // Prevent default touch behaviors
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (isFinaleActive) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        instructionOverlay.style.opacity = '0';

        const touch = e.touches[0];
        const startX = cw / 2 + random(-100, 100);
        const startY = ch;
        fireworks.push(new Firework(startX, startY, touch.clientX, touch.clientY));
    }, { passive: false });

    // Handle Resize
    window.addEventListener('resize', () => {
        cw = window.innerWidth;
        ch = window.innerHeight;
        canvas.width = cw;
        canvas.height = ch;
        textPixels = []; // reset pixels
        if (isFinaleActive) {
            // Need to recreate if they resize during finale, but might be messy
        }
    });

    // Finale Sequence
    finaleBtn.addEventListener('click', () => {
        if (isFinaleActive) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();

        isFinaleActive = true;
        finaleBtn.style.display = 'none';
        instructionOverlay.style.opacity = '0';

        prepareTextPixels();

        // Step 1: Barrage of random fireworks
        let barrageCount = 0;
        const barrageInterval = setInterval(() => {
            const startX = cw / 2 + random(-cw / 3, cw / 3);
            const startY = ch;
            const targetX = random(cw * 0.1, cw * 0.9);
            const targetY = random(ch * 0.1, ch * 0.6);
            fireworks.push(new Firework(startX, startY, targetX, targetY));

            barrageCount++;
            if (barrageCount > 15) { // Stop after 15 fireworks
                clearInterval(barrageInterval);

                // Step 2: The Grand Finale massive rocket
                setTimeout(() => {
                    const massiveRocket = new Firework(cw / 2, ch, cw / 2, ch / 2);
                    // Override the update method to spawn text particles instead
                    const originalUpdate = massiveRocket.update.bind(massiveRocket);
                    massiveRocket.update = function (index) {
                        this.coordinates.pop();
                        this.coordinates.unshift([this.x, this.y]);

                        this.vx *= 0.99;
                        this.vy += 0.05; // lower gravity for big rocket

                        this.x += this.vx;
                        this.y += this.vy;

                        this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x, this.y);

                        if (this.distanceTraveled >= this.distanceToTarget) {
                            playBoom();
                            playBoom(); // louder

                            // Spawn Text Particles
                            const color = colors[Math.floor(Math.random() * colors.length)];
                            textPixels.forEach(pixel => {
                                // Pure white for maximum clarity, with a tiny hint of pink
                                const pColor = [255, 240, 245];
                                particles.push(new Particle(this.x, this.y, pColor, pixel.x, pixel.y));
                            });

                            // Spawn regular particles for explosion effect
                            createParticles(this.tx, this.ty, color);
                            createParticles(this.tx, this.ty, [255, 255, 255]); // extra spark

                            fireworks.splice(index, 1);
                        }
                    };
                    fireworks.push(massiveRocket);
                }, 1500);
            }
        }, 300);
    });

    // Start loop
    loop();


});
