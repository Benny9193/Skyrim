// Modern ES6 module version with Three.js imports
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';

// Global variables
let scene, camera, renderer, controls;
let pointCloudObject, meshObject, mapObject;
let currentMode = 'pointcloud';
let isProcessing = false;
let uploadedFiles = [];
let mapData = null;
let gpsCoordinates = { lat: 0, lng: 0, alt: 0 };

// Reconstruction data from JSON
const reconstructionData = {
    "point_cloud": [
        {"x": -2.976618388508681, "y": -1.259178444359812, "z": -2.816535995294536, "r": 139, "g": 69, "b": 19},
        {"x": -2.1672238334642613, "y": -1.059178444359812, "z": -2.6165359952945357, "r": 139, "g": 69, "b": 19},
        {"x": -2.3762183834642614, "y": -0.8591784443598121, "z": -2.416535995294536, "r": 139, "g": 69, "b": 19},
        {"x": -2.5762183834642615, "y": -0.9591784443598121, "z": -2.216535995294536, "r": 139, "g": 69, "b": 19}
    ],
    "mesh_vertices": [
        {"x": -2.976618388508681, "y": -1.259178444359812, "z": -2.816535995294536, "r": 139, "g": 69, "b": 19},
        {"x": -2.1672238334642613, "y": -1.059178444359812, "z": -2.6165359952945357, "r": 139, "g": 69, "b": 19}
    ],
    "mesh_faces": [[0, 1, 2], [1, 2, 3], [0, 2, 3]],
    "num_cameras": 2,
    "reconstruction_stats": {
        "total_points": 144,
        "total_faces": 501,
        "bounding_box": {
            "min_x": -3.2751183885086803,
            "max_x": -1.9672238334642613,
            "min_y": -1.2591784443598124,
            "max_y": -0.752388306194288,
            "min_z": -3.0685359952945355,
            "max_z": 3.0986891941297037
        }
    }
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeThreeJS();
    setupEventListeners();
    updateViewerStats();
});

// Initialize Three.js scene
function initializeThreeJS() {
    const canvas = document.getElementById('threeCanvas');
    const viewerContent = canvas.parentElement;

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Camera setup
    const width = viewerContent.clientWidth;
    const height = viewerContent.clientHeight;
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Orbit Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 50;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0xcccccc);
    scene.add(gridHelper);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Start animation loop
    animate();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (controls) {
        controls.update();
    }

    renderer.render(scene, camera);
}

// Window resize handler
function onWindowResize() {
    const canvas = document.getElementById('threeCanvas');
    const viewerContent = canvas.parentElement;
    const width = viewerContent.clientWidth;
    const height = viewerContent.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// Export loaders for use in other functions
export { THREE, OrbitControls, OBJLoader, PLYLoader };
