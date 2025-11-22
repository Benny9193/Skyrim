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
let currentBackgroundIndex = 0;
const backgroundColors = [
    { name: 'Light Gray', color: 0xf5f5f5 },
    { name: 'White', color: 0xffffff },
    { name: 'Dark Gray', color: 0x2a2a2a },
    { name: 'Black', color: 0x000000 },
    { name: 'Blue', color: 0x87ceeb },
    { name: 'Dark Blue', color: 0x1a1a2e },
    { name: 'Purple', color: 0x4a148c },
    { name: 'Green', color: 0x1b5e20 }
];

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

// Update stat bar width with animation
function updateStatBar(elementId, value) {
    const maxValue = 100;
    const percentage = Math.min((value / maxValue) * 100, 100);
    const bar = document.getElementById(elementId);

    if (bar) {
        // Reset width to 0 first
        bar.style.width = '0%';

        // Animate to target width
        setTimeout(() => {
            bar.style.transition = 'width 1s ease-out';
            bar.style.width = percentage + '%';
        }, 100);

        // Add hover effect
        bar.parentElement.onmouseenter = () => {
            bar.style.transform = 'scaleY(1.1)';
            bar.style.transition = 'transform 0.2s ease';
        };
        bar.parentElement.onmouseleave = () => {
            bar.style.transform = 'scaleY(1)';
        };
    }
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
    overlay.style.opacity = '1';

    try {
        // Fade out and remove previous model
        if (currentModel) {
            await fadeOutModel(currentModel);
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

    // Start with model invisible
    model.traverse(child => {
        if (child.material) {
            if (Array.isArray(child.material)) {
                child.material.forEach(mat => {
                    mat.transparent = true;
                    mat.opacity = 0;
                });
            } else {
                child.material.transparent = true;
                child.material.opacity = 0;
            }
        }
    });

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

    // Fade in model
    fadeInModel(model);
}

// Fade in model animation
function fadeInModel(model) {
    let opacity = 0;
    const fadeInterval = setInterval(() => {
        opacity += 0.05;
        if (opacity >= 1) {
            opacity = 1;
            clearInterval(fadeInterval);
        }

        model.traverse(child => {
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => mat.opacity = opacity);
                } else {
                    child.material.opacity = opacity;
                }
            }
        });
    }, 30);
}

// Fade out model animation
function fadeOutModel(model) {
    return new Promise(resolve => {
        let opacity = 1;
        const fadeInterval = setInterval(() => {
            opacity -= 0.1;
            if (opacity <= 0) {
                opacity = 0;
                clearInterval(fadeInterval);
                resolve();
            }

            model.traverse(child => {
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.opacity = opacity);
                    } else {
                        child.material.opacity = opacity;
                    }
                }
            });
        }, 30);
    });
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

    // Camera preset controls
    document.getElementById('frontViewBtn')?.addEventListener('click', () => setCameraPreset('front'));
    document.getElementById('sideViewBtn')?.addEventListener('click', () => setCameraPreset('side'));
    document.getElementById('topViewBtn')?.addEventListener('click', () => setCameraPreset('top'));
    document.getElementById('perspViewBtn')?.addEventListener('click', () => setCameraPreset('perspective'));

    // Background control
    document.getElementById('bgToggleBtn')?.addEventListener('click', cycleBackground);

    // Rotation speed slider
    document.getElementById('rotationSpeedSlider')?.addEventListener('input', (e) => {
        rotationSpeed = parseFloat(e.target.value);
        if (orbitControls) {
            orbitControls.autoRotateSpeed = 4 * rotationSpeed;
        }
    });

    // Export button
    document.getElementById('exportModelBtn')?.addEventListener('click', exportModel);

    // Screenshot button
    document.getElementById('screenshotBtn')?.addEventListener('click', takeScreenshot);

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

    // Keyboard navigation
    setupKeyboardNavigation();
}

// Keyboard navigation
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Ignore if typing in input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                if (currentCharacterIndex > 0) {
                    loadCharacter(currentCharacterIndex - 1);
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (currentCharacterIndex < characterData.length - 1) {
                    loadCharacter(currentCharacterIndex + 1);
                }
                break;
            case ' ':
                e.preventDefault();
                toggleAutoRotation();
                break;
            case 'r':
            case 'R':
                e.preventDefault();
                resetView();
                break;
            case 'w':
            case 'W':
                e.preventDefault();
                toggleWireframe();
                break;
            case 'f':
            case 'F':
                e.preventDefault();
                toggleFullscreen();
                break;
            case 'e':
            case 'E':
                e.preventDefault();
                exportModel();
                break;
            case 'h':
            case 'H':
            case '?':
                e.preventDefault();
                showKeyboardShortcuts();
                break;
            case 's':
            case 'S':
                e.preventDefault();
                takeScreenshot();
                break;
            case '1':
                e.preventDefault();
                setCameraPreset('front');
                break;
            case '2':
                e.preventDefault();
                setCameraPreset('side');
                break;
            case '3':
                e.preventDefault();
                setCameraPreset('top');
                break;
            case '4':
                e.preventDefault();
                setCameraPreset('perspective');
                break;
            case '+':
            case '=':
                e.preventDefault();
                adjustZoom(0.8);
                break;
            case '-':
            case '_':
                e.preventDefault();
                adjustZoom(1.2);
                break;
            case 'b':
            case 'B':
                e.preventDefault();
                cycleBackground();
                break;
        }
    });
}

// Toggle auto-rotation
function toggleAutoRotation() {
    if (orbitControls) {
        orbitControls.autoRotate = !orbitControls.autoRotate;
        showNotification(orbitControls.autoRotate ? 'Auto-rotation enabled' : 'Auto-rotation disabled');
    }
}

