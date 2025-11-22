// Character Page JavaScript

// Global state
let currentCharacterIndex = 0;
let characterData = [];
let currentCharacter = null;
let favorites = [];

// Three.js variables
let scene, camera, renderer, orbitControls;
let currentModel = null;
let rotationSpeed = 1;

// Initialize the application
async function initApplication() {
    try {
        // Load character data
        await loadCharacterData();

        // Load favorites
        loadFavorites();

        // Initialize 3D viewer
        initThreeJS();

        // Set up event listeners
        setupEventListeners();

        // Load first character
        if (characterData.length > 0) {
            loadCharacter(0);
        }
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showError('Failed to load character data');
    }
}

// Load character data from JSON
async function loadCharacterData() {
    try {
        const response = await fetch('../../data/characters.json');
        if (!response.ok) throw new Error('Failed to load characters.json');
        characterData = await response.json();

        if (!Array.isArray(characterData)) {
            characterData = [];
        }
    } catch (error) {
        console.warn('Could not load characters.json, using sample data:', error);
        characterData = getSampleCharacterData();
    }
}

// Load favorites from localStorage
function loadFavorites() {
    const saved = localStorage.getItem('bestiary_favorites');
    if (saved) {
        try {
            favorites = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to parse favorites:', e);
            favorites = [];
        }
    }
}

// Save favorites to localStorage
function saveFavorites() {
    localStorage.setItem('bestiary_favorites', JSON.stringify(favorites));
}

// Toggle favorite for a character
function toggleFavorite(characterId) {
    const index = favorites.indexOf(characterId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(characterId);
    }
    saveFavorites();
    updateFavoritesButton();
}

// Check if a character is favorited
function isFavorited(characterId) {
    return favorites.includes(characterId);
}

// Update the favorites button appearance
function updateFavoritesButton() {
    const btn = document.getElementById('favoriteCharBtn');
    if (!btn || !currentCharacter) return;

    if (isFavorited(currentCharacter.id)) {
        btn.classList.add('active');
        btn.querySelector('i').classList.remove('far');
        btn.querySelector('i').classList.add('fas');
    } else {
        btn.classList.remove('active');
        btn.querySelector('i').classList.remove('fas');
        btn.querySelector('i').classList.add('far');
    }
}

// Initialize Three.js scene
function initThreeJS() {
    const canvas = document.getElementById('characterCanvas');

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);

    // Camera setup
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.4);
    pointLight.position.set(-5, 3, 2);
    scene.add(pointLight);

    // Controls
    orbitControls = new THREE.OrbitControls(camera, canvas);
    orbitControls.autoRotate = true;
    orbitControls.autoRotateSpeed = 4 * rotationSpeed;
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        orbitControls.update();
        renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        const newWidth = canvas.clientWidth;
        const newHeight = canvas.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    });
}

// Load character by index
async function loadCharacter(index) {
    if (index < 0 || index >= characterData.length) return;

    currentCharacterIndex = index;
    currentCharacter = characterData[index];

    // Update UI
    updateCharacterUI();
    updateFavoritesButton();

    // Load 3D model
    if (currentCharacter.modelPath) {
        await loadCharacterModel(currentCharacter.modelPath);
    }

    // Update navigation counter
    document.getElementById('characterCounter').textContent =
        `${index + 1} / ${characterData.length}`;
}

