// Location Viewer JavaScript
/* global THREE */

let allLocations = [];
let currentLocation = null;
let currentLocationIndex = 0;

// Three.js variables
let scene, camera, renderer, controls, currentMesh;
let wireframeMode = false;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadLocationData();
  initializeViewer();
  loadLocationFromURL();
  setupEventListeners();
  setupKeyboardShortcuts();
});

// Load location data from JSON
async function loadLocationData() {
  try {
    const response = await fetch('locations.json');
    if (!response.ok)
      throw new Error(`Failed to load locations.json: ${response.status} ${response.statusText}`);
    allLocations = await response.json();

    if (!Array.isArray(allLocations) || allLocations.length === 0) {
      throw new Error('No locations found');
    }
  } catch (error) {
    console.error('Error loading locations:', error);
    showError(`Failed to load location data: ${error.message}`);
  }
}

// Initialize Three.js 3D Viewer
function initializeViewer() {
  const canvas = document.getElementById('locationCanvas');
  if (!canvas) return;

  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#1a1a2e');

  // Camera setup
  camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.set(5, 3, 5);

  // Renderer setup
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: false,
  });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 10);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
  fillLight.position.set(-10, 5, -10);
  scene.add(fillLight);

  // Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.rotateSpeed = 0.8;
  controls.minDistance = 2;
  controls.maxDistance = 20;

  // Handle window resize
  window.addEventListener('resize', onWindowResize, false);

  // Start animation loop
  animate();
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  if (controls) controls.update();
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

// Handle window resize
function onWindowResize() {
  const canvas = document.getElementById('locationCanvas');
  if (!canvas) return;

  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
}

// Load location from URL parameter
function loadLocationFromURL() {
  const params = new URLSearchParams(window.location.search);
  const locationId = params.get('id');

  if (locationId) {
    const index = allLocations.findIndex(loc => loc.id === parseInt(locationId));
    if (index !== -1) {
      currentLocationIndex = index;
      loadLocation(allLocations[index]);
      return;
    }
  }

  // Default to first location
  if (allLocations.length > 0) {
    currentLocationIndex = 0;
    loadLocation(allLocations[0]);
  }
}

// Load and display location
function loadLocation(location) {
  if (!location) return;

  currentLocation = location;
  updateURL(location.id);

  // Update header
  document.getElementById('locationName').textContent = location.name;
  document.getElementById('locationType').textContent = location.type;

  // Update overview
  document.getElementById('locationHold').textContent = location.hold || 'Unknown';
  document.getElementById('locationRegion').textContent = location.region || 'Unknown';
  document.getElementById('locationClimate').textContent = location.climate || 'Unknown';

  const difficultyEl = document.getElementById('locationDifficulty');
  difficultyEl.textContent = location.difficulty || 'Unknown';
  difficultyEl.className =
    'detail-value difficulty-badge ' +
    (location.difficulty || 'normal').toLowerCase().replace(/\s+/g, '-');

  document.getElementById('locationFastTravel').textContent = location.fastTravel
    ? 'Available ✓'
    : 'Not Available ✗';

  // Update description
  document.getElementById('locationDescription').textContent =
    location.description || 'No description available.';

  // Update features
  updateList('featuresList', location.features);

  // Update NPCs
  updateList('npcsList', location.npcs);

  // Update quests
  updateList('questsList', location.quests);

  // Update shops
  updateShops(location.shops);

  // Update discovery status
  updateDiscoveryStatus(location.id);

  // Load 3D model
  load3DModel(location.modelPath);

  // Update document title
  document.title = `${location.name} - Skyrim Location Viewer`;
}

// Update a list element
function updateList(elementId, items) {
  const listEl = document.getElementById(elementId);
  if (!listEl) return;

  if (!items || items.length === 0) {
    listEl.innerHTML =
      '<li style="color: var(--color-text-secondary); font-style: italic;">None</li>';
    return;
  }

  listEl.innerHTML = items.map(item => `<li>${item}</li>`).join('');
}

