// Three.js Setup
let scene, camera, renderer, particles;

// Mouse and interaction variables
let mouse = new THREE.Vector2(0, 0);
let targetMouse = new THREE.Vector2(0, 0);

// Audio Context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function init() {
    const container = document.getElementById('scene-container');

    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050510, 0.001);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = 1000;

    // Renderer
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Particles (Stars)
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];

    const colorPink = new THREE.Color(0xFFB6C1);
    const colorGold = new THREE.Color(0xFFD700);
    const colorWhite = new THREE.Color(0xFFFFFF);

    for (let i = 0; i < 2000; i++) {
        const x = (Math.random() - 0.5) * 3000;
        const y = (Math.random() - 0.5) * 3000;
        const z = (Math.random() - 0.5) * 3000;
        vertices.push(x, y, z);

        const r = Math.random();
        let c;
        if (r < 0.2) c = colorPink;
        else if (r < 0.4) c = colorGold;
        else c = colorWhite;

        colors.push(c.r, c.g, c.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 3,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Event Listeners
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('touchmove', onDocumentTouchMove, false);
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onDocumentTouchMove(event) {
    if (event.touches.length == 1) {
        mouse.x = (event.touches[0].pageX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.touches[0].pageY / window.innerHeight) * 2 + 1;
    }
}

// Entry Animation - Entire screen acts as the interactive button
document.getElementById('entry-screen').addEventListener('click', () => {
    // Hide entry screen
    document.getElementById('entry-screen').style.opacity = '0';

    // Initialize Three.js scene so 'camera' exists before gsap runs
    init();
    animate();

    setTimeout(() => {
        document.getElementById('entry-screen').style.display = 'none';

        const uiLayer = document.getElementById('ui-layer');
        uiLayer.style.display = 'flex';
        uiLayer.style.opacity = '0';

        // Show menu UI
        gsap.to(uiLayer, {
            opacity: 1,
            duration: 2,
            ease: "power2.out",
            onComplete: () => {
                initThemeToggle(); // Initialize theme toggle after UI is visible
            }
        });

        // Move camera slightly
        gsap.to(camera.position, {
            z: 800,
            duration: 3,
            ease: "power3.out"
        });

    }, 1500);

    // Play subtle entry sound
    if (audioCtx.state === 'suspended') audioCtx.resume();
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    // Rotate particles slowly
    particles.rotation.x += 0.0001;
    particles.rotation.y += 0.0002;

    // Add subtle camera movement based on mouse
    targetMouse.x += (mouse.x * 100 - targetMouse.x) * 0.02;
    targetMouse.y += (mouse.y * 100 - targetMouse.y) * 0.02;
    camera.position.x += (targetMouse.x - camera.position.x) * 0.05;
    camera.position.y += (targetMouse.y - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}
// Theme Toggle Functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    // Check for saved theme preference
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

// Call this when the UI layer becomes visible
// Add this line inside your entry screen click handler after showing ui-layer
// initThemeToggle();