// Update character info in UI
function updateCharacterUI() {
    if (!currentCharacter) return;

    // Header
    document.getElementById('characterName').textContent = currentCharacter.name;
    document.getElementById('characterType').textContent = currentCharacter.race;

    // Image
    const img = document.getElementById('characterImage');
    img.src = currentCharacter.imagePath || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E';

    // Stats
    updateStatBar('healthStat', currentCharacter.stats.health);
    updateStatBar('magickaStat', currentCharacter.stats.magicka);
    updateStatBar('staminaStat', currentCharacter.stats.stamina);

    document.getElementById('healthValue').textContent = currentCharacter.stats.health;
    document.getElementById('magickaValue').textContent = currentCharacter.stats.magicka;
    document.getElementById('staminaValue').textContent = currentCharacter.stats.stamina;
    document.getElementById('levelValue').textContent = currentCharacter.level;

    // Skills
    updateSkillsList();

    // Lore
    document.getElementById('loreRace').textContent = currentCharacter.race;
    document.getElementById('loreLocation').textContent = currentCharacter.location;
    document.getElementById('loreFaction').textContent = currentCharacter.faction || 'None';

    const difficultyEl = document.getElementById('loreDifficulty');
    difficultyEl.textContent = currentCharacter.difficulty;
    difficultyEl.className = 'lore-value difficulty ' + currentCharacter.difficulty.toLowerCase();

    document.getElementById('characterDescription').textContent = currentCharacter.description;

    // Combat info
    updateCombatInfo();
}

// Update stat bar width
function updateStatBar(elementId, value) {
    const maxValue = 100;
    const percentage = Math.min((value / maxValue) * 100, 100);
    document.getElementById(elementId).style.width = percentage + '%';
}

// Update skills list
function updateSkillsList() {
    const skillsList = document.getElementById('skillsList');
    skillsList.innerHTML = '';

    if (currentCharacter.skills && currentCharacter.skills.length > 0) {
        currentCharacter.skills.forEach(skill => {
            const skillEl = document.createElement('div');
            skillEl.className = 'skill-item';
            skillEl.innerHTML = `
                <span class="skill-name">${skill.name}</span>
                <span class="skill-level">${skill.level}</span>
            `;
            skillsList.appendChild(skillEl);
        });
    }
}

// Update combat info
function updateCombatInfo() {
    const combatInfo = document.getElementById('combatInfo');
    combatInfo.innerHTML = '';

    if (currentCharacter.combat && currentCharacter.combat.length > 0) {
        currentCharacter.combat.forEach(item => {
            const combatEl = document.createElement('div');
            combatEl.className = 'combat-item';
            let badge = '';
            if (item.type) {
                badge = ` <span class="damage-type-badge ${item.type.toLowerCase()}">${item.type}</span>`;
            }
            combatEl.innerHTML = `
                <span class="combat-label">${item.name}</span>
                <span class="combat-value">${item.value}${badge}</span>
            `;
            combatInfo.appendChild(combatEl);
        });
    }
}

// Load 3D model
async function loadCharacterModel(modelPath) {
    const overlay = document.getElementById('viewerOverlay');
    overlay.classList.remove('hidden');

    try {
        // Remove previous model
        if (currentModel) {
            scene.remove(currentModel);
        }

        // Determine file type and load accordingly
        if (modelPath.endsWith('.obj')) {
            const loader = new THREE.OBJLoader();
            const object = await new Promise((resolve, reject) => {
                loader.load(modelPath, resolve, undefined, reject);
            });

            setupModel(object);
        } else if (modelPath.endsWith('.ply')) {
            const loader = new THREE.PLYLoader();
            const geometry = await new Promise((resolve, reject) => {
                loader.load(modelPath, resolve, undefined, reject);
            });

            const material = new THREE.PointsMaterial({
                size: 0.01,
                color: 0x0080ff,
                sRGBColorSpace: true
            });

            const pointCloud = new THREE.Points(geometry, material);
            setupModel(pointCloud);
        } else {
            throw new Error('Unsupported model format: ' + modelPath);
        }

        overlay.classList.add('hidden');
    } catch (error) {
        console.error('Failed to load model:', error);
        overlay.querySelector('.overlay-content p').textContent =
            'Failed to load 3D model: ' + error.message;
    }
}

// Setup loaded model
function setupModel(model) {
    currentModel = model;
    scene.add(model);

    // Center and scale model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 4 / maxDim;

    model.position.sub(center);
    model.scale.multiplyScalar(scale);

    // Reset camera
    camera.position.z = 5;
    orbitControls.target.copy(new THREE.Vector3(0, 0, 0));
    orbitControls.update();
}

