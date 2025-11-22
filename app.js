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
    scene.background = new THREE.Color(0xf8f9fa);
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, viewerContent.clientWidth / viewerContent.clientHeight, 0.1, 1000);
    camera.position.set(5, 5, 5);
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(viewerContent.clientWidth, viewerContent.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Controls setup
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = true;
    
    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Grid helper
    const gridHelper = new THREE.GridHelper(10, 10);
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
    
    // Start render loop
    animate();
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    const viewerContent = document.querySelector('.viewer-content');
    camera.aspect = viewerContent.clientWidth / viewerContent.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewerContent.clientWidth, viewerContent.clientHeight);
}

// Setup event listeners
function setupEventListeners() {
    // File upload
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    
    uploadArea.addEventListener('click', () => fileInput.click());
    browseBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleFileDrop);
    
    // Processing controls
    document.getElementById('startReconstructionBtn').addEventListener('click', startReconstruction);
    
    // Viewer controls
    document.getElementById('pointCloudBtn').addEventListener('click', () => switchViewMode('pointcloud'));
    document.getElementById('meshBtn').addEventListener('click', () => switchViewMode('mesh'));
    document.getElementById('wireframeBtn').addEventListener('click', toggleWireframe);
    document.getElementById('mapViewBtn').addEventListener('click', switchToMapView);
    document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);
    
    // Mapping controls
    document.getElementById('generateMapBtn').addEventListener('click', generateMap);
    document.getElementById('mapResolutionSlider').addEventListener('input', updateMapResolution);
    document.getElementById('latInput').addEventListener('input', updateGPSCoordinates);
    document.getElementById('lngInput').addEventListener('input', updateGPSCoordinates);
    document.getElementById('altInput').addEventListener('input', updateGPSCoordinates);
    
    // Settings
    document.getElementById('densitySlider').addEventListener('input', updateDensity);
    document.getElementById('lightingSlider').addEventListener('input', updateLighting);
    
    // Export buttons
    document.getElementById('exportPLY').addEventListener('click', () => exportModel('ply'));
    document.getElementById('exportOBJ').addEventListener('click', () => exportModel('obj'));
    document.getElementById('exportSTL').addEventListener('click', () => exportModel('stl'));
    document.getElementById('exportGeoTIFF').addEventListener('click', () => exportMapData('geotiff'));
    document.getElementById('exportKML').addEventListener('click', () => exportMapData('kml'));
    
    // Load demo data on page load
    setTimeout(() => {
        loadReconstructionData();
        document.getElementById('generateMapBtn').disabled = false;
    }, 1000);
}

// GPS and mapping utility functions
function updateGPSCoordinates() {
    gpsCoordinates.lat = parseFloat(document.getElementById('latInput').value) || 0;
    gpsCoordinates.lng = parseFloat(document.getElementById('lngInput').value) || 0;
    gpsCoordinates.alt = parseFloat(document.getElementById('altInput').value) || 0;
}

function updateMapResolution() {
    const value = document.getElementById('mapResolutionSlider').value;
    document.getElementById('mapResolutionValue').textContent = value + 'm';
}

// File handling
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    addFiles(files);
}

function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
}

function handleDragLeave(event) {
    event.currentTarget.classList.remove('drag-over');
}

function handleFileDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    const files = Array.from(event.dataTransfer.files);
    addFiles(files);
}

function addFiles(files) {
    uploadedFiles = [...uploadedFiles, ...files];
    renderFilePreview();
    
    // Enable start button if files are present
    const startBtn = document.getElementById('startReconstructionBtn');
    startBtn.disabled = uploadedFiles.length === 0;
}

function renderFilePreview() {
    const preview = document.getElementById('filePreview');
    preview.innerHTML = '';
    
    uploadedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        
        const thumbnail = document.createElement('div');
        thumbnail.className = 'file-thumbnail';
        thumbnail.textContent = file.type.startsWith('image/') ? '🖼️' : '🎬';
        
        const fileDetails = document.createElement('div');
        fileDetails.className = 'file-details';
        
        const fileName = document.createElement('span');
        fileName.className = 'file-name';
        fileName.textContent = file.name;
        
        const fileSize = document.createElement('span');
        fileSize.className = 'file-size';
        fileSize.textContent = formatFileSize(file.size);
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'file-remove';
        removeBtn.textContent = '×';
        removeBtn.onclick = () => removeFile(index);
        
        fileDetails.appendChild(fileName);
        fileDetails.appendChild(fileSize);
        fileInfo.appendChild(thumbnail);
        fileInfo.appendChild(fileDetails);
        fileItem.appendChild(fileInfo);
        fileItem.appendChild(removeBtn);
        
        preview.appendChild(fileItem);
    });
}

