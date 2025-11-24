// Mini-Games Collection - JavaScript
// Load creature data and initialize games

let creatures = [];
const gameState = {
    memory: {
        cards: [],
        flippedCards: [],
        matchedPairs: 0,
        moves: 0,
        timer: 0,
        timerInterval: null,
        gameStarted: false
    },
    guess: {
        currentQuestion: 0,
        score: 0,
        streak: 0,
        difficulty: 'medium',
        questions: [],
        totalQuestions: 10
    },
    trivia: {
        currentQuestion: 0,
        score: 0,
        category: 'all',
        questions: [],
        totalQuestions: 10,
        timer: 30,
        timerInterval: null
    },
    speed: {
        score: 0,
        streak: 0,
        timer: 30,
        timerInterval: null,
        isPlaying: false,
        currentCreature: null,
        answered: []
    }
};

// Load creatures data
async function loadCreatures() {
    try {
        const response = await fetch('characters.json');
        creatures = await response.json();
        initializeHub();
    } catch (error) {
        console.error('Error loading creatures:', error);
        creatures = generateFallbackCreatures();
        initializeHub();
    }
}

// Fallback creatures if JSON fails to load
function generateFallbackCreatures() {
    return [
        { id: 1, name: 'Alduin', race: 'Dragon', location: 'Skuldafn Temple', difficulty: 'Deadly', imagePath: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23660000%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2230%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22white%22%3E🐉%3C/text%3E%3C/svg%3E' },
        { id: 2, name: 'Dragon Priest', race: 'Undead', location: 'Dragon Priest Lairs', difficulty: 'Deadly', imagePath: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23552200%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2230%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22white%22%3E👹%3C/text%3E%3C/svg%3E' }
    ];
}

// Initialize Hub with high scores
function initializeHub() {
    loadHighScores();
}

// Load high scores from localStorage
function loadHighScores() {
    const memoryBest = JSON.parse(localStorage.getItem('memoryBest')) || {};
    const guessBest = JSON.parse(localStorage.getItem('guessBest')) || { score: 0 };
    const triviaBest = JSON.parse(localStorage.getItem('triviaBest')) || { score: 0 };
    const speedBest = JSON.parse(localStorage.getItem('speedBest')) || { score: 0, streak: 0 };

    document.getElementById('memoryBestTime').textContent = memoryBest.time || '--';
    document.getElementById('memoryBestMoves').textContent = memoryBest.moves || '--';
    document.getElementById('guessHighScore').textContent = guessBest.score;
    document.getElementById('triviaBestScore').textContent = triviaBest.score;
    document.getElementById('speedHighScore').textContent = speedBest.score;
    document.getElementById('speedBestStreak').textContent = speedBest.streak;
}

// Start a game
// eslint-disable-next-line no-unused-vars
function startGame(gameType) {
    document.getElementById('gameHub').style.display = 'none';
    
    switch(gameType) {
        case 'memory':
            document.getElementById('memoryGame').style.display = 'block';
            initializeMemoryGame();
            break;
        case 'guess':
            document.getElementById('guessGame').style.display = 'block';
            initializeGuessGame();
            break;
        case 'trivia':
            document.getElementById('triviaGame').style.display = 'block';
            initializeTriviaGame();
            break;
        case 'speed':
            document.getElementById('speedGame').style.display = 'block';
            initializeSpeedGame();
            break;
    }
}

// Return to hub
// eslint-disable-next-line no-unused-vars
function returnToHub() {
    document.querySelectorAll('.game-container').forEach(game => {
        game.style.display = 'none';
    });
    document.getElementById('gameHub').style.display = 'block';
    
    // Clean up timers
    if (gameState.memory.timerInterval) clearInterval(gameState.memory.timerInterval);
    if (gameState.trivia.timerInterval) clearInterval(gameState.trivia.timerInterval);
    if (gameState.speed.timerInterval) clearInterval(gameState.speed.timerInterval);
    
    loadHighScores();
}

// ============================================
// GAME 1: MEMORY MATCH
// ============================================

function initializeMemoryGame() {
    resetMemoryGameState();
    createMemoryCards();
}

function resetMemoryGameState() {
    gameState.memory = {
        cards: [],
        flippedCards: [],
        matchedPairs: 0,
        moves: 0,
        timer: 0,
        timerInterval: null,
        gameStarted: false
    };
    updateMemoryStats();
}

function createMemoryCards() {
    const grid = document.getElementById('memoryGrid');
    grid.innerHTML = '';
    
    // Select 8 random creatures for pairs
    const selectedCreatures = shuffleArray([...creatures]).slice(0, 8);
    
    // Create pairs
    const cardData = [...selectedCreatures, ...selectedCreatures];
    gameState.memory.cards = shuffleArray(cardData.map((creature, index) => ({
        id: index,
        creatureId: creature.id,
        creature: creature,
        matched: false
    })));
    
    // Render cards
    gameState.memory.cards.forEach(card => {
        const cardElement = createMemoryCardElement(card);
        grid.appendChild(cardElement);
    });
}

function createMemoryCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'memory-card';
    cardDiv.dataset.cardId = card.id;
    cardDiv.tabIndex = 0;
    cardDiv.setAttribute('role', 'button');
    cardDiv.setAttribute('aria-label', `Card ${card.id + 1}`);
    
    const front = document.createElement('div');
    front.className = 'card-front';
    front.textContent = '?';
    
    const back = document.createElement('div');
    back.className = 'card-back';
    
    const img = document.createElement('img');
    img.src = card.creature.imagePath;
    img.alt = card.creature.name;
    back.appendChild(img);
    
    cardDiv.appendChild(front);
    cardDiv.appendChild(back);
    
    cardDiv.addEventListener('click', () => flipMemoryCard(card.id));
    cardDiv.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            flipMemoryCard(card.id);
        }
    });
    
    return cardDiv;
}

