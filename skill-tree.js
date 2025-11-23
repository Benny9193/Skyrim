/**
 * Skyrim Bestiary - Interactive Skill Tree Visualizer
 * Canvas-based skill tree visualization with advanced features
 */

// ============================================
// Global State
// ============================================

const state = {
  creatures: [],
  selectedCreature: null,
  comparisonCreature: null,
  comparisonMode: false,
  filters: {
    types: ['combat', 'magic', 'passive', 'special'],
    mastery: ['Novice', 'Adept', 'Expert', 'Legendary'],
  },
  zoom: 1,
  pan: { x: 0, y: 0 },
  isDragging: false,
  lastMouse: { x: 0, y: 0 },
  hoveredNode: null,
  selectedNode: null,
  skillNodes: [],
  skillConnections: [],
};

// ============================================
// Skill Type Configuration
// ============================================

const SKILL_CONFIG = {
  combat: {
    color: '#ff4444',
    keywords: [
      'melee',
      'combat',
      'weapon',
      'claw',
      'bite',
      'attack',
      'crushing',
      'charge',
      'intimidation',
      'berserker',
    ],
    icon: '⚔️',
  },
  magic: {
    color: '#4444ff',
    keywords: [
      'magic',
      'destruction',
      'alteration',
      'restoration',
      'conjuration',
      'mysticism',
      'blood',
      'frost',
      'fire',
      'shock',
      "thu'um",
    ],
    icon: '✨',
  },
  passive: {
    color: '#44ff44',
    keywords: ['resistance', 'regeneration', 'evasion', 'armor', 'stealth'],
    icon: '🛡️',
  },
  special: {
    color: '#ff44ff',
    keywords: ['dragon breath', 'alchemy', 'poison', 'nature', 'life drain', 'summon'],
    icon: '🌟',
  },
};

const MASTERY_CONFIG = {
  Novice: { size: 20, color: '#888', glow: 5 },
  Adept: { size: 25, color: '#4a90e2', glow: 8 },
  Expert: { size: 30, color: '#e2a44a', glow: 10 },
  Legendary: { size: 35, color: '#e24a4a', glow: 15 },
};

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  await loadCreatures();
  initializeCanvas();
  setupEventListeners();
  hideLoading();
});

async function loadCreatures() {
  try {
    const response = await fetch('characters.json');
    if (!response.ok) throw new Error('Failed to load creatures');
    state.creatures = await response.json();
    populateCreatureSelects();

    // Select first creature by default
    if (state.creatures.length > 0) {
      selectCreature(state.creatures[0].id);
    }
  } catch (error) {
    console.error('Error loading creatures:', error);
    showError('Failed to load creature data');
  }
}

function populateCreatureSelects() {
  const primarySelect = document.getElementById('creature-select');
  const compareSelect = document.getElementById('creature-compare');

  const options = state.creatures
    .map(creature => `<option value="${creature.id}">${creature.name} (${creature.race})</option>`)
    .join('');

  primarySelect.innerHTML = options;
  compareSelect.innerHTML = '<option value="">Select creature...</option>' + options;
}

// ============================================
// Canvas Setup
// ============================================

