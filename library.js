// Library JavaScript

let books = [];
let filteredBooks = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    setupEventListeners();
    renderBooks();
});

// Load books data
async function loadData() {
    try {
        const response = await fetch('books.json');
        books = await response.json();
        filteredBooks = [...books];
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Filters
    document.getElementById('bookSearch').addEventListener('input', filterBooks);
    document.getElementById('categoryFilter').addEventListener('change', filterBooks);
    document.getElementById('skillFilter').addEventListener('change', filterBooks);
    document.getElementById('rarityFilter').addEventListener('change', filterBooks);

    // Modal close
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('modalBackdrop').addEventListener('click', closeModal);
}

// Filter books
function filterBooks() {
    const search = document.getElementById('bookSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const skillFilter = document.getElementById('skillFilter').value;
    const rarityFilter = document.getElementById('rarityFilter').value;

    filteredBooks = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(search) ||
                            book.author.toLowerCase().includes(search) ||
                            book.description.toLowerCase().includes(search);
        const matchesCategory = !categoryFilter || book.category === categoryFilter;
        const matchesSkill = !skillFilter || book.skill === skillFilter;
        const matchesRarity = !rarityFilter || book.rarity === rarityFilter;

        return matchesSearch && matchesCategory && matchesSkill && matchesRarity;
    });

    renderBooks();
}

// Render books grid
function renderBooks() {
    const grid = document.getElementById('booksGrid');

    if (filteredBooks.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-text-secondary);">No books found</p>';
        return;
    }

    grid.innerHTML = filteredBooks.map(book => `
        <div class="book-card ${book.skillBook ? 'skill-book' : ''}" onclick="openBookModal(${book.id})">
            <h3 class="book-title-text">${book.title}</h3>
            <p class="book-author">By ${book.author}</p>
            <div>
                <span class="book-category-badge">${book.category}</span>
                ${book.skillBook ? `<span class="skill-book-badge">${book.skill}</span>` : ''}
            </div>
            <p class="book-desc">${book.description}</p>
            <div class="book-card-meta">
                <span>${book.value} gold</span>
                <span class="rarity-badge ${book.rarity.toLowerCase()}">${book.rarity}</span>
            </div>
        </div>
    `).join('');
}

// Open book modal
function openBookModal(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;

    // Update modal content
    document.getElementById('modalBookTitle').textContent = book.title;
    document.getElementById('modalTitle').textContent = book.title;
    document.getElementById('modalAuthor').textContent = `By ${book.author}`;
    document.getElementById('modalCategory').textContent = book.category;
    document.getElementById('modalValue').textContent = `Value: ${book.value} gold`;
    document.getElementById('modalRarity').textContent = book.rarity;
    document.getElementById('modalDescription').textContent = book.description;
    document.getElementById('modalExcerpt').textContent = book.excerpt;

    // Skill info
    const skillInfo = document.getElementById('modalSkillInfo');
    if (book.skillBook) {
        skillInfo.innerHTML = `
            <h3>Skill Book</h3>
            <p>Reading this book will increase your <strong>${book.skill}</strong> skill by 1 level.</p>
        `;
        skillInfo.style.display = 'block';
    } else {
        skillInfo.style.display = 'none';
    }

    // Locations
    const locationsList = document.getElementById('modalLocations');
    locationsList.innerHTML = book.locations.map(loc => `<li>${loc}</li>`).join('');

    // Show modal
    document.getElementById('bookModal').classList.remove('hidden');
}

// Close modal
function closeModal() {
    document.getElementById('bookModal').classList.add('hidden');
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});