function flipMemoryCard(cardId) {
    if (!gameState.memory.gameStarted) {
        startMemoryTimer();
        gameState.memory.gameStarted = true;
    }
    
    const card = gameState.memory.cards.find(c => c.id === cardId);
    const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
    
    if (!card || card.matched || gameState.memory.flippedCards.includes(cardId)) {
        return;
    }
    
    if (gameState.memory.flippedCards.length >= 2) {
        return;
    }
    
    cardElement.classList.add('flipped');
    gameState.memory.flippedCards.push(cardId);
    
    if (gameState.memory.flippedCards.length === 2) {
        gameState.memory.moves++;
        updateMemoryStats();
        checkMemoryMatch();
    }
}

function checkMemoryMatch() {
    const [id1, id2] = gameState.memory.flippedCards;
    const card1 = gameState.memory.cards.find(c => c.id === id1);
    const card2 = gameState.memory.cards.find(c => c.id === id2);
    
    setTimeout(() => {
        if (card1.creatureId === card2.creatureId) {
            // Match found
            card1.matched = true;
            card2.matched = true;
            document.querySelector(`[data-card-id="${id1}"]`).classList.add('matched');
            document.querySelector(`[data-card-id="${id2}"]`).classList.add('matched');
            gameState.memory.matchedPairs++;
            updateMemoryStats();
            playSound('success');
            
            if (gameState.memory.matchedPairs === 8) {
                endMemoryGame();
            }
        } else {
            // No match
            document.querySelector(`[data-card-id="${id1}"]`).classList.remove('flipped');
            document.querySelector(`[data-card-id="${id2}"]`).classList.remove('flipped');
            playSound('error');
        }
        
        gameState.memory.flippedCards = [];
    }, 800);
}

function startMemoryTimer() {
    gameState.memory.timerInterval = setInterval(() => {
        gameState.memory.timer++;
        updateMemoryStats();
    }, 1000);
}

