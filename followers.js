// Followers JavaScript

let followers = [];
let filteredFollowers = [];

// DOM Elements
const followersGrid = document.getElementById('followersGrid');
const searchInput = document.getElementById('followerSearch');
const raceFilter = document.getElementById('raceFilter');
const classFilter = document.getElementById('classFilter');
const marriageFilter = document.getElementById('marriageFilter');
const essentialFilter = document.getElementById('essentialFilter');
const followerModal = document.getElementById('followerModal');
const modalBackdrop = document.querySelector('.modal-backdrop');
const closeBtn = document.querySelector('.close-btn');

// Load followers data
async function loadData() {
    try {
        const response = await fetch('followers.json');
        followers = await response.json();
        filteredFollowers = [...followers];
        renderFollowers();
    } catch (error) {
        console.error('Error loading followers:', error);
        followersGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-secondary);">Failed to load followers data.</p>';
    }
}

// Filter followers
function filterFollowers() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedRace = raceFilter.value;
    const selectedClass = classFilter.value;
    const selectedMarriage = marriageFilter.value;
    const selectedEssential = essentialFilter.value;

    filteredFollowers = followers.filter(follower => {
        const matchesSearch = follower.name.toLowerCase().includes(searchTerm) ||
                            follower.description.toLowerCase().includes(searchTerm) ||
                            follower.personality.toLowerCase().includes(searchTerm) ||
                            follower.faction.toLowerCase().includes(searchTerm);
        const matchesRace = !selectedRace || follower.race === selectedRace;
        const matchesClass = !selectedClass || follower.class === selectedClass;
        const matchesMarriage = !selectedMarriage || follower.marriageable.toString() === selectedMarriage;
        const matchesEssential = !selectedEssential || follower.essential.toString() === selectedEssential;

        return matchesSearch && matchesRace && matchesClass && matchesMarriage && matchesEssential;
    });

    renderFollowers();
}

// Render followers grid
function renderFollowers() {
    if (filteredFollowers.length === 0) {
        followersGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-secondary);">No followers found matching your criteria.</p>';
        return;
    }

    followersGrid.innerHTML = filteredFollowers.map(follower => `
        <div class="follower-card" onclick="openFollowerModal(${follower.id})">
            <div class="follower-card-header">
                <div class="follower-card-icon">${follower.icon}</div>
                <div class="follower-card-info">
                    <h3 class="follower-card-title">${follower.name}</h3>
                    <p class="follower-card-subtitle">${follower.race} • ${follower.class}</p>
                </div>
            </div>
            <div class="follower-card-badges">
                <span class="faction-badge">${follower.faction}</span>
                <span class="level-badge">${follower.level}</span>
                ${follower.marriageable ? '<span class="marriage-badge">💍</span>' : ''}
                ${follower.essential ? '<span class="essential-badge">⚡</span>' : ''}
            </div>
            <p class="follower-card-description">${follower.description.substring(0, 120)}${follower.description.length > 120 ? '...' : ''}</p>
            <div class="follower-card-skills">
                ${follower.skills.slice(0, 4).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                ${follower.skills.length > 4 ? `<span class="skill-tag">+${follower.skills.length - 4}</span>` : ''}
            </div>
        </div>
    `).join('');
}

// Open follower modal
function openFollowerModal(followerId) {
    const follower = followers.find(f => f.id === followerId);
    if (!follower) return;

    document.getElementById('followerIcon').textContent = follower.icon;
    document.getElementById('followerName').textContent = follower.name;
    document.getElementById('followerRace').textContent = follower.race;
    document.getElementById('followerClass').textContent = follower.class;
    document.getElementById('followerGender').textContent = follower.gender;
    document.getElementById('followerFaction').textContent = follower.faction;
    document.getElementById('followerLevel').textContent = follower.level;

    // Show/hide marriageable badge
    const marriageBadge = document.getElementById('marriageBadge');
    if (follower.marriageable) {
        marriageBadge.style.display = 'inline-block';
    } else {
        marriageBadge.style.display = 'none';
    }

    // Show/hide essential badge
    const essentialBadge = document.getElementById('essentialBadge');
    if (follower.essential) {
        essentialBadge.style.display = 'inline-block';
    } else {
        essentialBadge.style.display = 'none';
    }

    document.getElementById('followerDescription').textContent = follower.description;
    document.getElementById('followerPersonality').textContent = follower.personality;
    document.getElementById('followerLocation').textContent = follower.location;
    document.getElementById('followerRecruitment').textContent = follower.recruitment;
    document.getElementById('followerMorality').textContent = follower.morality;

    // Populate skills
    const skillsList = document.getElementById('followerSkills');
    skillsList.innerHTML = follower.skills.map(skill =>
        `<span class="skill-badge">${skill}</span>`
    ).join('');

    followerModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    followerModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Event listeners
searchInput.addEventListener('input', filterFollowers);
raceFilter.addEventListener('change', filterFollowers);
classFilter.addEventListener('change', filterFollowers);
marriageFilter.addEventListener('change', filterFollowers);
essentialFilter.addEventListener('change', filterFollowers);
closeBtn.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !followerModal.classList.contains('hidden')) {
        closeModal();
    }
});

// Initialize
loadData();