function initializeCanvas() {
  const canvas = document.getElementById('skill-tree-canvas');
  const container = canvas.parentElement;

  // Set canvas size
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function resizeCanvas() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    drawSkillTree();
  }
}

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
  const canvas = document.getElementById('skill-tree-canvas');

  // Creature selection
  document.getElementById('creature-select').addEventListener('change', e => {
    selectCreature(parseInt(e.target.value));
  });

  document.getElementById('creature-compare').addEventListener('change', e => {
    const value = e.target.value;
    state.comparisonCreature = value ? state.creatures.find(c => c.id === parseInt(value)) : null;
    drawSkillTree();
  });

  // Comparison mode toggle
  document.getElementById('comparison-mode').addEventListener('change', e => {
    state.comparisonMode = e.target.checked;
    document.querySelector('.comparison-only').style.display = e.target.checked ? 'block' : 'none';
    document.getElementById('comparison-cards').style.display = e.target.checked ? 'flex' : 'none';
    drawSkillTree();
  });

  // Filter checkboxes
  document.querySelectorAll('.filter-checkboxes input[type="checkbox"]').forEach(checkbox => {
    if (!checkbox.classList.contains('mastery-filter')) {
      checkbox.addEventListener('change', e => {
        if (e.target.checked) {
          state.filters.types.push(e.target.value);
        } else {
          state.filters.types = state.filters.types.filter(t => t !== e.target.value);
        }
        drawSkillTree();
      });
    }
  });

  // Mastery filters
  document.querySelectorAll('.mastery-filter').forEach(checkbox => {
    checkbox.addEventListener('change', e => {
      if (e.target.checked) {
        state.filters.mastery.push(e.target.value);
      } else {
        state.filters.mastery = state.filters.mastery.filter(m => m !== e.target.value);
      }
      drawSkillTree();
    });
  });

  // Search
  const searchInput = document.getElementById('skill-search');
  const searchResults = document.getElementById('search-results');

  searchInput.addEventListener('input', e => {
    const query = e.target.value.toLowerCase().trim();
    if (query.length < 2) {
      searchResults.classList.remove('active');
      return;
    }

    const results = findSkillsInAllCreatures(query);
    displaySearchResults(results);
  });

  searchInput.addEventListener('blur', () => {
    setTimeout(() => searchResults.classList.remove('active'), 200);
  });

  // Zoom slider
  const zoomSlider = document.getElementById('zoom-slider');
  const zoomValue = document.getElementById('zoom-value');

  zoomSlider.addEventListener('input', e => {
    state.zoom = parseFloat(e.target.value);
    zoomValue.textContent = `${Math.round(state.zoom * 100)}%`;
    drawSkillTree();
  });

  // Action buttons
  document.getElementById('reset-view').addEventListener('click', resetView);
  document.getElementById('export-image').addEventListener('click', exportImage);
  document.getElementById('zoom-in').addEventListener('click', () => adjustZoom(0.1));
  document.getElementById('zoom-out').addEventListener('click', () => adjustZoom(-0.1));
  document.getElementById('fit-view').addEventListener('click', fitToView);

  // Canvas mouse events
  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('mouseleave', handleMouseLeave);
  canvas.addEventListener('wheel', handleWheel);
  canvas.addEventListener('click', handleClick);

  // Touch events for mobile
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
  canvas.addEventListener('touchend', handleTouchEnd);

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboard);
}

// ============================================
// Creature Selection
// ============================================

function selectCreature(creatureId) {
  state.selectedCreature = state.creatures.find(c => c.id === creatureId);
  if (state.selectedCreature) {
    generateSkillTree(state.selectedCreature);
    drawSkillTree();
    updateComparisonCards();
  }
}

function generateSkillTree(creature) {
  if (!creature || !creature.skills) return;

  const canvas = document.getElementById('skill-tree-canvas');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(canvas.width, canvas.height) * 0.3;

  // Create nodes for each skill
  state.skillNodes = creature.skills.map((skill, index) => {
    const angle = (index / creature.skills.length) * Math.PI * 2 - Math.PI / 2;
    const skillType = determineSkillType(skill.name);

    // Add some randomness to make it look more organic
    const radiusVariation = radius + (Math.random() - 0.5) * 50;

    return {
      id: index,
      name: skill.name,
      level: skill.level || 'Adept',
      type: skillType,
      x: centerX + Math.cos(angle) * radiusVariation,
      y: centerY + Math.sin(angle) * radiusVariation,
      originalX: centerX + Math.cos(angle) * radiusVariation,
      originalY: centerY + Math.sin(angle) * radiusVariation,
      angle: angle,
    };
  });

  // Create connections between related skills
  state.skillConnections = [];
  for (let i = 0; i < state.skillNodes.length; i++) {
    for (let j = i + 1; j < state.skillNodes.length; j++) {
      if (areSkillsRelated(state.skillNodes[i], state.skillNodes[j])) {
        state.skillConnections.push({ from: i, to: j });
      }
    }
  }
}