function removeFile(index) {
    uploadedFiles.splice(index, 1);
    renderFilePreview();
    
    const startBtn = document.getElementById('startReconstructionBtn');
    startBtn.disabled = uploadedFiles.length === 0;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Processing pipeline
function startReconstruction() {
    if (isProcessing) return;
    
    isProcessing = true;
    showProcessingModal();
    
    // Simulate processing pipeline
    const steps = ['step1', 'step2', 'step3', 'step4'];
    let currentStep = 0;
    
    function processNextStep() {
        if (currentStep > 0) {
            document.getElementById(steps[currentStep - 1]).classList.add('completed');
            document.getElementById(steps[currentStep - 1]).classList.remove('active');
        }
        
        if (currentStep < steps.length) {
            document.getElementById(steps[currentStep]).classList.add('active');
            updateProcessingProgress(currentStep + 1, steps.length);
            currentStep++;
            setTimeout(processNextStep, 2000);
        } else {
            completeProcessing();
        }
    }
    
    processNextStep();
}

function showProcessingModal() {
    const modal = document.getElementById('processingModal');
    modal.classList.remove('hidden');
}

function hideProcessingModal() {
    const modal = document.getElementById('processingModal');
    modal.classList.add('hidden');
}

function updateProcessingProgress(step, totalSteps) {
    const progress = (step / totalSteps) * 100;
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    progressFill.style.width = progress + '%';
    
    const messages = [
        'Processing images and extracting features...',
        'Detecting keypoints and matching features...',
        'Computing camera positions and 3D points...',
        'Generating mesh and optimizing structure...'
    ];
    
    progressText.textContent = messages[step - 1];
}

function completeProcessing() {
    isProcessing = false;
    hideProcessingModal();
    loadReconstructionData();
    enableExportButtons();
    
    // Reset pipeline steps
    setTimeout(() => {
        document.querySelectorAll('.pipeline-step').forEach(step => {
            step.classList.remove('active', 'completed');
        });
    }, 1000);
}

// Load and display 3D data
function loadReconstructionData() {
    createPointCloud();
    createMesh();
    switchViewMode('pointcloud');
    hideViewerOverlay();
    updateViewerStats();
}

function createPointCloud() {
    if (pointCloudObject) {
        scene.remove(pointCloudObject);
    }
    
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    
    reconstructionData.point_cloud.forEach(point => {
        positions.push(point.x, point.y, point.z);
        colors.push(point.r / 255, point.g / 255, point.b / 255);
    });
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        sizeAttenuation: true
    });
    
    pointCloudObject = new THREE.Points(geometry, material);
    scene.add(pointCloudObject);
}

function createMesh() {
    if (meshObject) {
        scene.remove(meshObject);
    }
    
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const indices = [];
    
    // Add vertices
    reconstructionData.mesh_vertices.forEach(vertex => {
        positions.push(vertex.x, vertex.y, vertex.z);
        colors.push(vertex.r / 255, vertex.g / 255, vertex.b / 255);
    });
    
    // Add faces
    reconstructionData.mesh_faces.forEach(face => {
        indices.push(face[0], face[1], face[2]);
    });
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshPhongMaterial({
        vertexColors: true,
        side: THREE.DoubleSide
    });
    
    meshObject = new THREE.Mesh(geometry, material);
    scene.add(meshObject);
    meshObject.visible = false;
}

// View mode controls
function switchViewMode(mode) {
    currentMode = mode;
    
    // Update button states
    document.querySelectorAll('#pointCloudBtn, #meshBtn').forEach(btn => {
        btn.classList.remove('btn--primary');
        btn.classList.add('btn--secondary');
    });
    
    if (mode === 'pointcloud') {
        if (pointCloudObject) pointCloudObject.visible = true;
        if (meshObject) meshObject.visible = false;
        document.getElementById('pointCloudBtn').classList.add('btn--primary');
        document.getElementById('pointCloudBtn').classList.remove('btn--secondary');
    } else if (mode === 'mesh') {
        if (pointCloudObject) pointCloudObject.visible = false;
        if (meshObject) meshObject.visible = true;
        document.getElementById('meshBtn').classList.add('btn--primary');
        document.getElementById('meshBtn').classList.remove('btn--secondary');
    }
}

function toggleWireframe() {
    if (meshObject && meshObject.visible) {
        meshObject.material.wireframe = !meshObject.material.wireframe;
        
        const btn = document.getElementById('wireframeBtn');
        if (meshObject.material.wireframe) {
            btn.classList.add('btn--primary');
            btn.classList.remove('btn--secondary');
        } else {
            btn.classList.remove('btn--primary');
            btn.classList.add('btn--secondary');
        }
    }
}

