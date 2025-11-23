// Size Comparison Tool - JavaScript
// Three.js 3D Comparison Viewer for Skyrim Creatures

// ========================================
// Global State
// ========================================
let characterData = [];
let selectedCreatures = [];
const MAX_CREATURES = 3;

// Three.js scene components
let scene, camera, renderer, orbitControls;
let ambientLight, directionalLight;
let gridHelper;
let loadedModels = [];
let humanReference = null;

// UI state
let currentFilter = 'all';
let searchQuery = '';

// ========================================
// Initialization
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initApplication();
});

async function initApplication() {
    try {
        // Load character data
        await loadCharacterData();
        
        // Initialize Three.js scene
        initThreeJS();
        
        // Setup event listeners
        setupEventListeners();
        
        // Render creature list
        renderCreatureList();
        
        console.log('Size Comparison Tool initialized successfully');
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showError('Failed to load creature data. Please refresh the page.');
    }
}

// ========================================
// Data Loading
// ========================================
async function loadCharacterData() {
    try {
        const response = await fetch('characters.json');
        if (!response.ok) throw new Error('Failed to load characters.json');
        characterData = await response.json();
        
        if (!Array.isArray(characterData)) {
            characterData = [];
        }
        
        console.log(`Loaded ${characterData.length} creatures`);
    } catch (error) {
        console.error('Error loading character data:', error);
        // Use fallback sample data
        characterData = getSampleData();
    }
}

function getSampleData() {
    return [
        {
            id: 1,
            name: "Alduin",
            race: "Dragon",
            level: 50,
            modelPath: "enhanced_mesh.obj",
            imagePath: "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23660000%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2230%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22white%22%3E🐉%3C/text%3E%3C/svg%3E",
            height: "15 feet",
            stats: { health: 100, magicka: 75, stamina: 85 }
        }
    ];
}

// ========================================
// Three.js Setup
// ========================================
function initThreeJS() {
    const canvas = document.getElementById('comparisonCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    scene.fog = new THREE.Fog(0xf5f5f5, 20, 50);

    // Camera setup
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(8, 5, 8);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ 
        canvas, 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting
    ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Add fill light
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // Grid helper
    gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0xcccccc);
    scene.add(gridHelper);

    // Floor plane for shadows
    const floorGeometry = new THREE.PlaneGeometry(50, 50);
    const floorMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Orbit controls
    orbitControls = new THREE.OrbitControls(camera, canvas);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.minDistance = 3;
    orbitControls.maxDistance = 30;
    orbitControls.maxPolarAngle = Math.PI / 2 - 0.1;
    orbitControls.target.set(0, 2, 0);
    orbitControls.update();

    // Add human reference silhouette
    createHumanReference();

    // Animation loop
    animate();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function createHumanReference() {
    // Create a simple human silhouette for scale reference
    const humanGroup = new THREE.Group();
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const headMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x888888,
        transparent: true,
        opacity: 0.6
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.65;
    head.castShadow = true;
    humanGroup.add(head);
    
    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.18, 0.8, 16);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x888888,
        transparent: true,
        opacity: 0.6
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.1;
    body.castShadow = true;
    humanGroup.add(body);
    
    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.9, 12);
    const legMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x888888,
        transparent: true,
        opacity: 0.6
    });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.1, 0.45, 0);
    leftLeg.castShadow = true;
    humanGroup.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.1, 0.45, 0);
    rightLeg.castShadow = true;
    humanGroup.add(rightLeg);
    
    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.7, 12);
    const leftArm = new THREE.Mesh(armGeometry, legMaterial);
    leftArm.position.set(-0.25, 1.2, 0);
    leftArm.rotation.z = Math.PI / 6;
    leftArm.castShadow = true;
    humanGroup.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, legMaterial);
    rightArm.position.set(0.25, 1.2, 0);
    rightArm.rotation.z = -Math.PI / 6;
    rightArm.castShadow = true;
    humanGroup.add(rightArm);
    
    // Label
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 256;
    labelCanvas.height = 64;
    const ctx = labelCanvas.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Human (6ft)', 128, 40);
    
    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    const labelMaterial = new THREE.SpriteMaterial({ map: labelTexture });
    const label = new THREE.Sprite(labelMaterial);
    label.position.set(0, 2.2, 0);
    label.scale.set(1, 0.25, 1);
    humanGroup.add(label);
    
    // Position human reference
    humanGroup.position.set(-3, 0, 0);
    humanReference = humanGroup;
    scene.add(humanGroup);
}

