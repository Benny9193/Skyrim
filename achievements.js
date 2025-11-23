// Achievements Tracker JavaScript

let achievements = [];
let filteredAchievements = [];
let completedAchievements = new Set();

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    loadCompletedFromStorage();
    setupEventListeners();
    renderAchievements();
    updateProgress();
});

// Load achievements data
async function loadData() {
    try {
        const response = await fetch('achievements.json');
        achievements = await response.json();
        filteredAchievements = [...achievements];
    } catch (error) {
        console.error('Error loading achievements:', error);
    }
}

// Load completed achievements from localStorage
function loadCompletedFromStorage() {
    const saved = localStorage.getItem('skyrimCompletedAchievements');
    if (saved) {
        try {
            completedAchievements = new Set(JSON.parse(saved));
        } catch (error) {
            console.error('Error loading completed achievements:', error);
        }
    }
}

// Save completed achievements to localStorage
function saveCompletedToStorage() {
    localStorage.setItem('skyrimCompletedAchievements', JSON.stringify(Array.from(completedAchievements)));
}

// Setup event listeners
function setupEventListeners() {
    // Filters
    document.getElementById('achievementSearch').addEventListener('input', filterAchievements);
    document.getElementById('categoryFilter').addEventListener('change', filterAchievements);
    document.getElementById('statusFilter').addEventListener('change', filterAchievements);
}

// Filter achievements
function filterAchievements() {
    const search = document.getElementById('achievementSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    filteredAchievements = achievements.filter(achievement => {
        const matchesSearch = achievement.name.toLowerCase().includes(search) ||
                            achievement.description.toLowerCase().includes(search);
        const matchesCategory = !categoryFilter || achievement.category === categoryFilter;

        let matchesStatus = true;
        if (statusFilter === 'completed') {
            matchesStatus = completedAchievements.has(achievement.id);
        } else if (statusFilter === 'incomplete') {
            matchesStatus = !completedAchievements.has(achievement.id);
        }

        return matchesSearch && matchesCategory && matchesStatus;
    });

    renderAchievements();
}

// Render achievements
function renderAchievements() {
    const grid = document.getElementById('achievementsGrid');

    if (filteredAchievements.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-text-secondary);">No achievements found</p>';
        return;
    }

    grid.innerHTML = filteredAchievements.map(achievement => {
        const isCompleted = completedAchievements.has(achievement.id);
        return `
            <div class="achievement-card ${isCompleted ? 'completed' : 'locked'}">
                <input type="checkbox"
                       class="achievement-checkbox"
                       ${isCompleted ? 'checked' : ''}
                       onchange="toggleAchievement(${achievement.id}, this.checked)">
                <div class="achievement-header">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-info">
                        <h3 class="achievement-name">${achievement.name}</h3>
                        <p class="achievement-category">${achievement.category}</p>
                    </div>
                </div>
                <p class="achievement-description">${achievement.description}</p>
                <p class="achievement-requirement">${achievement.requirement}</p>
                <div class="achievement-footer">
                    <span class="achievement-points">${achievement.points} points</span>
                    <span class="achievement-status ${isCompleted ? 'completed' : 'incomplete'}">
                        ${isCompleted ? 'Completed' : 'Locked'}
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

// Toggle achievement completion
function toggleAchievement(id, isCompleted) {
    if (isCompleted) {
        completedAchievements.add(id);
    } else {
        completedAchievements.delete(id);
    }

    saveCompletedToStorage();
    updateProgress();
    renderAchievements();
}

// Update progress stats
function updateProgress() {
    const totalAchievements = achievements.length;
    const completedCount = completedAchievements.size;
    const progressPercent = totalAchievements > 0 ? Math.round((completedCount / totalAchievements) * 100) : 0;

    // Calculate total points earned
    const totalPoints = achievements
        .filter(achievement => completedAchievements.has(achievement.id))
        .reduce((sum, achievement) => sum + achievement.points, 0);

    // Update stats
    document.getElementById('completedCount').textContent = `${completedCount}/${totalAchievements}`;
    document.getElementById('progressPercent').textContent = `${progressPercent}%`;
    document.getElementById('totalPoints').textContent = totalPoints;

    // Update progress bar
    document.getElementById('progressBar').style.width = `${progressPercent}%`;
}
