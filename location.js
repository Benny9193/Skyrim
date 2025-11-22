// Location Detail Page JavaScript

let currentLocation = null;
let allLocations = [];
let currentIndex = 0;

// Three.js variables
let scene, camera, renderer, controls, model;
let rotationSpeed = 1.0;
let ambientLightIntensity = 0.5;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadLocationData();
    const locationId = getLocationIdFromURL();
    if (locationId) {
        loadLocation(locationId);
    } else {
        // Load first location if no ID specified
        if (allLocations.length > 0) {
            loadLocation(allLocations[0].id);
        }
    }
    setupEventListeners();
    init3DViewer();
});

// Get location ID from URL parameter
function getLocationIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    return id ? parseInt(id) : null;
}

// Load all location data from JSON
async function loadLocationData() {
    try {
        const response = await fetch('locations.json');
        if (!response.ok) throw new Error('Failed to load locations.json');
        allLocations = await response.json();
        if (!Array.isArray(allLocations)) {
            allLocations = [];
        }
    } catch (error) {
        console.warn('Could not load locations.json:', error);
        allLocations = [];
    }
}

// Load specific location by ID
function loadLocation(locationId) {
    currentLocation = allLocations.find(l => l.id === locationId);
    if (!currentLocation) {
        console.error('Location not found:', locationId);
        return;
    }

    currentIndex = allLocations.findIndex(l => l.id === locationId);
    updateLocationDisplay();
    load3DModel();

    // Update URL without reload
    const newUrl = `${window.location.pathname}?id=${locationId}`;
    window.history.pushState({ id: locationId }, '', newUrl);
}

// Update the location display
function updateLocationDisplay() {
    if (!currentLocation) return;

    // Header
    document.getElementById('locationName').textContent = currentLocation.name;
    document.getElementById('locationType').textContent = currentLocation.type;
    document.getElementById('locationHold').textContent = currentLocation.hold;
    document.getElementById('locationRegion').textContent = currentLocation.region;

    // Image
    const imageEl = document.getElementById('locationImage');
    imageEl.src = currentLocation.imagePath;
    imageEl.alt = currentLocation.name;

    // Quick Info
    const difficultyEl = document.getElementById('infoDifficulty');
    const difficultyClass = currentLocation.difficulty.toLowerCase().replace(' ', '-');
    difficultyEl.innerHTML = `<span class="difficulty-badge ${difficultyClass}">${currentLocation.difficulty}</span>`;

    document.getElementById('infoClimate').textContent = currentLocation.climate || 'Unknown';
    document.getElementById('infoFastTravel').textContent = currentLocation.fastTravel ? 'Yes' : 'No';

    // Discovered button
    const discoveredBtn = document.getElementById('toggleDiscoveredBtn');
    if (currentLocation.discovered) {
        discoveredBtn.textContent = 'Discovered ✓';
        discoveredBtn.classList.add('btn--primary');
    } else {
        discoveredBtn.textContent = 'Mark as Discovered';
        discoveredBtn.classList.remove('btn--primary');
    }

    // Description
    document.getElementById('locationDescription').textContent = currentLocation.description || 'No description available.';

    // Features
    const featuresList = document.getElementById('featuresList');
    if (currentLocation.features && currentLocation.features.length > 0) {
        featuresList.innerHTML = currentLocation.features.map(feature =>
            `<li>${feature}</li>`
        ).join('');
    } else {
        featuresList.innerHTML = '<li style="text-align: center; color: var(--color-text-secondary); font-style: italic;">No notable features listed</li>';
    }

    // NPCs
    const npcsList = document.getElementById('npcsList');
    if (currentLocation.npcs && currentLocation.npcs.length > 0) {
        npcsList.innerHTML = currentLocation.npcs.map(npc =>
            `<div class="npc-item">${npc}</div>`
        ).join('');
    } else {
        npcsList.innerHTML = '<div class="npc-item empty-state">No notable NPCs</div>';
    }

    // Quests
    const questsList = document.getElementById('questsList');
    if (currentLocation.quests && currentLocation.quests.length > 0) {
        questsList.innerHTML = currentLocation.quests.map(quest =>
            `<li>${quest}</li>`
        ).join('');
    } else {
        questsList.innerHTML = '<li class="empty-state">No related quests</li>';
    }

    // Shops
    const shopsList = document.getElementById('shopsList');
    if (currentLocation.shops && currentLocation.shops.length > 0) {
        shopsList.innerHTML = currentLocation.shops.map(shop =>
            `<div class="shop-item">
                <span class="shop-name">${shop.name}</span>
                <span class="shop-type">${shop.type}</span>
            </div>`
        ).join('');
    } else {
        shopsList.innerHTML = '<div class="shop-item empty-state">No shops or services</div>';
    }

    // Navigation counter
    document.getElementById('locationCounter').textContent = `${currentIndex + 1} / ${allLocations.length}`;

    // Load saved notes
    loadNotes();
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.getElementById('prevLocationBtn').addEventListener('click', () => {
        const prevIndex = (currentIndex - 1 + allLocations.length) % allLocations.length;
        loadLocation(allLocations[prevIndex].id);
    });

    document.getElementById('nextLocationBtn').addEventListener('click', () => {
        const nextIndex = (currentIndex + 1) % allLocations.length;
        loadLocation(allLocations[nextIndex].id);
    });

    // Discovered toggle
    document.getElementById('toggleDiscoveredBtn').addEventListener('click', toggleDiscovered);

    // Notes
    document.getElementById('saveNotesBtn').addEventListener('click', saveNotes);

    // 3D Viewer controls
    document.getElementById('resetViewBtn').addEventListener('click', resetView);
    document.getElementById('lightModeBtn').addEventListener('click', toggleLighting);
    document.getElementById('wireframeBtn').addEventListener('click', toggleWireframe);
    document.getElementById('gridBtn').addEventListener('click', toggleGrid);
    document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);

    // Sliders
    document.getElementById('rotationSpeedSlider').addEventListener('input', (e) => {
        rotationSpeed = parseFloat(e.target.value);
        document.getElementById('rotationSpeedValue').textContent = rotationSpeed.toFixed(1) + 'x';
    });

    document.getElementById('ambientLightSlider').addEventListener('input', (e) => {
        ambientLightIntensity = parseFloat(e.target.value);
        document.getElementById('ambientLightValue').textContent = ambientLightIntensity.toFixed(1);
        if (scene) {
            const ambientLight = scene.getObjectByName('ambientLight');
            if (ambientLight) {
                ambientLight.intensity = ambientLightIntensity;
            }
        }
    });
}

