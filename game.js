const auras = [
    { name: "Common Aura", rarity: "common", chance: 50, color: "#d9d9d9" },
    { name: "Uncommon Aura", rarity: "uncommon", chance: 30, color: "#c6e2ff" },
    { name: "Rare Aura", rarity: "rare", chance: 15, color: "#ffd700" },
    { name: "Legendary Aura", rarity: "legendary", chance: 5, color: "#ff4500" }
];

let level = JSON.parse(localStorage.getItem('level')) || 1;
let experience = JSON.parse(localStorage.getItem('experience')) || 0;
let streak = JSON.parse(localStorage.getItem('streak')) || 0;
const xpPerLevel = 100;
let autoSpinInterval = null;
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let appliedAura = JSON.parse(localStorage.getItem('appliedAura')) || null;
let lastSpin = localStorage.getItem('lastSpin') || 0;

const spinButton = document.getElementById('spinButton');
const autoSpinButton = document.getElementById('autoSpinButton');
const inventoryButton = document.getElementById('inventoryButton');
const inventoryContainer = document.getElementById('inventoryContainer');
const character = document.getElementById('character');
const spinWheel = document.getElementById('spinWheel');
const levelDisplay = document.getElementById('level');
const streakDisplay = document.getElementById('streak');
const xpBar = document.getElementById('xpBar');
const leaderboardContainer = document.getElementById('leaderboard');
 

function spin() {
    if (Date.now() - lastSpin < 86400000 && streak === 0) {
        alert('You can only spin once every 24 hours!');
        return;
    }

    soundEffect.play();
    spinWheel.style.animation = 'spin 2s ease-out';
    
    setTimeout(() => {
        spinWheel.style.animation = 'none';

        const random = Math.random() * 100;
        let cumulativeChance = 0;

        for (const aura of auras) {
            cumulativeChance += aura.chance;
            if (random <= cumulativeChance) {
                addToInventory(aura);
                displayAura(aura);
                addXP(20);
                break;
            }
        }
        lastSpin = Date.now();
        localStorage.setItem('lastSpin', lastSpin);
    }, 2000);
}

function toggleAutoSpin() {
    if (autoSpinInterval) {
        clearInterval(autoSpinInterval);
        autoSpinInterval = null;
        autoSpinButton.textContent = "Auto Spin";
    } else {
        autoSpinInterval = setInterval(spin, 3000);
        autoSpinButton.textContent = "Stop Auto Spin";
    }
}

function toggleInventory() {
    inventoryContainer.style.display = inventoryContainer.style.display === 'none' ? 'block' : 'none';
}

function addToInventory(aura) {
    const auraElement = document.createElement('div');
    auraElement.classList.add('aura', aura.rarity);
    auraElement.textContent = aura.name;
    auraElement.addEventListener('click', () => applyAura(aura));
    inventoryContainer.appendChild(auraElement);
    inventory.push(aura);
    localStorage.setItem('inventory', JSON.stringify(inventory));
}

function applyAura(aura) {
    character.querySelector('.head').style.backgroundColor = aura.color;
    character.querySelector('.body').style.backgroundColor = aura.color;
    appliedAura = aura;
    localStorage.setItem('appliedAura', JSON.stringify(appliedAura));
}

function addXP(xp) {
    experience += xp;
    if (experience >= xpPerLevel) {
        level++;
        experience = experience % xpPerLevel;
        alert("Level Up!");
        updateLeaderboard();
    }
    updateUI();
}

function updateUI() {
    levelDisplay.textContent = `Level: ${level}`;
    xpBar.style.width = `${(experience / xpPerLevel) * 100}%`;
    streakDisplay.textContent = `Streak: ${streak}`;
}

function updateLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ name: 'Player', level });
    leaderboard.sort((a, b) => b.level - a.level);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    renderLeaderboard();
}

function renderLeaderboard() {
    leaderboardContainer.innerHTML = '';
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.classList.add('leaderboard-entry');
        entryDiv.innerHTML = `<span>${entry.name}</span><span>Level: ${entry.level}</span>`;
        leaderboardContainer.appendChild(entryDiv);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderLeaderboard();
    updateUI();
    inventory.forEach(aura => addToInventory(aura));
    if (appliedAura) applyAura(appliedAura);
});

spinButton.addEventListener('click', spin);
autoSpinButton.addEventListener('click', toggleAutoSpin);
inventoryButton.addEventListener('click', toggleInventory);