function updateMemoryStats() {
    const minutes = Math.floor(gameState.memory.timer / 60);
    const seconds = gameState.memory.timer % 60;
    document.getElementById('memoryTimer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('memoryMoves').textContent = gameState.memory.moves;
    document.getElementById('memoryPairs').textContent = `${gameState.memory.matchedPairs}/8`;
}

function endMemoryGame() {
    clearInterval(gameState.memory.timerInterval);
    
    const timeStr = document.getElementById('memoryTimer').textContent;
    const moves = gameState.memory.moves;
    
    // Save best score
    const currentBest = JSON.parse(localStorage.getItem('memoryBest')) || {};
    let isNewRecord = false;
    
    if (!currentBest.moves || moves < currentBest.moves) {
        currentBest.moves = moves;
        currentBest.time = timeStr;
        isNewRecord = true;
        localStorage.setItem('memoryBest', JSON.stringify(currentBest));
    }
    
    showVictoryModal('Memory Match Complete!', [
        { label: 'Time', value: timeStr },
        { label: 'Moves', value: moves, highlight: isNewRecord },
        { label: 'Pairs Found', value: '8/8' }
    ], () => resetMemoryGame());
}

// eslint-disable-next-line no-unused-vars
function resetMemoryGame() {
    closeVictoryModal();
    initializeMemoryGame();
}

// ============================================
// GAME 2: GUESS THE CREATURE
// ============================================

function initializeGuessGame() {
    const difficulty = document.getElementById('guessDifficulty').value;
    gameState.guess = {
        currentQuestion: 0,
        score: 0,
        streak: 0,
        difficulty: difficulty,
        questions: generateGuessQuestions(difficulty),
        totalQuestions: 10
    };
    updateGuessStats();
    loadGuessQuestion();
    
    document.getElementById('guessDifficulty').addEventListener('change', () => {
        if (gameState.guess.currentQuestion === 0) {
            resetGuessGame();
        }
    });
}

function generateGuessQuestions(difficulty) {
    const shuffled = shuffleArray([...creatures]).slice(0, 10);
    return shuffled.map(creature => ({
        creature: creature,
        type: difficulty === 'hard' ? 'description' : (Math.random() > 0.5 ? 'image' : 'description'),
        options: generateGuessOptions(creature)
    }));
}

function generateGuessOptions(correctCreature) {
    const options = [correctCreature];
    const otherCreatures = creatures.filter(c => c.id !== correctCreature.id);
    const shuffled = shuffleArray(otherCreatures);
    
    for (let i = 0; i < 3 && i < shuffled.length; i++) {
        options.push(shuffled[i]);
    }
    
    return shuffleArray(options);
}

function loadGuessQuestion() {
    if (gameState.guess.currentQuestion >= gameState.guess.totalQuestions) {
        endGuessGame();
        return;
    }
    
    const question = gameState.guess.questions[gameState.guess.currentQuestion];
    const display = document.getElementById('guessCreatureDisplay');
    display.innerHTML = '';
    
    if (question.type === 'image') {
        const img = document.createElement('img');
        img.src = question.creature.imagePath;
        img.alt = 'Mystery creature';
        display.appendChild(img);
        document.getElementById('guessQuestionText').textContent = 'Who is this creature?';
    } else {
        const desc = document.createElement('div');
        desc.className = 'creature-description';
        desc.textContent = question.creature.description || `A ${question.creature.race} found in ${question.creature.location}.`;
        display.appendChild(desc);
        document.getElementById('guessQuestionText').textContent = 'Which creature matches this description?';
    }
    
    renderGuessOptions(question);
}

function renderGuessOptions(question) {
    const optionsContainer = document.getElementById('guessOptions');
    optionsContainer.innerHTML = '';
    
    question.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'guess-option';
        button.textContent = option.name;
        button.onclick = () => selectGuessAnswer(option.id === question.creature.id);
        optionsContainer.appendChild(button);
    });
}

function selectGuessAnswer(isCorrect) {
    const buttons = document.querySelectorAll('.guess-option');
    buttons.forEach(btn => {
        btn.classList.add('disabled');
        btn.onclick = null;
    });
    
    const question = gameState.guess.questions[gameState.guess.currentQuestion];
    buttons.forEach(btn => {
        if (btn.textContent === question.creature.name) {
            btn.classList.add('correct');
        } else if (isCorrect === false && btn.classList.contains('disabled')) {
            const clickedBtn = Array.from(buttons).find(b => b === event.target);
            if (clickedBtn === btn) {
                btn.classList.add('incorrect');
            }
        }
    });
    
    if (isCorrect) {
        gameState.guess.score += 10 + (gameState.guess.streak * 2);
        gameState.guess.streak++;
        playSound('success');
    } else {
        gameState.guess.streak = 0;
        playSound('error');
    }
    
    updateGuessStats();
    
    setTimeout(() => {
        gameState.guess.currentQuestion++;
        updateGuessStats();
        loadGuessQuestion();
    }, 1500);
}

function updateGuessStats() {
    document.getElementById('guessQuestion').textContent = `${gameState.guess.currentQuestion + 1}/10`;
    document.getElementById('guessScore').textContent = gameState.guess.score;
    document.getElementById('guessStreak').textContent = gameState.guess.streak;
}