// Toggle discovered status
function toggleDiscovered() {
    if (!currentLocation) return;

    currentLocation.discovered = !currentLocation.discovered;

    // Save to localStorage
    const discovered = JSON.parse(localStorage.getItem('skyrim_discovered_locations') || '[]');
    if (currentLocation.discovered) {
        if (!discovered.includes(currentLocation.id)) {
            discovered.push(currentLocation.id);
        }
    } else {
        const index = discovered.indexOf(currentLocation.id);
        if (index > -1) {
            discovered.splice(index, 1);
        }
    }
    localStorage.setItem('skyrim_discovered_locations', JSON.stringify(discovered));

    // Update display
    updateLocationDisplay();
}

// Notes functions
function loadNotes() {
    if (!currentLocation) return;
    const notes = JSON.parse(localStorage.getItem('skyrim_location_notes') || '{}');
    const locationNotes = notes[currentLocation.id] || '';
    document.getElementById('locationNotes').value = locationNotes;
}

function saveNotes() {
    if (!currentLocation) return;
    const notes = JSON.parse(localStorage.getItem('skyrim_location_notes') || '{}');
    notes[currentLocation.id] = document.getElementById('locationNotes').value;
    localStorage.setItem('skyrim_location_notes', JSON.stringify(notes));
    alert('Notes saved!');
}

// 3D Viewer initialization
function init3DViewer() {
    const canvas = document.getElementById('locationCanvas');
    const container = canvas.parentElement;

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // Camera
    camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 2, 5);

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, ambientLightIntensity);
    ambientLight.name = 'ambientLight';
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 20;

    // Grid (hidden by default)
    const gridHelper = new THREE.GridHelper(10, 10);
    gridHelper.visible = false;
    gridHelper.name = 'grid';
    scene.add(gridHelper);

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Start animation loop
    animate();
}

// Load 3D model
function load3DModel() {
    if (!currentLocation || !scene) return;

    // Remove existing model
    if (model) {
        scene.remove(model);
        model = null;
    }

    // Show loading overlay
    document.getElementById('viewerOverlay').classList.remove('hidden');

    // Load the model
    const loader = new THREE.OBJLoader();
    loader.load(
        currentLocation.modelPath || 'enhanced_mesh.obj',
        (object) => {
            model = object;

            // Center and scale the model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 3 / maxDim;

            model.scale.multiplyScalar(scale);
            model.position.sub(center.multiplyScalar(scale));

            // Add material to model
            model.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x8B7355,
                        roughness: 0.7,
                        metalness: 0.3
                    });
                }
            });

            scene.add(model);

            // Hide loading overlay
            setTimeout(() => {
                document.getElementById('viewerOverlay').classList.add('hidden');
            }, 500);
        },
        (xhr) => {
            // Loading progress
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
            console.error('Error loading model:', error);
            document.getElementById('viewerOverlay').querySelector('p').textContent = 'Failed to load 3D model';
        }
    );
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate model slowly
    if (model) {
        model.rotation.y += 0.005 * rotationSpeed;
    }

    controls.update();
    renderer.render(scene, camera);
}

// Window resize handler
function onWindowResize() {
    const canvas = document.getElementById('locationCanvas');
    const container = canvas.parentElement;

    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Viewer control functions
function resetView() {
    camera.position.set(0, 2, 5);
    controls.reset();
}

function toggleLighting() {
    const ambientLight = scene.getObjectByName('ambientLight');
    if (ambientLight) {
        ambientLight.intensity = ambientLight.intensity > 0 ? 0 : ambientLightIntensity;
    }
}

function toggleWireframe() {
    if (model) {
        model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material.wireframe = !child.material.wireframe;
            }
        });
    }
}

function toggleGrid() {
    const grid = scene.getObjectByName('grid');
    if (grid) {
        grid.visible = !grid.visible;
    }
}

function toggleFullscreen() {
    const container = document.querySelector('.viewer-content');
    if (!document.fullscreenElement) {
        container.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}