function determineSkillType(skillName) {
  const lowerName = skillName.toLowerCase();

  for (const [type, config] of Object.entries(SKILL_CONFIG)) {
    if (config.keywords.some(keyword => lowerName.includes(keyword))) {
      return type;
    }
  }

  return 'passive'; // default
}

function areSkillsRelated(skill1, skill2) {
  // Skills of the same type are related
  if (skill1.type === skill2.type) return true;

  // Magic skills are related to each other
  const magicTypes = ['destruction', 'alteration', 'restoration', 'conjuration'];
  const isMagic1 = magicTypes.some(t => skill1.name.toLowerCase().includes(t));
  const isMagic2 = magicTypes.some(t => skill2.name.toLowerCase().includes(t));
  if (isMagic1 && isMagic2) return true;

  return false;
}

// ============================================
// Drawing Functions
// ============================================

function drawSkillTree() {
  const canvas = document.getElementById('skill-tree-canvas');
  const ctx = canvas.getContext('2d');

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Save context
  ctx.save();

  // Apply transformations
  ctx.translate(state.pan.x, state.pan.y);
  ctx.scale(state.zoom, state.zoom);

  // Draw background grid
  drawGrid(ctx, canvas);

  if (state.comparisonMode && state.comparisonCreature) {
    drawComparisonView(ctx, canvas);
  } else if (state.selectedCreature) {
    drawSingleCreatureView(ctx, canvas);
  }

  // Restore context
  ctx.restore();
}

function drawGrid(ctx, canvas) {
  const gridSize = 50;
  const offsetX = state.pan.x % (gridSize * state.zoom);
  const offsetY = state.pan.y % (gridSize * state.zoom);

  ctx.strokeStyle = 'rgba(50, 184, 198, 0.1)';
  ctx.lineWidth = 1;

  // Vertical lines
  for (let x = offsetX; x < canvas.width; x += gridSize * state.zoom) {
    ctx.beginPath();
    ctx.moveTo((x - state.pan.x) / state.zoom, 0);
    ctx.lineTo((x - state.pan.x) / state.zoom, canvas.height / state.zoom);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = offsetY; y < canvas.height; y += gridSize * state.zoom) {
    ctx.beginPath();
    ctx.moveTo(0, (y - state.pan.y) / state.zoom);
    ctx.lineTo(canvas.width / state.zoom, (y - state.pan.y) / state.zoom);
    ctx.stroke();
  }
}

function drawSingleCreatureView(ctx, canvas) {
  // Draw connections first (behind nodes)
  drawConnections(ctx);

  // Draw nodes
  state.skillNodes.forEach(node => {
    if (shouldDisplayNode(node)) {
      drawSkillNode(ctx, node);
    }
  });

  // Draw center label
  drawCenterLabel(ctx, canvas, state.selectedCreature);
}

function drawComparisonView(ctx, canvas) {
  const leftCreature = state.selectedCreature;
  const rightCreature = state.comparisonCreature;

  // Generate skill trees for both creatures
  const leftSkills = leftCreature.skills || [];
  const rightSkills = rightCreature.skills || [];

  // Draw split view
  const centerX = canvas.width / 2;

  // Draw divider
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.strokeStyle = 'rgba(50, 184, 198, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX, 0);
  ctx.lineTo(centerX, canvas.height);
  ctx.stroke();
  ctx.restore();

  // Draw left creature skills
  drawCreatureSkills(ctx, leftSkills, centerX / 2, canvas.height / 2, 'left');

  // Draw right creature skills
  drawCreatureSkills(ctx, rightSkills, centerX + centerX / 2, canvas.height / 2, 'right');
}