function endGuessGame() {
    const score = gameState.guess.score;
    const currentBest = JSON.parse(localStorage.getItem('guessBest')) || { score: 0 };
    let isNewRecord = false;
    
    if (score > currentBest.score) {
        currentBest.score = score;
        isNewRecord = true;
        localStorage.setItem('guessBest', JSON.stringify(currentBest));
    }
    
    showVictoryModal('Quiz Complete!', [
        { label: 'Final Score', value: score, highlight: isNewRecord },
        { label: 'Correct Answers', value: `${Math.floor(score / 10)}/10` },
        { label: 'Difficulty', value: gameState.guess.difficulty.charAt(0).toUpperCase() + gameState.guess.difficulty.slice(1) }
    ], () => resetGuessGame());
}

// eslint-disable-next-line no-unused-vars
function resetGuessGame() {
    closeVictoryModal();
    initializeGuessGame();
}

// ============================================
// GAME 3: TRIVIA CHALLENGE
// ============================================

function initializeTriviaGame() {
    const category = document.getElementById('triviaCategory').value;
    gameState.trivia = {
        currentQuestion: 0,
        score: 0,
        category: category,
        questions: generateTriviaQuestions(category),
        totalQuestions: 10,
        timer: 30,
        timerInterval: null
    };
    updateTriviaStats();
    loadTriviaLeaderboard();
    loadTriviaQuestion();
    
    document.getElementById('triviaCategory').addEventListener('change', () => {
        if (gameState.trivia.currentQuestion === 0) {
            resetTriviaGame();
        }
    });
}

function generateTriviaQuestions(category) {
    const questions = [];
    const shuffled = shuffleArray([...creatures]);
    
    for (let i = 0; i < 10 && i < shuffled.length; i++) {
        const creature = shuffled[i];
        let question;
        
        if (category === 'all' || category === 'stats') {
            if (creature.stats) {
                question = generateStatsQuestion(creature);
                if (question) questions.push(question);
            }
        }
        
        if ((category === 'all' || category === 'lore') && questions.length < 10) {
            question = generateLoreQuestion(creature);
            if (question) questions.push(question);
        }
        
        if ((category === 'all' || category === 'combat') && questions.length < 10) {
            if (creature.combat && creature.combat.length > 0) {
                question = generateCombatQuestion(creature);
                if (question) questions.push(question);
            }
        }
        
        if ((category === 'all' || category === 'locations') && questions.length < 10) {
            question = generateLocationQuestion(creature);
            if (question) questions.push(question);
        }
    }
    
    return shuffleArray(questions).slice(0, 10);
}

function generateStatsQuestion(creature) {
    if (!creature.stats) return null;
    
    const statTypes = ['health', 'magicka', 'stamina'];
    const stat = statTypes[Math.floor(Math.random() * statTypes.length)];
    
    return {
        category: 'Stats',
        text: `What is ${creature.name}'s ${stat} stat?`,
        correctAnswer: creature.stats[stat]?.toString() || 'Unknown',
        options: generateStatOptions(creature.stats[stat]),
        type: 'multiple'
    };
}

function generateLoreQuestion(creature) {
    return {
        category: 'Lore',
        text: `${creature.name} is a member of which race/species?`,
        correctAnswer: creature.race,
        options: generateRaceOptions(creature.race),
        type: 'multiple'
    };
}

function generateCombatQuestion(creature) {
    if (!creature.combat || creature.combat.length === 0) return null;
    
    const ability = creature.combat[Math.floor(Math.random() * creature.combat.length)];
    return {
        category: 'Combat',
        text: `${creature.name} has an ability called "${ability.name}". True or False?`,
        correctAnswer: 'True',
        options: ['True', 'False'],
        type: 'truefalse'
    };
}

function generateLocationQuestion(creature) {
    return {
        category: 'Locations',
        text: `Where can you find ${creature.name}?`,
        correctAnswer: creature.location,
        options: generateLocationOptions(creature.location),
        type: 'multiple'
    };
}

function generateStatOptions(correctValue) {
    const options = [correctValue];
    for (let i = 0; i < 3; i++) {
        let wrong = correctValue + (Math.floor(Math.random() * 30) - 15);
        if (wrong < 0) wrong = 0;
        if (wrong > 100) wrong = 100;
        if (!options.includes(wrong)) {
            options.push(wrong);
        }
    }
    return shuffleArray(options.slice(0, 4));
}

