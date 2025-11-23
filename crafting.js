// Crafting JavaScript

let recipes = [];
let filteredRecipes = [];

// DOM Elements
const craftingGrid = document.getElementById('craftingGrid');
const searchInput = document.getElementById('craftingSearch');
const categoryFilter = document.getElementById('categoryFilter');
const typeFilter = document.getElementById('typeFilter');
const skillFilter = document.getElementById('skillFilter');
const recipeModal = document.getElementById('recipeModal');
const modalBackdrop = document.querySelector('.modal-backdrop');
const closeBtn = document.querySelector('.close-btn');

// Load recipes data
async function loadData() {
    try {
        const response = await fetch('crafting.json');
        recipes = await response.json();
        filteredRecipes = [...recipes];
        renderRecipes();
    } catch (error) {
        console.error('Error loading crafting recipes:', error);
        craftingGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-secondary);">Failed to load crafting recipes data.</p>';
    }
}

// Filter recipes
function filterRecipes() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedType = typeFilter.value;
    const selectedSkill = skillFilter.value;

    filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = recipe.name.toLowerCase().includes(searchTerm) ||
                            recipe.description.toLowerCase().includes(searchTerm) ||
                            recipe.materials.some(m => m.item.toLowerCase().includes(searchTerm));
        const matchesCategory = !selectedCategory || recipe.category === selectedCategory;
        const matchesType = !selectedType || recipe.type === selectedType;
        const matchesSkill = !selectedSkill || recipe.skillLevel >= parseInt(selectedSkill);

        return matchesSearch && matchesCategory && matchesType && matchesSkill;
    });

    renderRecipes();
}

// Render recipes grid
function renderRecipes() {
    if (filteredRecipes.length === 0) {
        craftingGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-secondary);">No crafting recipes found matching your criteria.</p>';
        return;
    }

    craftingGrid.innerHTML = filteredRecipes.map(recipe => `
        <div class="recipe-card" onclick="openRecipeModal(${recipe.id})">
            <div class="recipe-card-header">
                <div class="recipe-card-icon">${recipe.icon}</div>
                <div class="recipe-card-info">
                    <h3 class="recipe-card-title">${recipe.name}</h3>
                    <p class="recipe-card-subtitle">${recipe.category} • ${recipe.type}</p>
                </div>
            </div>
            <div class="recipe-card-badges">
                <span class="skill-badge">Level ${recipe.skillLevel}</span>
                ${recipe.perkRequired ? `<span class="perk-badge">${recipe.perkRequired}</span>` : '<span class="perk-badge">No Perk</span>'}
            </div>
            <div class="recipe-card-stats">
                <div class="stat-mini">
                    <span class="stat-mini-label">Value</span>
                    <span class="stat-mini-value">${recipe.value}g</span>
                </div>
                <div class="stat-mini">
                    <span class="stat-mini-label">${recipe.damage !== undefined ? 'Damage' : 'Armor'}</span>
                    <span class="stat-mini-value">${recipe.damage !== undefined ? recipe.damage : recipe.armorRating || '-'}</span>
                </div>
                <div class="stat-mini">
                    <span class="stat-mini-label">Weight</span>
                    <span class="stat-mini-value">${recipe.weight}</span>
                </div>
            </div>
            <div class="recipe-card-materials">
                🔨 ${recipe.materials.length} material${recipe.materials.length > 1 ? 's' : ''} required
            </div>
        </div>
    `).join('');
}

// Open recipe modal
function openRecipeModal(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    document.getElementById('recipeIcon').textContent = recipe.icon;
    document.getElementById('recipeName').textContent = recipe.name;
    document.getElementById('recipeType').textContent = `${recipe.category} - ${recipe.type}`;
    document.getElementById('recipeCategory').textContent = recipe.category;
    document.getElementById('recipeSkill').textContent = `Level ${recipe.skillLevel}`;

    const perkBadge = document.getElementById('recipePerk');
    if (recipe.perkRequired) {
        perkBadge.textContent = recipe.perkRequired;
        perkBadge.style.display = 'inline-block';
    } else {
        perkBadge.textContent = 'No Perk Required';
        perkBadge.style.display = 'inline-block';
    }

    document.getElementById('recipeDescription').textContent = recipe.description;
    document.getElementById('recipeWeight').textContent = recipe.weight;
    document.getElementById('recipeValue').textContent = recipe.value + ' gold';

    // Show damage or armor rating based on type
    const damageSection = document.getElementById('damageSection');
    const armorSection = document.getElementById('armorSection');

    if (recipe.damage !== undefined) {
        document.getElementById('recipeDamage').textContent = recipe.damage;
        damageSection.style.display = 'block';
        armorSection.style.display = 'none';
    } else if (recipe.armorRating !== undefined) {
        document.getElementById('recipeArmor').textContent = recipe.armorRating;
        armorSection.style.display = 'block';
        damageSection.style.display = 'none';
    } else {
        damageSection.style.display = 'none';
        armorSection.style.display = 'none';
    }

    // Populate materials
    const materialsList = document.getElementById('recipeMaterials');
    materialsList.innerHTML = recipe.materials.map(material => `
        <div class="material-item">
            <span class="material-name">${material.item}</span>
            <span class="material-quantity">x${material.quantity}</span>
        </div>
    `).join('');

    document.getElementById('recipeStation').textContent = recipe.craftingStation;
    document.getElementById('recipeSkillReq').textContent = `${recipe.skillRequired} (Level ${recipe.skillLevel})`;
    document.getElementById('recipeImprovement').textContent = recipe.improvementMaterial;

    recipeModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    recipeModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Event listeners
searchInput.addEventListener('input', filterRecipes);
categoryFilter.addEventListener('change', filterRecipes);
typeFilter.addEventListener('change', filterRecipes);
skillFilter.addEventListener('change', filterRecipes);
closeBtn.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !recipeModal.classList.contains('hidden')) {
        closeModal();
    }
});

// Initialize
loadData();