function drawCreatureSkills(ctx, skills, centerX, centerY, side) {
  const radius = Math.min(centerX, centerY) * 0.6;

  skills.forEach((skill, index) => {
    const angle = (index / skills.length) * Math.PI * 2 - Math.PI / 2;
    const skillType = determineSkillType(skill.name);
    const level = skill.level || 'Adept';

    const node = {
      name: skill.name,
      level: level,
      type: skillType,
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    };

    if (shouldDisplayNode(node)) {
      drawSkillNode(ctx, node, side === 'right' ? 0.7 : 1);
    }
  });
}

function drawConnections(ctx) {
  ctx.strokeStyle = 'rgba(50, 184, 198, 0.3)';
  ctx.lineWidth = 2;

  state.skillConnections.forEach(conn => {
    const from = state.skillNodes[conn.from];
    const to = state.skillNodes[conn.to];

    if (!shouldDisplayNode(from) || !shouldDisplayNode(to)) return;

    // Draw curved connection
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);

    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const perpAngle = angle + Math.PI / 2;
    const curveDistance = 30;

    const cpX = midX + Math.cos(perpAngle) * curveDistance;
    const cpY = midY + Math.sin(perpAngle) * curveDistance;

    ctx.quadraticCurveTo(cpX, cpY, to.x, to.y);
    ctx.stroke();
  });
}

