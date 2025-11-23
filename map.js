// Interactive Map JavaScript

let locations = [];
let currentFilter = 'all';
let showLabels = true;

// Pan and zoom variables
let isPanning = false;
let startX, startY, scrollLeft, scrollTop;
let scale = 1;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadLocations();
    setupEventListeners();
    setupPanZoom();
});

// Load location data
async function loadLocations() {
    try {
        const response = await fetch('locations.json');
        locations = await response.json();
    } catch (error) {
        console.error('Could not load locations:', error);
        locations = [];
    }
}

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.control-btn[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.control-btn[data-filter]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            applyFilter();
        });
    });

    // Reset zoom
    document.getElementById('resetZoomBtn').addEventListener('click', resetView);

    // Toggle labels
    document.getElementById('toggleLabelsBtn').addEventListener('click', toggleLabels);

    // Marker clicks
    document.querySelectorAll('.marker').forEach(marker => {
        marker.addEventListener('click', (e) => {
            const locationId = parseInt(marker.dataset.location);
            showLocationInfo(locationId);
        });
    });

    // Close info panel
    document.getElementById('closeInfoBtn').addEventListener('click', () => {
        document.getElementById('locationInfo').classList.add('hidden');
    });
}

// Apply filter to markers
function applyFilter() {
    const markers = document.querySelectorAll('.marker');

    markers.forEach(marker => {
        const type = marker.dataset.type;

        if (currentFilter === 'all' || type === currentFilter) {
            marker.classList.remove('hidden');
        } else {
            marker.classList.add('hidden');
        }
    });
}

// Toggle labels visibility
function toggleLabels() {
    showLabels = !showLabels;
    const labels = document.querySelectorAll('.map-label');

    labels.forEach(label => {
        label.style.display = showLabels ? 'block' : 'none';
    });
}

// Show location info panel
function showLocationInfo(locationId) {
    const location = locations.find(l => l.id === locationId);

    if (!location) return;

    document.getElementById('infoName').textContent = location.name;
    document.getElementById('infoType').textContent = location.type;
    document.getElementById('infoDescription').textContent = location.description.substring(0, 200) + '...';
    document.getElementById('infoLink').href = `location.html?id=${locationId}`;
    document.getElementById('locationInfo').classList.remove('hidden');
}

// Pan and zoom functionality
function setupPanZoom() {
    const canvas = document.getElementById('mapCanvas');
    const svg = document.getElementById('mapSvg');

    // Mouse down
    canvas.addEventListener('mousedown', (e) => {
        isPanning = true;
        startX = e.pageX - canvas.offsetLeft;
        startY = e.pageY - canvas.offsetTop;
        scrollLeft = canvas.scrollLeft;
        scrollTop = canvas.scrollTop;
        canvas.style.cursor = 'grabbing';
    });

    // Mouse up
    canvas.addEventListener('mouseup', () => {
        isPanning = false;
        canvas.style.cursor = 'grab';
    });

    // Mouse leave
    canvas.addEventListener('mouseleave', () => {
        isPanning = false;
        canvas.style.cursor = 'grab';
    });

    // Mouse move
    canvas.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        e.preventDefault();

        const x = e.pageX - canvas.offsetLeft;
        const y = e.pageY - canvas.offsetTop;
        const walkX = (x - startX) * 1.5;
        const walkY = (y - startY) * 1.5;

        canvas.scrollLeft = scrollLeft - walkX;
        canvas.scrollTop = scrollTop - walkY;
    });

    // Zoom with mouse wheel
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();

        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        scale *= delta;

        // Limit scale
        scale = Math.max(0.5, Math.min(3, scale));

        svg.style.transform = `scale(${scale})`;
        svg.style.transformOrigin = 'center center';
    });

    // Touch support for mobile
    let touchStartDist = 0;

    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            // Pinch to zoom
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            touchStartDist = Math.hypot(
                touch2.pageX - touch1.pageX,
                touch2.pageY - touch1.pageY
            );
        } else if (e.touches.length === 1) {
            // Pan
            isPanning = true;
            startX = e.touches[0].pageX - canvas.offsetLeft;
            startY = e.touches[0].pageY - canvas.offsetTop;
            scrollLeft = canvas.scrollLeft;
            scrollTop = canvas.scrollTop;
        }
    });

    canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            // Pinch zoom
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const touchDist = Math.hypot(
                touch2.pageX - touch1.pageX,
                touch2.pageY - touch1.pageY
            );

            const delta = touchDist / touchStartDist;
            scale *= delta > 1 ? 1.05 : 0.95;
            scale = Math.max(0.5, Math.min(3, scale));

            svg.style.transform = `scale(${scale})`;
            touchStartDist = touchDist;
        } else if (e.touches.length === 1 && isPanning) {
            // Pan
            e.preventDefault();
            const x = e.touches[0].pageX - canvas.offsetLeft;
            const y = e.touches[0].pageY - canvas.offsetTop;
            const walkX = (x - startX) * 1.5;
            const walkY = (y - startY) * 1.5;

            canvas.scrollLeft = scrollLeft - walkX;
            canvas.scrollTop = scrollTop - walkY;
        }
    });

    canvas.addEventListener('touchend', () => {
        isPanning = false;
        touchStartDist = 0;
    });
}

// Reset view
function resetView() {
    const canvas = document.getElementById('mapCanvas');
    const svg = document.getElementById('mapSvg');

    scale = 1;
    svg.style.transform = 'scale(1)';
    canvas.scrollLeft = 0;
    canvas.scrollTop = 0;
}