function generateRaceOptions(correctRace) {
    const races = [...new Set(creatures.map(c => c.race))];
    const options = [correctRace];
    
    const others = races.filter(r => r !== correctRace);
    shuffleArray(others).slice(0, 3).forEach(r => options.push(r));
    
    return shuffleArray(options);
}

function generateLocationOptions(correctLocation) {
    const locations = [...new Set(creatures.map(c => c.location))];
    const options = [correctLocation];
    
    const others = locations.filter(l => l !== correctLocation);
    shuffleArray(others).slice(0, 3).forEach(l => options.push(l));
    
    return shuffleArray(options);
}

function loadTriviaQuestion() {
    if (gameState.trivia.currentQuestion >= gameState.trivia.totalQuestions) {
        endTriviaGame();
        return;
    }
    
    const question = gameState.trivia.questions[gameState.trivia.currentQuestion];
    document.getElementById('triviaQuestionCategory').textContent = question.category;
    document.getElementById('triviaQuestionText').textContent = question.text;
    
    renderTriviaOptions(question);
    startTriviaTimer();
}

function renderTriviaOptions(question) {
    const optionsContainer = document.getElementById('triviaOptions');
    optionsContainer.innerHTML = '';
    
    question.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'trivia-option';
        button.textContent = option;
        button.onclick = () => selectTriviaAnswer(option === question.correctAnswer);
        optionsContainer.appendChild(button);
    });
}

function startTriviaTimer() {
    gameState.trivia.timer = 30;
    updateTriviaTimer();
    
    if (gameState.trivia.timerInterval) {
        clearInterval(gameState.trivia.timerInterval);
    }
    
    gameState.trivia.timerInterval = setInterval(() => {
        gameState.trivia.timer--;
        updateTriviaTimer();
        
        if (gameState.trivia.timer <= 0) {
            clearInterval(gameState.trivia.timerInterval);
            selectTriviaAnswer(false);
        }
    }, 1000);
}

function updateTriviaTimer() {
    document.getElementById('triviaTimer').textContent = `${gameState.trivia.timer}s`;
}

function selectTriviaAnswer(isCorrect) {
    clearInterval(gameState.trivia.timerInterval);
    
    const buttons = document.querySelectorAll('.trivia-option');
    buttons.forEach(btn => {
        btn.classList.add('disabled');
        btn.onclick = null;
    });
    
    const question = gameState.trivia.questions[gameState.trivia.currentQuestion];
    buttons.forEach(btn => {
        if (btn.textContent === question.correctAnswer) {
            btn.classList.add('correct');
        }
    });
    
    if (isCorrect) {
        const timeBonus = Math.floor(gameState.trivia.timer / 3);
        gameState.trivia.score += 10 + timeBonus;
        playSound('success');
    } else {
        playSound('error');
    }
    
    updateTriviaStats();
    
    setTimeout(() => {
        gameState.trivia.currentQuestion++;
        updateTriviaStats();
        loadTriviaQuestion();
    }, 1500);
}

function updateTriviaStats() {
    document.getElementById('triviaQuestion').textContent = `${gameState.trivia.currentQuestion + 1}/10`;
    document.getElementById('triviaScore').textContent = gameState.trivia.score;
}

function endTriviaGame() {
    clearInterval(gameState.trivia.timerInterval);
    
    const score = gameState.trivia.score;
    const currentBest = JSON.parse(localStorage.getItem('triviaBest')) || { score: 0 };
    let isNewRecord = false;
    
    if (score > currentBest.score) {
        currentBest.score = score;
        isNewRecord = true;
        localStorage.setItem('triviaBest', JSON.stringify(currentBest));
    }
    
    // Add to leaderboard
    addToLeaderboard(score);
    
    showVictoryModal('Trivia Challenge Complete!', [
        { label: 'Final Score', value: score, highlight: isNewRecord },
        { label: 'Category', value: gameState.trivia.category === 'all' ? 'All Categories' : gameState.trivia.category.charAt(0).toUpperCase() + gameState.trivia.category.slice(1) }
    ], () => resetTriviaGame());
}

function addToLeaderboard(score) {
    const leaderboard = JSON.parse(localStorage.getItem('triviaLeaderboard')) || [];
    const timestamp = new Date().toLocaleDateString();
    
    leaderboard.push({
        score: score,
        date: timestamp,
        category: gameState.trivia.category
    });
    
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('triviaLeaderboard', JSON.stringify(leaderboard.slice(0, 10)));
    
    loadTriviaLeaderboard();
}

function loadTriviaLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('triviaLeaderboard')) || [];
    const container = document.getElementById('triviaLeaderboard');
    container.innerHTML = '';
    
    if (leaderboard.length === 0) {
        container.innerHTML = '<div class="leaderboard-empty">No scores yet. Be the first!</div>';
        return;
    }
    
    leaderboard.slice(0, 10).forEach((entry, index) => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'leaderboard-entry';
        
        const rank = document.createElement('div');
        rank.className = 'leaderboard-rank';
        if (index === 0) rank.classList.add('gold');
        if (index === 1) rank.classList.add('silver');
        if (index === 2) rank.classList.add('bronze');
        rank.textContent = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
        
        const name = document.createElement('div');
        name.className = 'leaderboard-name';
        name.textContent = entry.date;
        
        const score = document.createElement('div');
        score.className = 'leaderboard-score';
        score.textContent = entry.score;
        
        entryDiv.appendChild(rank);
        entryDiv.appendChild(name);
        entryDiv.appendChild(score);
        container.appendChild(entryDiv);
    });
}

// eslint-disable-next-line no-unused-vars
function resetTriviaGame() {
    closeVictoryModal();
    initializeTriviaGame();
}

// ============================================
// GAME 4: SPEED IDENTIFICATION
// ============================================

function initializeSpeedGame() {
    gameState.speed = {
        score: 0,
        streak: 0,
        timer: 30,
        timerInterval: null,
        isPlaying: false,
        currentCreature: null,
        answered: []
    };
    updateSpeedStats();
    document.getElementById('speedInputSection').style.display = 'none';
    document.getElementById('speedCreatureDisplay').innerHTML = `
        <div class="speed-instructions">
            <p>🎯 Click START to begin the challenge!</p>
            <p>Identify as many creatures as you can in 30 seconds</p>
            <p>Build streaks for bonus points!</p>
        </div>
    `;
    document.getElementById('speedStartButton').textContent = '▶ Start';
    document.getElementById('speedStartButton').onclick = startSpeedRound;
}

// eslint-disable-next-line no-unused-vars
function startSpeedRound() {
    gameState.speed.isPlaying = true;
    gameState.speed.answered = [];
    document.getElementById('speedInputSection').style.display = 'flex';
    document.getElementById('speedStartButton').disabled = true;
    
    startSpeedTimer();
    loadSpeedCreature();
    
    // Focus input
    document.getElementById('speedInput').focus();
    
    // Enable Enter key submission
    document.getElementById('speedInput').onkeypress = (e) => {
        if (e.key === 'Enter') {
            submitSpeedAnswer();
        }
    };
}

function startSpeedTimer() {
    gameState.speed.timer = 30;
    updateSpeedTimer();
    
    gameState.speed.timerInterval = setInterval(() => {
        gameState.speed.timer--;
        updateSpeedTimer();
        
        if (gameState.speed.timer <= 0) {
            endSpeedGame();
        }
    }, 1000);
}

function updateSpeedTimer() {
    document.getElementById('speedTimer').textContent = `${gameState.speed.timer}s`;
}

function loadSpeedCreature() {
    const available = creatures.filter(c => !gameState.speed.answered.includes(c.id));
    
    if (available.length === 0) {
        gameState.speed.answered = [];
    }
    
    const availableCreatures = creatures.filter(c => !gameState.speed.answered.includes(c.id));
    gameState.speed.currentCreature = availableCreatures[Math.floor(Math.random() * availableCreatures.length)];
    
    const display = document.getElementById('speedCreatureDisplay');
    display.innerHTML = '';
    
    const img = document.createElement('img');
    img.src = gameState.speed.currentCreature.imagePath;
    img.alt = 'Mystery creature';
    display.appendChild(img);
    
    document.getElementById('speedInput').value = '';
    document.getElementById('speedFeedback').textContent = '';
    document.getElementById('speedFeedback').className = 'speed-feedback';
}