function toggleFullscreen() {
    const viewerContent = document.querySelector('.viewer-content');
    
    if (!document.fullscreenElement) {
        viewerContent.requestFullscreen().then(() => {
            setTimeout(onWindowResize, 100);
        });
    } else {
        document.exitFullscreen();
    }
}

// Settings controls
function updateDensity(event) {
    const value = event.target.value;
    document.getElementById('densityValue').textContent = value;
    
    if (pointCloudObject) {
        pointCloudObject.material.size = parseFloat(value) * 0.1;
    }
}

function updateLighting(event) {
    const value = parseFloat(event.target.value);
    
    scene.children.forEach(child => {
        if (child instanceof THREE.DirectionalLight) {
            child.intensity = value * 0.8;
        } else if (child instanceof THREE.AmbientLight) {
            child.intensity = value * 0.6;
        }
    });
}

// 3D Mapping functionality
function generateMap() {
    if (!reconstructionData.point_cloud || reconstructionData.point_cloud.length === 0) {
        alert('No point cloud data available for map generation');
        return;
    }
    
    const mapType = document.getElementById('mapTypeSelect').value;
    const resolution = parseFloat(document.getElementById('mapResolutionSlider').value);
    
    // Generate map data based on point cloud
    mapData = createMapFromPointCloud(reconstructionData.point_cloud, mapType, resolution);
    
    // Create 3D map visualization
    createMapVisualization(mapData, mapType);
    
    // Enable map export buttons
    document.getElementById('exportGeoTIFF').disabled = false;
    document.getElementById('exportKML').disabled = false;
    
    alert(`3D ${mapType} map generated successfully!`);
}

function createMapFromPointCloud(pointCloud, mapType, resolution) {
    // Calculate bounding box
    const bounds = {
        minX: Math.min(...pointCloud.map(p => p.x)),
        maxX: Math.max(...pointCloud.map(p => p.x)),
        minY: Math.min(...pointCloud.map(p => p.y)),
        maxY: Math.max(...pointCloud.map(p => p.y)),
        minZ: Math.min(...pointCloud.map(p => p.z)),
        maxZ: Math.max(...pointCloud.map(p => p.z))
    };
    
    // Create height map grid
    const gridSize = Math.ceil((bounds.maxX - bounds.minX) / resolution);
    const heightMap = new Array(gridSize).fill(null).map(() => new Array(gridSize).fill(bounds.minZ));
    
    // Populate height map with point cloud data
    pointCloud.forEach(point => {
        const gridX = Math.floor((point.x - bounds.minX) / resolution);
        const gridY = Math.floor((point.y - bounds.minY) / resolution);
        
        if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
            heightMap[gridX][gridY] = Math.max(heightMap[gridX][gridY], point.z);
        }
    });
    
    return {
        heightMap,
        bounds,
        gridSize,
        resolution,
        type: mapType
    };
}

function createMapVisualization(mapData, mapType) {
    // Remove existing map object
    if (mapObject) {
        scene.remove(mapObject);
    }
    
    const geometry = new THREE.PlaneGeometry(
        mapData.bounds.maxX - mapData.bounds.minX,
        mapData.bounds.maxY - mapData.bounds.minY,
        mapData.gridSize - 1,
        mapData.gridSize - 1
    );
    
    // Apply height displacement
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < mapData.gridSize; i++) {
        for (let j = 0; j < mapData.gridSize; j++) {
            const index = (i * mapData.gridSize + j) * 3;
            if (index < vertices.length) {
                vertices[index + 2] = mapData.heightMap[i][j] - mapData.bounds.minZ;
            }
        }
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    
    // Create material based on map type
    let material;
    switch (mapType) {
        case 'topographic':
            material = new THREE.MeshLambertMaterial({ 
                color: 0x8fbc8f,
                wireframe: false 
            });
            break;
        case 'terrain':
            material = new THREE.MeshLambertMaterial({ 
                color: 0xd2691e,
                wireframe: false 
            });
            break;
        case 'satellite':
            material = new THREE.MeshLambertMaterial({ 
                color: 0x228b22,
                wireframe: false 
            });
            break;
        case 'mesh':
            material = new THREE.MeshLambertMaterial({ 
                color: 0x888888,
                wireframe: true 
            });
            break;
        default:
            material = new THREE.MeshLambertMaterial({ 
                color: 0x8fbc8f,
                wireframe: false 
            });
    }
    
    mapObject = new THREE.Mesh(geometry, material);
    mapObject.position.set(
        (mapData.bounds.minX + mapData.bounds.maxX) / 2,
        (mapData.bounds.minY + mapData.bounds.maxY) / 2,
        mapData.bounds.minZ
    );
    mapObject.rotation.x = -Math.PI / 2;
    
    scene.add(mapObject);
}

