// Modern ES6 module version with Three.js imports
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

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
        const response = await fetch('characters.json');
        if (!response.ok) {
            throw new Error('Failed to fetch character data');
        }
        const data = await response.json();
        characterData = data.characters || [];
        console.log(`Loaded ${characterData.length} characters`);
    } catch (error) {
        console.error('Error loading character data:', error);
        // Fallback to sample data
        characterData = getSampleCharacterData();
    }
}

// Initialize Three.js 3D viewer
function initThreeJS() {
    const canvas = document.getElementById('modelCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColors[currentBackgroundIndex].color);

    // Camera
    const width = canvas.parentElement.clientWidth;
    const height = canvas.parentElement.clientHeight;
    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 2, 5);

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Controls
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.minDistance = 2;
    orbitControls.maxDistance = 20;
    orbitControls.maxPolarAngle = Math.PI / 1.5;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // Grid
    const gridHelper = new THREE.GridHelper(10, 10, 0x888888, 0x444444);
    gridHelper.visible = false;
    scene.add(gridHelper);
    window.gridHelper = gridHelper;

    // Start animation
    animate();

    // Handle resize
    window.addEventListener('resize', onWindowResize);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (orbitControls) {
        orbitControls.update();
    }

    if (currentModel && rotationSpeed > 0) {
        currentModel.rotation.y += rotationSpeed * 0.01;
    }

    renderer.render(scene, camera);
}

// Window resize handler
function onWindowResize() {
    const canvas = document.getElementById('modelCanvas');
    if (!canvas) return;

    const width = canvas.parentElement.clientWidth;
    const height = canvas.parentElement.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// Load favorites from localStorage
function loadFavorites() {
    const stored = localStorage.getItem('characterFavorites');
    favorites = stored ? JSON.parse(stored) : [];
}

// Sample character data fallback
function getSampleCharacterData() {
    return [
        {
            id: 1,
            name: "Alduin",
            race: "Dragon",
            level: 50,
            difficulty: "Deadly",
            health: 3000,
            magicka: 150,
            stamina: 250,
            description: "The World-Eater, first-born of Akatosh",
            location: "Throat of the World",
            faction: "Dragons",
            imagePath: "images/alduin.jpg",
            modelPath: "models/alduin.obj"
        }
    ];
}

// Show error message
function showError(message) {
    console.error(message);
    alert(message);
}

// Setup event listeners (to be implemented)
function setupEventListeners() {
    // Implementation will go here
    console.log('Event listeners set up');
}

// Load character by index (to be implemented)
function loadCharacter(index) {
    currentCharacterIndex = index;
    currentCharacter = characterData[index];
    console.log('Loading character:', currentCharacter);
    // Implementation will continue in the full file
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApplication);

// Export for potential use in other modules
export {
    THREE,
    OrbitControls,
    OBJLoader,
    PLYLoader,
    GLTFLoader,
    FBXLoader,
    characterData,
    currentCharacter
};