// Update shops list
function updateShops(shops) {
  const shopsEl = document.getElementById('shopsList');
  const shopsCard = document.getElementById('shopsCard');

  if (!shops || shops.length === 0) {
    shopsCard.style.display = 'none';
    return;
  }

  shopsCard.style.display = 'block';
  shopsEl.innerHTML = shops
    .map(
      shop => `
        <div class="shop-item">
            <span class="shop-name">${shop.name}</span>
            <span class="shop-type">${shop.type}</span>
        </div>
    `
    )
    .join('');
}

// Load 3D model
function load3DModel(modelPath) {
  if (!modelPath) {
    hideLoading();
    return;
  }

  showLoading();

  // Remove existing mesh
  if (currentMesh) {
    scene.remove(currentMesh);
    currentMesh = null;
  }

  // Load OBJ model
  const loader = new THREE.OBJLoader();
  loader.load(
    modelPath,
    object => {
      // Calculate bounding box and center
      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // Center the model
      object.position.sub(center);

      // Scale to fit
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 3 / maxDim;
      object.scale.setScalar(scale);

      // Add materials
      object.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x8b7355,
            roughness: 0.7,
            metalness: 0.3,
          });
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      scene.add(object);
      currentMesh = object;
      hideLoading();
    },
    () => {
      // Progress callback (optional)
    },
    error => {
      console.error('Error loading model:', error);
      hideLoading();
      // Add placeholder geometry on error
      addPlaceholderGeometry();
    }
  );
}

// Add placeholder geometry when model fails to load
function addPlaceholderGeometry() {
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  const material = new THREE.MeshStandardMaterial({
    color: 0x8b7355,
    roughness: 0.7,
    metalness: 0.3,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  currentMesh = mesh;
}

// Show/hide loading overlay
function showLoading() {
  const overlay = document.getElementById('viewerOverlay');
  if (overlay) overlay.classList.remove('hidden');
}

function hideLoading() {
  const overlay = document.getElementById('viewerOverlay');
  if (overlay) overlay.classList.add('hidden');
}

// Update URL without reload
function updateURL(locationId) {
  const url = new URL(window.location);
  url.searchParams.set('id', locationId);
  window.history.pushState({}, '', url);
}

// Navigate to previous location
function navigateToPrevious() {
  if (allLocations.length === 0) return;
  currentLocationIndex = (currentLocationIndex - 1 + allLocations.length) % allLocations.length;
  loadLocation(allLocations[currentLocationIndex]);
}

// Navigate to next location
function navigateToNext() {
  if (allLocations.length === 0) return;
  currentLocationIndex = (currentLocationIndex + 1) % allLocations.length;
  loadLocation(allLocations[currentLocationIndex]);
}

// Navigate to random location
function navigateToRandom() {
  if (allLocations.length === 0) return;
  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * allLocations.length);
  } while (randomIndex === currentLocationIndex && allLocations.length > 1);

  currentLocationIndex = randomIndex;
  loadLocation(allLocations[currentLocationIndex]);
}

// Toggle wireframe mode
function toggleWireframe() {
  wireframeMode = !wireframeMode;

  if (currentMesh) {
    currentMesh.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.material.wireframe = wireframeMode;
      }
    });
  }
}

// Reset camera position
function resetCamera() {
  camera.position.set(5, 3, 5);
  camera.lookAt(0, 0, 0);
  controls.reset();
}

// Take screenshot
function takeScreenshot() {
  if (!renderer || !currentLocation) return;

  renderer.render(scene, camera);

  try {
    const canvas = renderer.domElement;
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentLocation.name.replace(/\s+/g, '_')}_${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  } catch (error) {
    console.error('Screenshot failed:', error);
  }
}