function switchToMapView() {
    // Hide other objects
    if (pointCloudObject) pointCloudObject.visible = false;
    if (meshObject) meshObject.visible = false;
    
    // Show map
    if (mapObject) {
        mapObject.visible = true;
        currentMode = 'map';
    } else {
        alert('Please generate a map first');
    }
}

function exportMapData(format) {
    if (!mapData) {
        alert('No map data available for export');
        return;
    }
    
    let exportData;
    let filename;
    let mimeType;
    
    switch (format) {
        case 'geotiff':
            exportData = generateGeoTIFFData(mapData);
            filename = 'reconstruction_map.tiff';
            mimeType = 'image/tiff';
            break;
        case 'kml':
            exportData = generateKMLData(mapData);
            filename = 'reconstruction_map.kml';
            mimeType = 'application/vnd.google-earth.kml+xml';
            break;
        default:
            return;
    }
    
    const blob = new Blob([exportData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function generateGeoTIFFData(mapData) {
    // Simple GeoTIFF header simulation (this would need a proper GeoTIFF library)
    let data = "# GeoTIFF Height Map Export\n";
    data += `# Grid Size: ${mapData.gridSize}x${mapData.gridSize}\n`;
    data += `# Resolution: ${mapData.resolution}m\n`;
    data += `# Bounds: ${JSON.stringify(mapData.bounds)}\n`;
    data += "# Height Data:\n";
    
    for (let i = 0; i < mapData.gridSize; i++) {
        for (let j = 0; j < mapData.gridSize; j++) {
            data += mapData.heightMap[i][j].toFixed(3) + " ";
        }
        data += "\n";
    }
    
    return data;
}

function generateKMLData(mapData) {
    const lat = gpsCoordinates.lat || 37.7749;
    const lng = gpsCoordinates.lng || -122.4194;
    
    let kml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    kml += '<kml xmlns="http://www.opengis.net/kml/2.2">\n';
    kml += '  <Document>\n';
    kml += '    <name>3D Reconstruction Map</name>\n';
    kml += '    <description>Generated from 3D reconstruction point cloud</description>\n';
    kml += '    <Placemark>\n';
    kml += '      <name>Reconstruction Area</name>\n';
    kml += '      <description>3D reconstructed area boundary</description>\n';
    kml += '      <Polygon>\n';
    kml += '        <extrude>1</extrude>\n';
    kml += '        <altitudeMode>absolute</altitudeMode>\n';
    kml += '        <outerBoundaryIs>\n';
    kml += '          <LinearRing>\n';
    kml += '            <coordinates>\n';
    kml += `              ${lng},${lat},${mapData.bounds.minZ}\n`;
    kml += `              ${lng + 0.001},${lat},${mapData.bounds.minZ}\n`;
    kml += `              ${lng + 0.001},${lat + 0.001},${mapData.bounds.maxZ}\n`;
    kml += `              ${lng},${lat + 0.001},${mapData.bounds.maxZ}\n`;
    kml += `              ${lng},${lat},${mapData.bounds.minZ}\n`;
    kml += '            </coordinates>\n';
    kml += '          </LinearRing>\n';
    kml += '        </outerBoundaryIs>\n';
    kml += '      </Polygon>\n';
    kml += '    </Placemark>\n';
    kml += '  </Document>\n';
    kml += '</kml>';
    
    return kml;
}

// Export functionality
function enableExportButtons() {
    document.getElementById('exportPLY').disabled = false;
    document.getElementById('exportOBJ').disabled = false;
    document.getElementById('exportSTL').disabled = false;
}

function exportModel(format) {
    const urls = {
        'ply': 'https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/03a4d6a534aeb2d3150592b2f143e815/52fedb55-32f1-4f02-90a0-6af99db42859/e01799a1.ply',
        'obj': 'https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/03a4d6a534aeb2d3150592b2f143e815/52fedb55-32f1-4f02-90a0-6af99db42859/51d260bd.obj',
        'stl': 'https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/03a4d6a534aeb2d3150592b2f143e815/52fedb55-32f1-4f02-90a0-6af99db42859/51d260bd.obj' // Using OBJ as STL placeholder
    };
    
    const url = urls[format];
    if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `reconstruction.${format}`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Utility functions
function hideViewerOverlay() {
    const overlay = document.getElementById('viewerOverlay');
    overlay.classList.add('hidden');
}

function updateViewerStats() {
    document.getElementById('pointCount').textContent = `Points: ${reconstructionData.reconstruction_stats.total_points}`;
    document.getElementById('faceCount').textContent = `Faces: ${reconstructionData.reconstruction_stats.total_faces}`;
    document.getElementById('cameraCount').textContent = `Cameras: ${reconstructionData.num_cameras}`;
}