// eslint-disable-next-line no-unused-vars
function submitSpeedAnswer() {
    if (!gameState.speed.isPlaying || !gameState.speed.currentCreature) return;
    
    const input = document.getElementById('speedInput').value.trim().toLowerCase();
    const correctName = gameState.speed.currentCreature.name.toLowerCase();
    const feedback = document.getElementById('speedFeedback');
    
    const isCorrect = input === correctName || correctName.includes(input) && input.length > 3;
    
    if (isCorrect) {
        const streakBonus = gameState.speed.streak;
        gameState.speed.score += 10 + streakBonus;
        gameState.speed.streak++;
        
        feedback.textContent = `✓ Correct! +${10 + streakBonus} points`;
        feedback.className = 'speed-feedback correct';
        playSound('success');
        
        gameState.speed.answered.push(gameState.speed.currentCreature.id);
        
        setTimeout(() => {
            loadSpeedCreature();
            updateSpeedStats();
        }, 500);
    } else {
        gameState.speed.streak = 0;
        feedback.textContent = `✗ Wrong! It was ${gameState.speed.currentCreature.name}`;
        feedback.className = 'speed-feedback incorrect';
        playSound('error');
        
        setTimeout(() => {
            loadSpeedCreature();
            updateSpeedStats();
        }, 1500);
    }
    
    updateSpeedStats();
}

// eslint-disable-next-line no-unused-vars
function skipSpeedQuestion() {
    if (!gameState.speed.isPlaying) return;
    
    gameState.speed.streak = 0;
    const feedback = document.getElementById('speedFeedback');
    feedback.textContent = `Skipped: ${gameState.speed.currentCreature.name}`;
    feedback.className = 'speed-feedback';
    
    setTimeout(() => {
        loadSpeedCreature();
        updateSpeedStats();
    }, 1000);
}

function updateSpeedStats() {
    document.getElementById('speedScore').textContent = gameState.speed.score;
    document.getElementById('speedStreak').textContent = gameState.speed.streak;
}

function endSpeedGame() {
    clearInterval(gameState.speed.timerInterval);
    gameState.speed.isPlaying = false;
    
    document.getElementById('speedInputSection').style.display = 'none';
    document.getElementById('speedStartButton').disabled = false;
    
    const score = gameState.speed.score;
    const streak = gameState.speed.streak;
    const currentBest = JSON.parse(localStorage.getItem('speedBest')) || { score: 0, streak: 0 };
    let isNewRecord = false;
    let isNewStreak = false;
    
    if (score > currentBest.score) {
        currentBest.score = score;
        isNewRecord = true;
    }
    
    if (streak > currentBest.streak) {
        currentBest.streak = streak;
        isNewStreak = true;
    }
    
    if (isNewRecord || isNewStreak) {
        localStorage.setItem('speedBest', JSON.stringify(currentBest));
    }
    
    showVictoryModal('Time\'s Up!', [
        { label: 'Final Score', value: score, highlight: isNewRecord },
        { label: 'Best Streak', value: streak, highlight: isNewStreak },
        { label: 'Creatures Identified', value: gameState.speed.answered.length }
    ], () => initializeSpeedGame());
}

// ============================================
// VICTORY MODAL
// ============================================

function showVictoryModal(title, stats, playAgainCallback) {
    const modal = document.getElementById('victoryModal');
    const modalTitle = document.getElementById('victoryTitle');
    const modalStats = document.getElementById('victoryStats');
    const playAgainBtn = document.getElementById('victoryPlayAgain');
    
    modalTitle.textContent = title;
    modalStats.innerHTML = '';
    
    stats.forEach(stat => {
        const statDiv = document.createElement('div');
        statDiv.className = 'victory-stat';
        
        const label = document.createElement('div');
        label.className = 'victory-stat-label';
        label.textContent = stat.label;
        
        const value = document.createElement('div');
        value.className = 'victory-stat-value';
        if (stat.highlight) value.classList.add('highlight');
        value.textContent = stat.value;
        
        statDiv.appendChild(label);
        statDiv.appendChild(value);
        modalStats.appendChild(statDiv);
    });
    
    playAgainBtn.onclick = playAgainCallback;
    
    modal.style.display = 'flex';
    modal.classList.add('fade-in');
}

// eslint-disable-next-line no-unused-vars
function closeVictoryModal() {
    document.getElementById('victoryModal').style.display = 'none';
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Simple sound effects using Web Audio API
let audioContext = null;

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    try {
        initAudioContext();
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'success') {
            oscillator.frequency.value = 523.25; // C5
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } else if (type === 'error') {
            oscillator.frequency.value = 196.00; // G3
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        }
    } catch (error) {
        // Silently fail if audio not supported
        console.log('Audio not supported');
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadCreatures();
});
