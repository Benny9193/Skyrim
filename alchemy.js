// Alchemy Lab JavaScript

let ingredients = [];
let filteredIngredients = [];
let selectedIngredients = [null, null, null];

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    setupEventListeners();
    renderIngredients();
});

// Load ingredients data
async function loadData() {
    try {
        const response = await fetch('alchemy.json');
        ingredients = await response.json();
        filteredIngredients = [...ingredients];
    } catch (error) {
        console.error('Error loading ingredients:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Filters
    document.getElementById('ingredientSearch').addEventListener('input', filterIngredients);
    document.getElementById('typeFilter').addEventListener('change', filterIngredients);
    document.getElementById('effectFilter').addEventListener('change', filterIngredients);

    // Clear button
    document.getElementById('clearBtn').addEventListener('click', clearSelection);

    // Ingredient slots
    document.querySelectorAll('.ingredient-slot').forEach(slot => {
        slot.addEventListener('click', () => {
            const slotNum = parseInt(slot.dataset.slot);
            clearSlot(slotNum);
        });
    });
}

// Filter ingredients
function filterIngredients() {
    const search = document.getElementById('ingredientSearch').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value;
    const effectFilter = document.getElementById('effectFilter').value;

    filteredIngredients = ingredients.filter(ingredient => {
        const matchesSearch = ingredient.name.toLowerCase().includes(search) ||
                            ingredient.location.toLowerCase().includes(search);
        const matchesType = !typeFilter || ingredient.type === typeFilter;
        const matchesEffect = !effectFilter || ingredient.effects.includes(effectFilter);

        return matchesSearch && matchesType && matchesEffect;
    });

    renderIngredients();
}

// Render ingredients grid
function renderIngredients() {
    const grid = document.getElementById('ingredientsGrid');

    if (filteredIngredients.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-text-secondary);">No ingredients found</p>';
        return;
    }

    grid.innerHTML = filteredIngredients.map(ingredient => {
        const isSelected = selectedIngredients.some(ing => ing && ing.id === ingredient.id);
        return `
            <div class="ingredient-card ${isSelected ? 'selected' : ''}" onclick="selectIngredient(${ingredient.id})">
                <img src="${ingredient.imagePath}" alt="${ingredient.name}" class="ingredient-image">
                <h3 class="ingredient-name">${ingredient.name}</h3>
                <p class="ingredient-type">${ingredient.type}</p>
                <div class="ingredient-effects">
                    <h4>Effects</h4>
                    <div class="effects-list">
                        ${ingredient.effects.map(effect => `
                            <span class="effect-badge">${effect}</span>
                        `).join('')}
                    </div>
                </div>
                <div class="ingredient-meta">
                    <span>Value: ${ingredient.value}g</span>
                    <span>Weight: ${ingredient.weight}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Select ingredient
function selectIngredient(id) {
    const ingredient = ingredients.find(ing => ing.id === id);
    if (!ingredient) return;

    // Check if already selected
    const existingIndex = selectedIngredients.findIndex(ing => ing && ing.id === id);
    if (existingIndex !== -1) {
        // Deselect
        selectedIngredients[existingIndex] = null;
    } else {
        // Find first empty slot
        const emptyIndex = selectedIngredients.findIndex(ing => ing === null);
        if (emptyIndex !== -1) {
            selectedIngredients[emptyIndex] = ingredient;
        } else {
            // All slots full, replace first
            selectedIngredients[0] = ingredient;
        }
    }

    updateSelectedSlots();
    calculatePotion();
    renderIngredients();
}

// Clear a specific slot
function clearSlot(slotNum) {
    selectedIngredients[slotNum - 1] = null;
    updateSelectedSlots();
    calculatePotion();
    renderIngredients();
}

// Clear all selections
function clearSelection() {
    selectedIngredients = [null, null, null];
    updateSelectedSlots();
    calculatePotion();
    renderIngredients();
}

// Update selected ingredient slots
function updateSelectedSlots() {
    document.querySelectorAll('.ingredient-slot').forEach((slot, index) => {
        const ingredient = selectedIngredients[index];
        const slotText = slot.querySelector('.slot-text');

        if (ingredient) {
            slotText.textContent = ingredient.name;
            slot.classList.add('filled');
        } else {
            slotText.textContent = 'Select Ingredient';
            slot.classList.remove('filled');
        }
    });
}

// Calculate potion effects
function calculatePotion() {
    const potionEffects = document.getElementById('potionEffects');

    // Filter out null ingredients
    const selected = selectedIngredients.filter(ing => ing !== null);

    if (selected.length < 2) {
        potionEffects.innerHTML = '<p class="no-effects">Select 2 or 3 ingredients to see effects</p>';
        return;
    }

    // Find common effects
    const commonEffects = findCommonEffects(selected);

    if (commonEffects.length === 0) {
        potionEffects.innerHTML = '<p class="no-effects">These ingredients have no common effects. The potion will fail.</p>';
        return;
    }

    // Display effects
    potionEffects.innerHTML = `
        <p style="margin-bottom: 12px; color: var(--color-text);"><strong>This combination creates a potion with the following effects:</strong></p>
        ${commonEffects.map(effect => `
            <div class="effect-result">
                <strong>${effect}</strong> - Shared by ${countIngredientsWith(selected, effect)} ingredients
            </div>
        `).join('')}
        <p style="margin-top: 16px; font-size: var(--font-size-sm); color: var(--color-text-secondary);">
            Ingredients used: ${selected.map(ing => ing.name).join(', ')}
        </p>
    `;
}

// Find common effects between ingredients
function findCommonEffects(selected) {
    if (selected.length === 0) return [];

    // Get effects from first ingredient
    let common = [...selected[0].effects];

    // Filter to only effects present in all selected ingredients
    for (let i = 1; i < selected.length; i++) {
        common = common.filter(effect => selected[i].effects.includes(effect));
    }

    return common;
}

// Count how many ingredients have a specific effect
function countIngredientsWith(selected, effect) {
    return selected.filter(ing => ing.effects.includes(effect)).length;
}