// Show keyboard shortcuts help
function showKeyboardShortcuts() {
    const shortcuts = `
        <div style="padding: 20px; max-width: 500px;">
            <h3 style="margin-top: 0; color: var(--color-primary);">⌨️ Keyboard Shortcuts</h3>
            <div style="display: grid; grid-template-columns: auto 1fr; gap: 12px 20px; margin-top: 20px;">
                <kbd style="padding: 4px 8px; background: #f0f0f0; border-radius: 4px; font-family: monospace;">←/→</kbd>
                <span>Navigate between characters</span>

                <kbd style="padding: 4px 8px; background: #f0f0f0; border-radius: 4px; font-family: monospace;">Space</kbd>
                <span>Toggle auto-rotation</span>

                <kbd style="padding: 4px 8px; background: #f0f0f0; border-radius: 4px; font-family: monospace;">R</kbd>
                <span>Reset camera view</span>

                <kbd style="padding: 4px 8px; background: #f0f0f0; border-radius: 4px; font-family: monospace;">W</kbd>
                <span>Toggle wireframe mode</span>

                <kbd style="padding: 4px 8px; background: #f0f0f0; border-radius: 4px; font-family: monospace;">F</kbd>
                <span>Toggle fullscreen</span>

                <kbd style="padding: 4px 8px; background: #f0f0f0; border-radius: 4px; font-family: monospace;">E</kbd>
                <span>Export model</span>

                <kbd style="padding: 4px 8px; background: #f0f0f0; border-radius: 4px; font-family: monospace;">S</kbd>
                <span>Take screenshot</span>

                <kbd style="padding: 4px 8px; background: #f0f0f0; border-radius: 4px; font-family: monospace;">1-4</kbd>
                <span>Camera presets (Front/Side/Top/Perspective)</span>

                <kbd style="padding: 4px 8px; background: #f0f0f0; border-radius: 4px; font-family: monospace;">+/-</kbd>
                <span>Zoom in/out</span>

                <kbd style="padding: 4px 8px; background: #f0f0f0; border-radius: 4px; font-family: monospace;">B</kbd>
                <span>Change background</span>

                <kbd style="padding: 4px 8px; background: #f0f0f0; border-radius: 4px; font-family: monospace;">H or ?</kbd>
                <span>Show this help</span>
            </div>
            <button onclick="this.closest('.modal').classList.add('hidden')"
                    style="margin-top: 20px; padding: 10px 20px; background: var(--color-primary); color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">
                Got it!
            </button>
        </div>
    `;
    showModal('Keyboard Shortcuts', shortcuts);
}

// Show notification
function showNotification(message, duration = 2000) {
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.style.opacity = '1';

    setTimeout(() => {
        notification.style.opacity = '0';
    }, duration);
}

// Show modal helper
function showModal(title, content) {
    let modal = document.getElementById('helpModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'helpModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 id="helpModalTitle">${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').classList.add('hidden')">×</button>
                </div>
                <div id="helpModalBody" class="modal-body"></div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.modal-overlay').addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    modal.querySelector('#helpModalTitle').textContent = title;
    modal.querySelector('#helpModalBody').innerHTML = content;
    modal.classList.remove('hidden');
}

// Viewer control functions
function resetView() {
    if (camera && orbitControls) {
        camera.position.set(0, 0, 5);
        orbitControls.target.copy(new THREE.Vector3(0, 0, 0));
        orbitControls.update();
        showNotification('View reset');
    }
}

// Set camera preset views
function setCameraPreset(preset) {
    if (!camera || !orbitControls) return;

    const distance = 5;
    const target = new THREE.Vector3(0, 0, 0);

    switch(preset) {
        case 'front':
            camera.position.set(0, 0, distance);
            showNotification('Front view');
            break;
        case 'side':
            camera.position.set(distance, 0, 0);
            showNotification('Side view');
            break;
        case 'top':
            camera.position.set(0, distance, 0);
            showNotification('Top view');
            break;
        case 'perspective':
            camera.position.set(distance * 0.7, distance * 0.7, distance * 0.7);
            showNotification('Perspective view');
            break;
    }

    orbitControls.target.copy(target);
    orbitControls.update();
}

// Adjust zoom level
function adjustZoom(factor) {
    if (!camera) return;

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    const distance = camera.position.length();
    const newDistance = distance * factor;

    // Clamp zoom to reasonable limits
    if (newDistance >= 2 && newDistance <= 20) {
        camera.position.multiplyScalar(factor);
        orbitControls?.update();
        showNotification(factor < 1 ? 'Zoomed in' : 'Zoomed out');
    }
}

// Cycle through background colors
function cycleBackground() {
    if (!scene) return;

    currentBackgroundIndex = (currentBackgroundIndex + 1) % backgroundColors.length;
    const bg = backgroundColors[currentBackgroundIndex];
    scene.background = new THREE.Color(bg.color);
    showNotification(`Background: ${bg.name}`);
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

// Take screenshot
function takeScreenshot() {
    if (!renderer || !scene || !camera) {
        showNotification('3D viewer not ready', 2000);
        return;
    }

    try {
        // Render the scene
        renderer.render(scene, camera);

        // Get canvas data
        const canvas = renderer.domElement;
        canvas.toBlob((blob) => {
            if (!blob) {
                showNotification('Screenshot failed', 2000);
                return;
            }

            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const characterName = currentCharacter ? currentCharacter.name.replace(/\s+/g, '_') : 'character';
            link.download = `${characterName}_screenshot_${Date.now()}.png`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            showNotification('Screenshot saved! 📸', 2000);
        });
    } catch (error) {
        console.error('Screenshot error:', error);
        showNotification('Screenshot failed', 2000);
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