// Setup event listeners
function setupEventListeners() {
    // Favorites button
    document.getElementById('favoriteCharBtn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentCharacter) {
            toggleFavorite(currentCharacter.id);
        }
    });

    // Navigation buttons
    document.getElementById('prevCharBtn')?.addEventListener('click', () => {
        if (currentCharacterIndex > 0) {
            loadCharacter(currentCharacterIndex - 1);
        }
    });

    document.getElementById('nextCharBtn')?.addEventListener('click', () => {
        if (currentCharacterIndex < characterData.length - 1) {
            loadCharacter(currentCharacterIndex + 1);
        }
    });

    // Viewer controls
    document.getElementById('resetViewBtn')?.addEventListener('click', resetView);
    document.getElementById('lightModeBtn')?.addEventListener('click', toggleLighting);
    document.getElementById('wireframeBtn')?.addEventListener('click', toggleWireframe);
    document.getElementById('fullscreenBtn')?.addEventListener('click', toggleFullscreen);

    // Rotation speed slider
    document.getElementById('rotationSpeedSlider')?.addEventListener('input', (e) => {
        rotationSpeed = parseFloat(e.target.value);
        if (orbitControls) {
            orbitControls.autoRotateSpeed = 4 * rotationSpeed;
        }
    });

    // Export button
    document.getElementById('exportModelBtn')?.addEventListener('click', exportModel);

    // Share button
    document.getElementById('shareBtn')?.addEventListener('click', shareCharacter);

    // Modal controls
    document.getElementById('closeModalBtn')?.addEventListener('click', () => {
        document.getElementById('characterSelectModal').classList.add('hidden');
    });

    document.getElementById('closeExportBtn')?.addEventListener('click', () => {
        document.getElementById('exportModal').classList.add('hidden');
    });

    // Modal overlay click to close
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            e.target.closest('.modal')?.classList.add('hidden');
        });
    });
}

// Viewer control functions
function resetView() {
    if (camera && orbitControls) {
        camera.position.z = 5;
        orbitControls.target.copy(new THREE.Vector3(0, 0, 0));
        orbitControls.update();
    }
}

function toggleLighting() {
    scene.children.forEach(child => {
        if (child.isLight) {
            child.intensity = child.intensity > 0.5 ? 0.2 : 1;
        }
    });
}

function toggleWireframe() {
    if (currentModel) {
        currentModel.traverse(child => {
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                        mat.wireframe = !mat.wireframe;
                    });
                } else {
                    child.material.wireframe = !child.material.wireframe;
                }
            }
        });
    }
}

function toggleFullscreen() {
    const element = document.querySelector('.character-viewer-panel');
    if (!document.fullscreenElement) {
        element.requestFullscreen?.().catch(err => console.error(err));
    } else {
        document.exitFullscreen?.().catch(err => console.error(err));
    }
}

// Export model
async function exportModel() {
    if (!currentCharacter || !currentModel) {
        showError('No model loaded to export');
        return;
    }

    const modal = document.getElementById('exportModal');
    const nameEl = document.getElementById('exportName');
    const statusEl = document.getElementById('exportStatus');
    const progressEl = document.getElementById('exportProgress');

    modal.classList.remove('hidden');
    nameEl.textContent = currentCharacter.name;
    statusEl.textContent = 'Exporting...';
    progressEl.style.width = '0%';

    try {
        // Simulate export progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }
            progressEl.style.width = progress + '%';
            statusEl.textContent = `Exporting... ${Math.floor(progress)}%`;
        }, 100);

        // Simulate actual export (in real implementation, use THREE.js OBJExporter)
        await new Promise(resolve => setTimeout(resolve, 2000));

        statusEl.textContent = 'Export complete! File ready for download.';
        progressEl.style.width = '100%';

        setTimeout(() => {
            modal.classList.add('hidden');
        }, 2000);
    } catch (error) {
        console.error('Export failed:', error);
        statusEl.textContent = 'Export failed: ' + error.message;
    }
}