function animate() {
    requestAnimationFrame(animate);
    
    if (orbitControls) {
        orbitControls.update();
    }
    
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

function onWindowResize() {
    const canvas = document.getElementById('comparisonCanvas');
    if (!canvas) return;
    
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// ========================================
// Event Listeners
// ========================================
function setupEventListeners() {
    // Search and filter
    document.getElementById('creatureSearch')?.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderCreatureList();
    });
    
    document.getElementById('creatureFilter')?.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        renderCreatureList();
    });
    
    // Action buttons
    document.getElementById('compareBtn')?.addEventListener('click', loadCreaturesIntoScene);
    document.getElementById('clearAllBtn')?.addEventListener('click', clearAllSelections);
    
    // Viewer controls
    document.getElementById('resetCameraBtn')?.addEventListener('click', resetCamera);
    document.getElementById('toggleGridBtn')?.addEventListener('click', toggleGrid);
    document.getElementById('toggleLightsBtn')?.addEventListener('click', toggleLights);
    document.getElementById('screenshotBtn')?.addEventListener('click', takeScreenshot);
    document.getElementById('fullscreenBtn')?.addEventListener('click', toggleFullscreen);
    
    // Camera presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => setCameraPreset(btn.dataset.preset));
    });
    
    // Lighting controls
    document.getElementById('ambientSlider')?.addEventListener('input', (e) => {
        if (ambientLight) {
            ambientLight.intensity = parseFloat(e.target.value);
        }
    });
    
    document.getElementById('directionalSlider')?.addEventListener('input', (e) => {
        if (directionalLight) {
            directionalLight.intensity = parseFloat(e.target.value);
        }
    });
    
    // Help and size adjust modals
    document.getElementById('helpBtn')?.addEventListener('click', () => {
        document.getElementById('helpModal').classList.remove('hidden');
    });
    
    document.getElementById('adjustSizesBtn')?.addEventListener('click', () => {
        openSizeAdjustModal();
    });
    
    // Modal close buttons
    document.getElementById('closeHelpModal')?.addEventListener('click', () => {
        document.getElementById('helpModal').classList.add('hidden');
    });
    
    document.getElementById('closeSizeModal')?.addEventListener('click', () => {
        document.getElementById('sizeAdjustModal').classList.add('hidden');
    });
    
    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            e.target.closest('.modal')?.classList.add('hidden');
        });
    });
    
    // Size adjustment modal buttons
    document.getElementById('resetSizesBtn')?.addEventListener('click', resetSizes);
    document.getElementById('applySizesBtn')?.addEventListener('click', applySizes);
}

// ========================================
// Creature List Rendering
// ========================================
function renderCreatureList() {
    const listContainer = document.getElementById('creatureList');
    if (!listContainer) return;
    
    // Filter creatures
    let filtered = characterData.filter(creature => {
        // Search filter
        const matchesSearch = !searchQuery || 
            creature.name.toLowerCase().includes(searchQuery) ||
            creature.race.toLowerCase().includes(searchQuery);
        
        // Type filter
        const matchesFilter = currentFilter === 'all' || 
            creature.race.includes(currentFilter) ||
            creature.faction?.includes(currentFilter);
        
        return matchesSearch && matchesFilter;
    });
    
    listContainer.innerHTML = '';
    
    if (filtered.length === 0) {
        listContainer.innerHTML = '<div class="empty-state">No creatures found</div>';
        return;
    }
    
    filtered.forEach(creature => {
        const isSelected = selectedCreatures.some(c => c.id === creature.id);
        const isDisabled = !isSelected && selectedCreatures.length >= MAX_CREATURES;
        
        const item = document.createElement('div');
        item.className = 'creature-item';
        if (isSelected) item.classList.add('selected');
        if (isDisabled) item.classList.add('disabled');
        
        item.innerHTML = `
            <img src="${creature.imagePath}" alt="${creature.name}" class="creature-thumbnail">
            <div class="creature-details">
                <div class="creature-name">${creature.name}</div>
                <div class="creature-meta">${creature.race} • Level ${creature.level}</div>
            </div>
            <i class="fas ${isSelected ? 'fa-check-circle' : 'fa-plus-circle'} creature-icon"></i>
        `;
        
        if (!isDisabled) {
            item.addEventListener('click', () => toggleCreatureSelection(creature));
        }
        
        listContainer.appendChild(item);
    });
}