function drawSkillNode(ctx, node, alpha = 1) {
  const config = MASTERY_CONFIG[node.level] || MASTERY_CONFIG['Adept'];
  const skillColor = SKILL_CONFIG[node.type]?.color || '#888';
  const isHovered = state.hoveredNode === node;
  const isSelected = state.selectedNode === node;

  const size = config.size * (isHovered ? 1.2 : 1) * (isSelected ? 1.3 : 1);

  // Draw glow
  if (isHovered || isSelected) {
    const gradient = ctx.createRadialGradient(node.x, node.y, size / 2, node.x, node.y, size * 2);
    gradient.addColorStop(0, `${skillColor}88`);
    gradient.addColorStop(1, `${skillColor}00`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(node.x, node.y, size * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw outer ring (skill type color)
  ctx.fillStyle =
    skillColor +
    Math.floor(alpha * 255)
      .toString(16)
      .padStart(2, '0');
  ctx.beginPath();
  ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
  ctx.fill();

  // Draw inner circle (mastery level)
  ctx.fillStyle =
    config.color +
    Math.floor(alpha * 255)
      .toString(16)
      .padStart(2, '0');
  ctx.beginPath();
  ctx.arc(node.x, node.y, size * 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Draw border
  ctx.strokeStyle = isHovered || isSelected ? '#fff' : 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = isHovered || isSelected ? 3 : 2;
  ctx.beginPath();
  ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
  ctx.stroke();

  // Draw skill icon (text)
  ctx.fillStyle = '#fff';
  ctx.font = `${size * 0.8}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const icon = SKILL_CONFIG[node.type]?.icon || '?';
  ctx.fillText(icon, node.x, node.y);

  // Draw label
  if (isHovered || isSelected || state.zoom > 1.5) {
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    ctx.strokeText(node.name, node.x, node.y + size + 15);
    ctx.fillText(node.name, node.x, node.y + size + 15);
  }
}

function drawCenterLabel(ctx, canvas, creature) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Draw creature name in center
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = 'rgba(50, 184, 198, 0.8)';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.lineWidth = 4;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const text = creature.name;
  ctx.strokeText(text, centerX, centerY);
  ctx.fillText(text, centerX, centerY);

  // Draw race below
  ctx.font = '16px Arial';
  ctx.fillStyle = 'rgba(167, 169, 169, 0.8)';
  ctx.fillText(creature.race, centerX, centerY + 30);

  ctx.restore();
}

function shouldDisplayNode(node) {
  // Check type filter
  if (!state.filters.types.includes(node.type)) return false;

  // Check mastery filter
  if (!state.filters.mastery.includes(node.level)) return false;

  return true;
}

// ============================================
// Mouse/Touch Interaction
// ============================================

function handleMouseDown(e) {
  state.isDragging = true;
  state.lastMouse = { x: e.clientX, y: e.clientY };

  const canvas = e.target;
  canvas.style.cursor = 'grabbing';
}

function handleMouseMove(e) {
  const canvas = e.target;
  const rect = canvas.getBoundingClientRect();
  const mouseX = (e.clientX - rect.left - state.pan.x) / state.zoom;
  const mouseY = (e.clientY - rect.top - state.pan.y) / state.zoom;

  if (state.isDragging) {
    const dx = e.clientX - state.lastMouse.x;
    const dy = e.clientY - state.lastMouse.y;
    state.pan.x += dx;
    state.pan.y += dy;
    state.lastMouse = { x: e.clientX, y: e.clientY };
    drawSkillTree();
  } else {
    // Check for hover
    const hoveredNode = findNodeAtPosition(mouseX, mouseY);
    if (hoveredNode !== state.hoveredNode) {
      state.hoveredNode = hoveredNode;
      drawSkillTree();

      if (hoveredNode) {
        showTooltip(e, hoveredNode);
      } else {
        hideTooltip();
      }
    }
  }
}

function handleMouseUp(e) {
  state.isDragging = false;
  const canvas = e.target;
  canvas.style.cursor = 'grab';
}

function handleMouseLeave() {
  state.isDragging = false;
  state.hoveredNode = null;
  hideTooltip();
  drawSkillTree();
}

function handleWheel(e) {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  adjustZoom(delta);
}

function handleClick(e) {
  const canvas = e.target;
  const rect = canvas.getBoundingClientRect();
  const mouseX = (e.clientX - rect.left - state.pan.x) / state.zoom;
  const mouseY = (e.clientY - rect.top - state.pan.y) / state.zoom;

  const clickedNode = findNodeAtPosition(mouseX, mouseY);
  if (clickedNode) {
    state.selectedNode = clickedNode === state.selectedNode ? null : clickedNode;
    drawSkillTree();
  }
}

function handleTouchStart(e) {
  if (e.touches.length === 1) {
    e.preventDefault();
    const touch = e.touches[0];
    state.isDragging = true;
    state.lastMouse = { x: touch.clientX, y: touch.clientY };
  }
}

function handleTouchMove(e) {
  if (e.touches.length === 1 && state.isDragging) {
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - state.lastMouse.x;
    const dy = touch.clientY - state.lastMouse.y;
    state.pan.x += dx;
    state.pan.y += dy;
    state.lastMouse = { x: touch.clientX, y: touch.clientY };
    drawSkillTree();
  }
}

function handleTouchEnd() {
  state.isDragging = false;
}

function findNodeAtPosition(x, y) {
  for (const node of state.skillNodes) {
    if (!shouldDisplayNode(node)) continue;

    const config = MASTERY_CONFIG[node.level] || MASTERY_CONFIG['Adept'];
    const size = config.size;
    const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);

    if (distance <= size) {
      return node;
    }
  }
  return null;
}

// ============================================
// Keyboard Controls
// ============================================

function handleKeyboard(e) {
  switch (e.key) {
    case ' ':
      e.preventDefault();
      resetView();
      break;
    case '+':
    case '=':
      adjustZoom(0.1);
      break;
    case '-':
    case '_':
      adjustZoom(-0.1);
      break;
    case 'ArrowUp':
      e.preventDefault();
      state.pan.y += 50;
      drawSkillTree();
      break;
    case 'ArrowDown':
      e.preventDefault();
      state.pan.y -= 50;
      drawSkillTree();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      state.pan.x += 50;
      drawSkillTree();
      break;
    case 'ArrowRight':
      e.preventDefault();
      state.pan.x -= 50;
      drawSkillTree();
      break;
    case 'c':
    case 'C':
      document.getElementById('comparison-mode').click();
      break;
    case 'e':
    case 'E':
      exportImage();
      break;
  }
}

// ============================================
// Zoom and View Controls
// ============================================

function adjustZoom(delta) {
  const newZoom = Math.max(0.5, Math.min(3, state.zoom + delta));
  state.zoom = newZoom;

  const slider = document.getElementById('zoom-slider');
  const zoomValue = document.getElementById('zoom-value');
  slider.value = newZoom;
  zoomValue.textContent = `${Math.round(newZoom * 100)}%`;

  drawSkillTree();
}

function resetView() {
  state.zoom = 1;
  state.pan = { x: 0, y: 0 };

  const slider = document.getElementById('zoom-slider');
  const zoomValue = document.getElementById('zoom-value');
  slider.value = 1;
  zoomValue.textContent = '100%';

  drawSkillTree();
}

function fitToView() {
  if (state.skillNodes.length === 0) return;

  // Calculate bounding box
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  state.skillNodes.forEach(node => {
    if (!shouldDisplayNode(node)) return;
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x);
    maxY = Math.max(maxY, node.y);
  });

  const canvas = document.getElementById('skill-tree-canvas');
  const padding = 100;
  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;

  const scaleX = canvas.width / width;
  const scaleY = canvas.height / height;
  const newZoom = Math.min(scaleX, scaleY, 3);

  state.zoom = newZoom;
  state.pan.x = -minX * newZoom + padding * newZoom + (canvas.width - width * newZoom) / 2;
  state.pan.y = -minY * newZoom + padding * newZoom + (canvas.height - height * newZoom) / 2;

  const slider = document.getElementById('zoom-slider');
  const zoomValue = document.getElementById('zoom-value');
  slider.value = newZoom;
  zoomValue.textContent = `${Math.round(newZoom * 100)}%`;

  drawSkillTree();
}

// ============================================
// Tooltip
// ============================================

function showTooltip(e, node) {
  const tooltip = document.getElementById('skill-tooltip');
  const canvas = document.getElementById('skill-tree-canvas');
  const rect = canvas.getBoundingClientRect();

  tooltip.querySelector('.tooltip-title').textContent = node.name;
  tooltip.querySelector('.tooltip-type').textContent =
    `Type: ${node.type.charAt(0).toUpperCase() + node.type.slice(1)}`;
  tooltip.querySelector('.tooltip-level').textContent = `Mastery: ${node.level}`;

  // Find creatures with this skill
  const creaturesWithSkill = state.creatures.filter(
    creature => creature.skills && creature.skills.some(s => s.name === node.name)
  );

  if (creaturesWithSkill.length > 0) {
    const creatureNames = creaturesWithSkill.map(c => c.name).join(', ');
    tooltip.querySelector('.tooltip-creatures').innerHTML =
      `<strong>Found in:</strong> ${creatureNames}`;
  } else {
    tooltip.querySelector('.tooltip-creatures').innerHTML = '';
  }

  // Position tooltip
  const x = e.clientX - rect.left + 15;
  const y = e.clientY - rect.top + 15;

  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
  tooltip.classList.add('visible');
  tooltip.setAttribute('aria-hidden', 'false');
}

function hideTooltip() {
  const tooltip = document.getElementById('skill-tooltip');
  tooltip.classList.remove('visible');
  tooltip.setAttribute('aria-hidden', 'true');
}

// ============================================
// Search
// ============================================

function findSkillsInAllCreatures(query) {
  const results = [];
  const seen = new Set();

  state.creatures.forEach(creature => {
    if (!creature.skills) return;

    creature.skills.forEach(skill => {
      if (skill.name.toLowerCase().includes(query) && !seen.has(skill.name)) {
        seen.add(skill.name);

        const creaturesWithSkill = state.creatures.filter(
          c => c.skills && c.skills.some(s => s.name === skill.name)
        );

        results.push({
          skillName: skill.name,
          creatures: creaturesWithSkill,
        });
      }
    });
  });

  return results;
}

function displaySearchResults(results) {
  const searchResults = document.getElementById('search-results');

  if (results.length === 0) {
    searchResults.innerHTML = '<div class="search-result-item">No skills found</div>';
    searchResults.classList.add('active');
    return;
  }

  searchResults.innerHTML = results
    .map(
      result => `
        <div class="search-result-item" data-skill="${result.skillName}">
            <div class="result-skill-name">${result.skillName}</div>
            <div class="result-creatures">
                ${result.creatures.length} creature${result.creatures.length !== 1 ? 's' : ''}: 
                ${result.creatures
                  .slice(0, 3)
                  .map(c => c.name)
                  .join(', ')}
                ${result.creatures.length > 3 ? '...' : ''}
            </div>
        </div>
    `
    )
    .join('');

  // Add click handlers
  searchResults.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const skillName = item.dataset.skill;
      const creatures = results.find(r => r.skillName === skillName).creatures;

      if (creatures.length > 0) {
        selectCreature(creatures[0].id);

        // Highlight the skill
        const node = state.skillNodes.find(n => n.name === skillName);
        if (node) {
          state.selectedNode = node;

          // Pan to the node
          const canvas = document.getElementById('skill-tree-canvas');
          state.pan.x = canvas.width / 2 - node.x * state.zoom;
          state.pan.y = canvas.height / 2 - node.y * state.zoom;

          drawSkillTree();
        }
      }

      searchResults.classList.remove('active');
    });
  });

  searchResults.classList.add('active');
}

// ============================================
// Comparison Mode
// ============================================

function updateComparisonCards() {
  if (!state.comparisonMode || !state.comparisonCreature) return;

  const primaryCard = document.getElementById('card-primary');
  const secondaryCard = document.getElementById('card-secondary');

  updateCard(primaryCard, state.selectedCreature);
  updateCard(secondaryCard, state.comparisonCreature);
}

function updateCard(card, creature) {
  if (!creature) return;

  card.querySelector('.card-title').textContent = creature.name;

  const skills = creature.skills || [];
  const skillsByType = {};

  skills.forEach(skill => {
    const type = determineSkillType(skill.name);
    if (!skillsByType[type]) skillsByType[type] = [];
    skillsByType[type].push(skill);
  });

  const statsHTML = Object.entries(skillsByType)
    .map(
      ([type, skills]) => `
        <div style="margin-bottom: 0.5rem;">
            <strong style="color: ${SKILL_CONFIG[type].color}">
                ${type.charAt(0).toUpperCase() + type.slice(1)}:
            </strong> 
            ${skills.length}
        </div>
    `
    )
    .join('');

  card.querySelector('.card-stats').innerHTML = statsHTML;
}

// ============================================
// Export
// ============================================

function exportImage() {
  const canvas = document.getElementById('skill-tree-canvas');

  try {
    // Create a temporary canvas with white background
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    // Fill white background
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw the skill tree on top
    tempCtx.drawImage(canvas, 0, 0);

    // Export
    const dataURL = tempCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `skill-tree-${state.selectedCreature?.name || 'export'}-${Date.now()}.png`;
    link.href = dataURL;
    link.click();

    showNotification('Image exported successfully!');
  } catch (error) {
    console.error('Export failed:', error);
    showError('Failed to export image');
  }
}

// ============================================
// UI Helpers
// ============================================

function hideLoading() {
  const loading = document.getElementById('loading-indicator');
  if (loading) loading.style.display = 'none';
}

function showError(message) {
  console.error(message);
  alert(message); // Simple error display
}

function showNotification(message) {
  // Simple notification
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(50, 184, 198, 0.9);
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 10000;
        animation: fadeInOut 3s ease;
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    document.body.removeChild(notification);
  }, 3000);
}

// Add CSS animation for notification
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0%, 100% { opacity: 0; transform: translateX(-50%) translateY(20px); }
        10%, 90% { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
`;
document.head.appendChild(style);