// Share character
function shareCharacter() {
    if (!currentCharacter) return;

    const url = `${window.location.href}?character=${currentCharacterIndex}`;
    const text = `Check out ${currentCharacter.name} from Skyrim Bestiary!`;

    if (navigator.share) {
        navigator.share({
            title: 'Skyrim Bestiary',
            text: text,
            url: url
        }).catch(err => console.error('Share failed:', err));
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(url)
            .then(() => alert('Character link copied to clipboard!'))
            .catch(() => alert('Could not copy link'));
    }
}

// Utility functions
function showError(message) {
    console.error(message);
    // In a real app, show a user-friendly error message
}

// Sample character data (fallback)
function getSampleCharacterData() {
    return [
        {
            id: 1,
            name: "Alduin",
            race: "Dragon",
            level: 50,
            location: "Skuldafn",
            faction: "Dragons",
            difficulty: "Deadly",
            description: "The World-Eater, the ancient dragon who destroyed the world in the Dragon War and was later resurrected by Daedric forces.",
            imagePath: "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23c0152f%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E",
            modelPath: "enhanced_mesh.obj",
            stats: {
                health: 100,
                magicka: 75,
                stamina: 85
            },
            skills: [
                { name: "Melee Combat", level: "Legendary" },
                { name: "Dragon Breath", level: "Legendary" },
                { name: "Magic Resistance", level: "Legendary" },
                { name: "Evasion", level: "Expert" }
            ],
            combat: [
                { name: "Claw Damage", value: "45-65", type: "Physical" },
                { name: "Fire Breath", value: "80", type: "Fire" },
                { name: "Armor Rating", value: "120", type: "Physical" }
            ]
        },
        {
            id: 2,
            name: "Daedric Dremora",
            race: "Dremora",
            level: 30,
            location: "Oblivion",
            faction: "Daedric Forces",
            difficulty: "Hard",
            description: "A Dremora warrior summoned from the planes of Oblivion, equipped with daedric weaponry and crackling with magical power.",
            imagePath: "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23663300%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E",
            modelPath: "enhanced_mesh.obj",
            stats: {
                health: 85,
                magicka: 90,
                stamina: 75
            },
            skills: [
                { name: "Destruction Magic", level: "Expert" },
                { name: "Melee Combat", level: "Expert" },
                { name: "Intimidation", level: "Expert" }
            ],
            combat: [
                { name: "Daedric Sword", value: "35-45", type: "Physical" },
                { name: "Fireball", value: "60", type: "Magic" },
                { name: "Frost Resistance", value: "50%", type: "Frost" }
            ]
        },
        {
            id: 3,
            name: "Frostbite Spider",
            race: "Arachnid",
            level: 12,
            location: "Blackreach, Dwemer Ruins",
            faction: "Wildlife",
            difficulty: "Normal",
            description: "A giant ice-infused spider found in the depths of Blackreach. Highly venomous and capable of firing freezing venom.",
            imagePath: "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%2300ccff%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E",
            modelPath: "enhanced_mesh.obj",
            stats: {
                health: 45,
                magicka: 20,
                stamina: 60
            },
            skills: [
                { name: "Poison", level: "Expert" },
                { name: "Melee Combat", level: "Adept" }
            ],
            combat: [
                { name: "Bite Damage", value: "15-20", type: "Physical" },
                { name: "Venom Spray", value: "25", type: "Frost" }
            ]
        }
    ];
}

// Check for character URL parameter
function checkCharacterParameter() {
    const params = new URLSearchParams(window.location.search);
    const characterId = params.get('character');
    if (characterId !== null && !isNaN(characterId)) {
        const index = parseInt(characterId);
        if (index >= 0 && index < characterData.length) {
            loadCharacter(index);
        }
    }
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initApplication();
    setTimeout(() => checkCharacterParameter(), 500);
});