function renderSelectedList() {
    const listContainer = document.getElementById('selectedList');
    if (!listContainer) return;
    
    if (selectedCreatures.length === 0) {
        listContainer.innerHTML = '<p class="empty-state">No creatures selected. Click on creatures above to add them.</p>';
        document.getElementById('compareBtn').disabled = true;
        document.getElementById('adjustSizesBtn').classList.add('hidden');
        return;
    }
    
    listContainer.innerHTML = '';
    document.getElementById('compareBtn').disabled = false;
    
    selectedCreatures.forEach(creature => {
        const item = document.createElement('div');
        item.className = 'selected-item';
        
        item.innerHTML = `
            <div class="selected-item-info">
                <img src="${creature.imagePath}" alt="${creature.name}" class="selected-item-thumbnail">
                <span class="selected-item-name">${creature.name}</span>
            </div>
            <button class="remove-btn" aria-label="Remove ${creature.name}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        item.querySelector('.remove-btn').addEventListener('click', () => {
            toggleCreatureSelection(creature);
        });
        
        listContainer.appendChild(item);
    });
}

// ========================================
// Creature Selection
// ========================================
function toggleCreatureSelection(creature) {
    const index = selectedCreatures.findIndex(c => c.id === creature.id);
    
    if (index > -1) {
        // Remove creature
        selectedCreatures.splice(index, 1);
    } else {
        // Add creature
        if (selectedCreatures.length < MAX_CREATURES) {
            selectedCreatures.push({
                ...creature,
                scale: 1.0
            });
        }
    }
    
    renderCreatureList();
    renderSelectedList();
}

function clearAllSelections() {
    selectedCreatures = [];
    renderCreatureList();
    renderSelectedList();
    clearScene();
}

// ========================================
// 3D Model Loading
// ========================================
async function loadCreaturesIntoScene() {
    if (selectedCreatures.length === 0) return;
    
    // Show loading overlay
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    overlay.classList.remove('hidden');
    
    // Clear previous models
    clearScene();
    
    // Hide empty state
    document.getElementById('viewerOverlay').classList.add('hidden');
    
    try {
        loadingText.textContent = 'Loading models...';
        
        // Load each creature model
        for (let i = 0; i < selectedCreatures.length; i++) {
            const creature = selectedCreatures[i];
            loadingText.textContent = `Loading ${creature.name}... (${i + 1}/${selectedCreatures.length})`;
            
            await loadCreatureModel(creature, i);
        }
        
        // Update camera to frame all models
        frameAllModels();
        
        // Show creature info cards
        renderCreatureInfoCards();
        
        // Show size adjust button
        document.getElementById('adjustSizesBtn').classList.remove('hidden');
        
        overlay.classList.add('hidden');
        showNotification('Creatures loaded successfully!');
        
    } catch (error) {
        console.error('Error loading models:', error);
        overlay.classList.add('hidden');
        showError('Failed to load one or more models. Some creatures may not appear.');
    }
}

async function loadCreatureModel(creature, index) {
    const modelPath = creature.modelPath;
    
    if (!modelPath) {
        console.warn(`No model path for ${creature.name}, using placeholder`);
        createPlaceholderModel(creature, index);
        return;
    }
    
    try {
        let model;
        
        if (modelPath.endsWith('.obj')) {
            const loader = new THREE.OBJLoader();
            model = await new Promise((resolve, reject) => {
                loader.load(modelPath, resolve, undefined, reject);
            });
        } else if (modelPath.endsWith('.ply')) {
            const loader = new THREE.PLYLoader();
            const geometry = await new Promise((resolve, reject) => {
                loader.load(modelPath, resolve, undefined, reject);
            });
            
            const material = new THREE.PointsMaterial({
                size: 0.01,
                color: getCreatureColor(index),
                sizeAttenuation: true
            });
            
            model = new THREE.Points(geometry, material);
        } else {
            throw new Error('Unsupported model format');
        }
        
        setupCreatureModel(model, creature, index);
        
    } catch (error) {
        console.error(`Failed to load model for ${creature.name}:`, error);
        createPlaceholderModel(creature, index);
    }
}

function createPlaceholderModel(creature, index) {
    // Create a simple colored box as placeholder
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshPhongMaterial({ 
        color: getCreatureColor(index),
        transparent: true,
        opacity: 0.8
    });
    const model = new THREE.Mesh(geometry, material);
    model.castShadow = true;
    model.receiveShadow = true;
    
    setupCreatureModel(model, creature, index);
}

function setupCreatureModel(model, creature, index) {
    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Center the model
    model.position.sub(center);
    
    // Scale based on creature level/size (rough estimation)
    const baseScale = 2 / Math.max(size.x, size.y, size.z);
    const levelScale = 0.5 + (creature.level / 50); // Scale based on level
    const finalScale = baseScale * levelScale * (creature.scale || 1.0);
    
    model.scale.multiplyScalar(finalScale);
    
    // Create a group for the creature
    const creatureGroup = new THREE.Group();
    creatureGroup.add(model);
    
    // Position creatures side by side
    const spacing = 3;
    const offset = (selectedCreatures.length - 1) * spacing / 2;
    creatureGroup.position.x = index * spacing - offset + 1;
    
    // Add name label
    const label = createNameLabel(creature.name);
    label.position.y = 3;
    creatureGroup.add(label);
    
    // Store reference
    creatureGroup.userData = {
        creature: creature,
        index: index,
        originalScale: finalScale
    };
    
    model.castShadow = true;
    model.receiveShadow = true;
    
    scene.add(creatureGroup);
    loadedModels.push(creatureGroup);
}

function createNameLabel(name) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, 512, 128);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(name, 256, 80);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(2, 0.5, 1);
    
    return sprite;
}

function getCreatureColor(index) {
    const colors = [0x3b82f6, 0xef4444, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xec4899];
    return colors[index % colors.length];
}

function clearScene() {
    // Remove all loaded models
    loadedModels.forEach(model => {
        scene.remove(model);
        // Dispose of geometries and materials
        model.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
    });
    loadedModels = [];
    
    // Clear creature info section
    const infoSection = document.getElementById('creatureInfoSection');
    if (infoSection) {
        infoSection.innerHTML = '';
    }
    
    // Show empty state
    document.getElementById('viewerOverlay').classList.remove('hidden');
}

// ========================================
// Camera Controls
// ========================================
function resetCamera() {
    camera.position.set(8, 5, 8);
    orbitControls.target.set(0, 2, 0);
    orbitControls.update();
    showNotification('Camera reset');
}

function setCameraPreset(preset) {
    // Remove active class from all presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked preset
    event.target.closest('.preset-btn').classList.add('active');
    
    const distance = 10;
    const target = new THREE.Vector3(0, 2, 0);
    
    switch(preset) {
        case 'front':
            camera.position.set(0, 2, distance);
            break;
        case 'top':
            camera.position.set(0, distance, 0);
            break;
        case 'dramatic':
            camera.position.set(distance * 0.7, distance * 0.5, distance * 0.7);
            break;
    }
    
    orbitControls.target.copy(target);
    orbitControls.update();
    showNotification(`${preset.charAt(0).toUpperCase() + preset.slice(1)} view`);
}

function frameAllModels() {
    if (loadedModels.length === 0) return;
    
    const box = new THREE.Box3();
    loadedModels.forEach(model => {
        box.expandByObject(model);
    });
    
    // Include human reference
    if (humanReference) {
        box.expandByObject(humanReference);
    }
    
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraDistance = Math.abs(maxDim / Math.sin(fov / 2));
    cameraDistance *= 1.5; // Add some padding
    
    const direction = camera.position.clone().sub(center).normalize();
    camera.position.copy(direction.multiplyScalar(cameraDistance).add(center));
    
    orbitControls.target.copy(center);
    orbitControls.maxDistance = cameraDistance * 3;
    orbitControls.update();
}

// ========================================
// Viewer Controls
// ========================================
function toggleGrid() {
    if (gridHelper) {
        gridHelper.visible = !gridHelper.visible;
        showNotification(gridHelper.visible ? 'Grid enabled' : 'Grid disabled');
    }
}

function toggleLights() {
    const newIntensity = ambientLight.intensity > 0.5 ? 0.3 : 0.8;
    ambientLight.intensity = newIntensity;
    directionalLight.intensity = newIntensity;
    showNotification(newIntensity > 0.5 ? 'Lights on' : 'Lights dimmed');
}

function toggleFullscreen() {
    const viewerCard = document.querySelector('.viewer-card');
    if (!document.fullscreenElement) {
        viewerCard.requestFullscreen().catch(err => {
            console.error('Error entering fullscreen:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

function takeScreenshot() {
    if (!renderer || !scene || !camera) {
        showNotification('Viewer not ready');
        return;
    }
    
    try {
        renderer.render(scene, camera);
        
        const canvas = renderer.domElement;
        canvas.toBlob((blob) => {
            if (!blob) {
                showNotification('Screenshot failed');
                return;
            }
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `skyrim_size_comparison_${Date.now()}.png`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            showNotification('Screenshot saved! 📸');
        });
    } catch (error) {
        console.error('Screenshot error:', error);
        showNotification('Screenshot failed');
    }
}

// ========================================
// Creature Info Cards
// ========================================
function renderCreatureInfoCards() {
    const section = document.getElementById('creatureInfoSection');
    if (!section) return;
    
    section.innerHTML = '';
    
    selectedCreatures.forEach(creature => {
        const card = document.createElement('div');
        card.className = 'card creature-info-card';
        
        card.innerHTML = `
            <div class="creature-info-header">
                <img src="${creature.imagePath}" alt="${creature.name}" class="creature-info-thumbnail">
                <div class="creature-info-title">
                    <h4 class="creature-info-name">${creature.name}</h4>
                    <p class="creature-info-race">${creature.race}</p>
                </div>
            </div>
            <div class="creature-info-stats">
                <div class="stat-row">
                    <span class="stat-label">Level:</span>
                    <span class="stat-value">${creature.level}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Health:</span>
                    <span class="stat-value">${creature.stats?.health || 'N/A'}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Scale:</span>
                    <span class="stat-value">${(creature.scale || 1.0).toFixed(2)}x</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Height:</span>
                    <span class="stat-value">${creature.height || 'Unknown'}</span>
                </div>
            </div>
        `;
        
        section.appendChild(card);
    });
}

// ========================================
// Size Adjustment
// ========================================
function openSizeAdjustModal() {
    const modal = document.getElementById('sizeAdjustModal');
    const container = document.getElementById('sizeSliders');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    selectedCreatures.forEach((creature, index) => {
        const sliderItem = document.createElement('div');
        sliderItem.className = 'size-slider-item';
        
        sliderItem.innerHTML = `
            <div class="size-slider-header">
                <span class="size-slider-label">${creature.name}</span>
                <span class="size-slider-value" id="sizeValue${index}">${creature.scale.toFixed(2)}x</span>
            </div>
            <input 
                type="range" 
                id="sizeSlider${index}" 
                min="0.5" 
                max="2.0" 
                step="0.1" 
                value="${creature.scale}" 
                class="slider"
                data-index="${index}"
            >
        `;
        
        const slider = sliderItem.querySelector('input');
        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            document.getElementById(`sizeValue${index}`).textContent = `${value.toFixed(2)}x`;
        });
        
        container.appendChild(sliderItem);
    });
    
    modal.classList.remove('hidden');
}

function resetSizes() {
    selectedCreatures.forEach((creature, index) => {
        creature.scale = 1.0;
        const slider = document.getElementById(`sizeSlider${index}`);
        const valueDisplay = document.getElementById(`sizeValue${index}`);
        if (slider) slider.value = 1.0;
        if (valueDisplay) valueDisplay.textContent = '1.00x';
    });
}

function applySizes() {
    selectedCreatures.forEach((creature, index) => {
        const slider = document.getElementById(`sizeSlider${index}`);
        if (slider) {
            creature.scale = parseFloat(slider.value);
        }
    });
    
    // Reload models with new scales
    loadCreaturesIntoScene();
    
    document.getElementById('sizeAdjustModal').classList.add('hidden');
    showNotification('Sizes updated!');
}

// ========================================
// Utility Functions
// ========================================
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

function showError(message) {
    console.error(message);
    showNotification('⚠️ ' + message, 3000);
}

// ========================================
// Keyboard Shortcuts
// ========================================
document.addEventListener('keydown', (e) => {
    // Ignore if typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch(e.key) {
        case 'r':
        case 'R':
            e.preventDefault();
            resetCamera();
            break;
        case 'g':
        case 'G':
            e.preventDefault();
            toggleGrid();
            break;
        case 'l':
        case 'L':
            e.preventDefault();
            toggleLights();
            break;
        case 's':
        case 'S':
            e.preventDefault();
            takeScreenshot();
            break;
        case 'f':
        case 'F':
            e.preventDefault();
            toggleFullscreen();
            break;
        case 'h':
        case 'H':
        case '?':
            e.preventDefault();
            document.getElementById('helpModal').classList.remove('hidden');
            break;
        case 'Escape':
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.add('hidden');
            });
            break;
    }
});

console.log('Size Comparison Tool loaded successfully');