// Toggle fullscreen
function toggleFullscreen() {
  const viewerCard = document.querySelector('.viewer-card');
  if (!viewerCard) return;

  if (!document.fullscreenElement) {
    viewerCard.requestFullscreen().catch(err => {
      console.error('Fullscreen failed:', err);
    });
  } else {
    document.exitFullscreen();
  }
}

// Change background color
function changeBackground(color) {
  if (scene) {
    scene.background = new THREE.Color(color);
  }

  // Update active state
  document.querySelectorAll('.bg-option').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.color === color) {
      btn.classList.add('active');
    }
  });
}

// Discovery status management
function updateDiscoveryStatus(locationId) {
  const discovered = isLocationDiscovered(locationId);
  const btn = document.getElementById('discoveryBtn');
  const icon = document.getElementById('discoveryIcon');
  const text = document.getElementById('discoveryText');

  if (discovered) {
    btn.classList.add('discovered');
    icon.textContent = '☑';
    text.textContent = 'Discovered';
  } else {
    btn.classList.remove('discovered');
    icon.textContent = '☐';
    text.textContent = 'Mark as Discovered';
  }
}

function isLocationDiscovered(locationId) {
  const discovered = JSON.parse(localStorage.getItem('discoveredLocations') || '[]');
  return discovered.includes(locationId);
}

function toggleDiscovery() {
  if (!currentLocation) return;

  const discovered = JSON.parse(localStorage.getItem('discoveredLocations') || '[]');
  const index = discovered.indexOf(currentLocation.id);

  if (index === -1) {
    discovered.push(currentLocation.id);
  } else {
    discovered.splice(index, 1);
  }

  localStorage.setItem('discoveredLocations', JSON.stringify(discovered));
  updateDiscoveryStatus(currentLocation.id);
}

// Setup event listeners
function setupEventListeners() {
  // Navigation buttons
  document.getElementById('prevLocationBtn')?.addEventListener('click', navigateToPrevious);
  document.getElementById('nextLocationBtn')?.addEventListener('click', navigateToNext);
  document.getElementById('randomLocationBtn')?.addEventListener('click', navigateToRandom);

  // Viewer controls
  document.getElementById('resetCameraBtn')?.addEventListener('click', resetCamera);
  document.getElementById('wireframeBtn')?.addEventListener('click', toggleWireframe);
  document.getElementById('screenshotBtn')?.addEventListener('click', takeScreenshot);
  document.getElementById('fullscreenBtn')?.addEventListener('click', toggleFullscreen);

  // Background selector
  document.querySelectorAll('.bg-option').forEach(btn => {
    btn.addEventListener('click', e => {
      changeBackground(e.target.dataset.color);
    });
  });

  // Discovery button
  document.getElementById('discoveryBtn')?.addEventListener('click', toggleDiscovery);

  // Help modal
  document.getElementById('helpBtn')?.addEventListener('click', () => {
    document.getElementById('helpModal')?.classList.remove('hidden');
  });

  document.getElementById('closeHelpBtn')?.addEventListener('click', () => {
    document.getElementById('helpModal')?.classList.add('hidden');
  });

  // Close modal on overlay click
  document.querySelector('#helpModal .modal-overlay')?.addEventListener('click', () => {
    document.getElementById('helpModal')?.classList.add('hidden');
  });
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    // Ignore if typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key.toLowerCase()) {
      case 'arrowleft':
        e.preventDefault();
        navigateToPrevious();
        break;
      case 'arrowright':
        e.preventDefault();
        navigateToNext();
        break;
      case 'r':
        navigateToRandom();
        break;
      case 's':
        e.preventDefault();
        takeScreenshot();
        break;
      case 'w':
        toggleWireframe();
        break;
      case 'f':
        toggleFullscreen();
        break;
      case 'h':
      case '?':
        document.getElementById('helpModal')?.classList.remove('hidden');
        break;
      case 'escape':
        document.getElementById('helpModal')?.classList.add('hidden');
        break;
    }
  });
}

// Error display
function showError(message) {
  console.error(message);
  // You could add a toast notification or error modal here
}
