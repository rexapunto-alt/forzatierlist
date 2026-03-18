// Backend API base URL
const API_BASE_URL = 'http://localhost:3000';

// Tier point system
const TIER_POINTS = {
    'LT5': 1, 'HT5': 2,
    'LT4': 3, 'HT4': 4,
    'LT3': 6, 'HT3': 10,
    'LT2': 20, 'HT2': 30,
    'LT1': 45, 'HT1': 60
};

// Category names
const CATEGORY_NAMES = {
    'nethpot': 'Nethpot',
    'axe': 'Axe',
    'smp': 'SMP',
    'ogv': 'OGV',
    'pot': 'Pot',
    'crystal': 'Crystal',
    'uhc': 'UHC',
    'beast': 'Beast',
    'mace': 'Mace'
};

// Category icons with PNG paths
const CATEGORY_ICONS = {
    'nethpot': 'images/nethpot.png',
    'axe': 'images/axe.png',
    'smp': 'images/smp.png',
    'ogv': 'images/gapple.png',
    'pot': 'images/diapot.png',
    'crystal': 'images/vanilla.png',
    'uhc': 'images/uhc.png',
    'beast': 'images/beast.png',
    'mace': 'images/mace.png'
};

// Category icons (fallback emojis)
const CATEGORY_ICONS_FALLBACK = {
    'nethpot': '⚗️',
    'axe': '🪓',
    'smp': '🟢',
    'ogv': '🍎',
    'pot': '💎',
    'crystal': '⬡',
    'uhc': '❤️',
    'beast': '👹',
    'mace': '🔨'
};

let playersData = [];
let currentCategory = 'overall';

// Load players data
async function loadPlayersData() {
    try {
        console.log('Loading players data from:', `${API_BASE_URL}/api/players`);
        const response = await fetch(`${API_BASE_URL}/api/players`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Raw data:', data);
        
        playersData = data.players || [];
        console.log('Players loaded:', playersData.length);
        console.log('First player:', playersData[0]);
        
        // Update home page and overall
        updateHomePage();
        renderOverallPage();
    } catch (error) {
        console.error('Error loading players data:', error);
    } finally {
        initializeApp();
    }
}

// Calculate total points for a player
function calculatePlayerPoints(player) {
    let points = 0;
    for (const [category, tier] of Object.entries(player.tiers)) {
        if (tier && TIER_POINTS[tier]) {
            points += TIER_POINTS[tier];
        }
    }
    return points;
}

// Update home page (placeholder for future features)
function updateHomePage() {
    // This function can be used for future home page updates
    // Currently, overall page is the main page
    console.log('Home page updated');
}

// Initialize the application
function initializeApp() {
    setupTabs();
    setupSearch();
    showOverallPage();
}

// Show overall page
function showOverallPage() {
    showPage('overall');
    renderOverallPage();
}

// Render overall page
function renderOverallPage() {
    const tbody = document.getElementById('overall-tbody');
    tbody.innerHTML = '';
    
    if (playersData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No players found</td></tr>';
        return;
    }
    
    // Calculate points and sort
    const playersWithPoints = playersData.map(player => ({
        ...player,
        points: calculatePlayerPoints(player)
    })).sort((a, b) => b.points - a.points);
    
    playersWithPoints.forEach((player, index) => {
        const row = document.createElement('tr');
        const rank = index + 1;
        
        // Rank cell
        const rankCell = document.createElement('td');
        rankCell.textContent = `${rank}.`;
        if (rank === 1) {
            rankCell.style.background = 'rgba(255, 215, 0, 0.2)';
            rankCell.style.color = '#FFD700';
            rankCell.style.fontWeight = 'bold';
        }
        row.appendChild(rankCell);
        
        // Player cell
        const playerCell = document.createElement('td');
        const playerDiv = document.createElement('div');
        playerDiv.style.display = 'flex';
        playerDiv.style.alignItems = 'center';
        playerDiv.style.gap = '12px';
        playerDiv.style.cursor = 'pointer';
        playerDiv.addEventListener('click', () => showPlayerProfile(player));
        playerDiv.innerHTML = `
            <img src="${player.avatar}" alt="${player.name}" style="width: 40px; height: 40px; border-radius: 6px;">
            <div>
                <div style="font-weight: 600;">${player.name}</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">
                    ${getRankTitle(player.points)} (${player.points} points)
                </div>
            </div>
        `;
        playerCell.appendChild(playerDiv);
        row.appendChild(playerCell);
        
        // Region cell
        const regionCell = document.createElement('td');
        regionCell.textContent = player.region;
        row.appendChild(regionCell);
        
        // Tiers cell
        const tiersCell = document.createElement('td');
        const tiersDiv = document.createElement('div');
        tiersDiv.style.display = 'flex';
        tiersDiv.style.flexWrap = 'wrap';
        tiersDiv.style.gap = '4px';
        
        Object.entries(player.tiers).forEach(([category, tier]) => {
            if (tier) {
                const tierSpan = document.createElement('span');
                tierSpan.style.cssText = `
                    background: rgba(255, 255, 255, 0.1);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    display: flex;
                    align-items: center;
                    gap: 3px;
                `;
                
                // Create icon with PNG and fallback
                const iconImg = document.createElement('img');
                iconImg.src = CATEGORY_ICONS[category];
                iconImg.alt = CATEGORY_NAMES[category];
                iconImg.style.width = '12px';
                iconImg.style.height = '12px';
                iconImg.style.objectFit = 'contain';
                iconImg.onerror = function() {
                    // Replace with emoji fallback if image fails
                    const emojiSpan = document.createElement('span');
                    emojiSpan.textContent = CATEGORY_ICONS_FALLBACK[category];
                    emojiSpan.style.fontSize = '0.75rem';
                    this.parentNode.replaceChild(emojiSpan, this);
                };
                
                tierSpan.appendChild(iconImg);
                tierSpan.innerHTML += tier;
                tiersDiv.appendChild(tierSpan);
            }
        });
        
        tiersCell.appendChild(tiersDiv);
        row.appendChild(tiersCell);
        
        // Points cell
        const pointsCell = document.createElement('td');
        pointsCell.style.fontWeight = 'bold';
        pointsCell.textContent = player.points;
        row.appendChild(pointsCell);
        
        tbody.appendChild(row);
    });
}

// Get rank title based on points
function getRankTitle(points) {
    if (points >= 200) return '👑 Legend';
    if (points >= 150) return '🔥 Master';
    if (points >= 100) return '💎 Diamond';
    if (points >= 50) return '🥇 Gold';
    if (points >= 25) return '🥈 Silver';
    return '🥉 Bronze';
}

// Setup tabs
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.category;
            switchCategory(category);
        });
    });
}

// Switch category
function switchCategory(category) {
    currentCategory = category;
    
    // Update active tab
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // Show appropriate content
    if (category === 'overall') {
        showOverallPage();
    } else {
        showCategoryPage(category);
    }
}

// Show category page
function showCategoryPage(category) {
    showPage('category');
    renderCategoryPage(category);
}

// Render category page
function renderCategoryPage(category) {
    const container = document.getElementById('tier-container');
    container.innerHTML = '';
    
    const categoryPlayers = playersData.filter(player => 
        player.tiers && player.tiers[category]
    );
    
    if (categoryPlayers.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">${CATEGORY_ICONS_FALLBACK[category]}</div>
                <h3>${CATEGORY_NAMES[category]}</h3>
                <p>Bu kategoride henüz oyuncu bulunmuyor.</p>
            </div>
        `;
        return;
    }
    
    // Group players by tier level (1-5)
    const tierLevels = {};
    for (let tierNum = 1; tierNum <= 5; tierNum++) {
        const htTier = `HT${tierNum}`;
        const ltTier = `LT${tierNum}`;
        
        const htPlayers = categoryPlayers.filter(player => 
            player.tiers[category] === htTier
        );
        const ltPlayers = categoryPlayers.filter(player => 
            player.tiers[category] === ltTier
        );
        
        const allTierPlayers = [...htPlayers, ...ltPlayers];
        
        // Add all tier levels (1-5), even if empty
        tierLevels[tierNum] = {
            htPlayers,
            ltPlayers,
            allTierPlayers
        };
    }
    
    // Sort tier levels (lowest first: Tier 1, Tier 2, Tier 3, Tier 4, Tier 5)
    const sortedTierLevels = Object.keys(tierLevels).sort((a, b) => a - b);
    
    // Create tier sections for all tiers (1-5)
    sortedTierLevels.forEach(tierNum => {
        const { htPlayers, ltPlayers, allTierPlayers } = tierLevels[tierNum];
        const tierSection = document.createElement('div');
        tierSection.className = `tier-section tier-${tierNum}`;
        
        // Create tier header
        const tierHeader = document.createElement('div');
        tierHeader.className = 'tier-header';
        tierHeader.innerHTML = `
            <h3>TIER ${tierNum}</h3>
            <span>${allTierPlayers.length} oyuncu</span>
        `;
        tierSection.appendChild(tierHeader);
        
        if (allTierPlayers.length === 0) {
            // Show empty state for this tier
            const emptyDiv = document.createElement('div');
            emptyDiv.style.cssText = `
                text-align: center;
                padding: 3rem 2rem;
                color: var(--text-secondary);
                opacity: 0.6;
                font-style: italic;
                font-size: 0.95rem;
            `;
            emptyDiv.textContent = 'Bu tier\'da oyuncu bulunmuyor';
            tierSection.appendChild(emptyDiv);
        } else {
            // Create HT and LT subsections
            if (htPlayers.length > 0) {
                const htSection = document.createElement('div');
                
                const htGrid = document.createElement('div');
                htGrid.className = 'players-grid';
                
                htPlayers.forEach(player => {
                    const playerCard = createPlayerCard(player, false, category);
                    htGrid.appendChild(playerCard);
                });
                
                htSection.appendChild(htGrid);
                tierSection.appendChild(htSection);
            }
            
            if (ltPlayers.length > 0) {
                const ltSection = document.createElement('div');
                
                const ltGrid = document.createElement('div');
                ltGrid.className = 'players-grid';
                
                ltPlayers.forEach(player => {
                    const playerCard = createPlayerCard(player, false, category);
                    ltGrid.appendChild(playerCard);
                });
                
                ltSection.appendChild(ltGrid);
                tierSection.appendChild(ltSection);
            }
        }
        
        container.appendChild(tierSection);
    });
}

// Create player card
function createPlayerCard(player, showRegion = true, category = null) {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.addEventListener('click', () => showPlayerProfile(player));
    
    const regionHtml = showRegion ? `<div class="player-card-region">${player.region}</div>` : '';
    
    card.innerHTML = `
        <img src="${player.avatar}" alt="${player.name}">
        <div class="player-card-info">
            <div class="player-card-name">${player.name}</div>
            ${regionHtml}
        </div>
    `;
    
    return card;
}

// Show player profile
function showPlayerProfile(player) {
    const overlay = document.getElementById('profileOverlay');
    const container = document.getElementById('profileContainer');
    
    // Update profile content
    document.getElementById('profileAvatar').src = player.avatar;
    document.getElementById('profileUsername').textContent = player.name;
    document.getElementById('profileRegion').textContent = player.region;
    
    // Calculate points and rank
    const points = calculatePlayerPoints(player);
    const rank = playersData
        .map(p => ({ ...p, points: calculatePlayerPoints(p) }))
        .sort((a, b) => b.points - a.points)
        .findIndex(p => p.name === player.name) + 1;
    
    document.getElementById('profileRank').textContent = `Rank #${rank}`;
    document.getElementById('positionBar').textContent = `#${rank} / ${playersData.length}`;
    
    // Update tiers grid
    const tiersGrid = document.getElementById('tiersGrid');
    tiersGrid.innerHTML = '';
    
    Object.entries(CATEGORY_NAMES).forEach(([category, name]) => {
        const tier = player.tiers[category] || '-';
        
        // Create tier item with proper structure
        const tierItem = document.createElement('div');
        tierItem.className = 'tier-item';
        
        // Add HT or LT class if tier exists
        if (tier !== '-') {
            if (tier.startsWith('HT')) {
                tierItem.classList.add('ht');
            } else if (tier.startsWith('LT')) {
                tierItem.classList.add('lt');
            }
        }
        
        // Create icon with PNG and fallback
        const iconImg = document.createElement('img');
        iconImg.src = CATEGORY_ICONS[category];
        iconImg.alt = name;
        iconImg.onerror = function() {
            // Replace with emoji fallback if image fails
            const emojiSpan = document.createElement('span');
            emojiSpan.textContent = CATEGORY_ICONS_FALLBACK[category];
            emojiSpan.style.fontSize = '1.5rem';
            emojiSpan.style.width = '40px';
            emojiSpan.style.height = '40px';
            emojiSpan.style.display = 'flex';
            emojiSpan.style.alignItems = 'center';
            emojiSpan.style.justifyContent = 'center';
            this.parentNode.replaceChild(emojiSpan, this);
        };
        
        // Create tier info
        const tierInfo = document.createElement('span');
        tierInfo.innerHTML = `
            <div style="font-size: 0.85rem; opacity: 0.8;">${name}</div>
            <div style="font-weight: 600;">${tier}</div>
        `;
        
        tierItem.appendChild(iconImg);
        tierItem.appendChild(tierInfo);
        tiersGrid.appendChild(tierItem);
    });
    
    // Update NameMC link
    const namemcLink = document.getElementById('namemcLink');
    namemcLink.href = `https://namemc.com/profile/${player.name}`;
    
    // Show modal
    overlay.style.display = 'block';
    container.style.display = 'block';
}

// Setup search
function setupSearch() {
    const searchBar = document.getElementById('searchBar');
    if (!searchBar) return;
    
    searchBar.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query === '') {
            if (currentCategory === 'overall') {
                renderOverallPage();
            } else {
                renderCategoryPage(currentCategory);
            }
            return;
        }
        
        // Filter players
        const filteredPlayers = playersData.filter(player => 
            player.name.toLowerCase().includes(query)
        );
        
        if (currentCategory === 'overall') {
            renderFilteredOverall(filteredPlayers);
        } else {
            renderFilteredCategory(filteredPlayers, currentCategory);
        }
    });
}

// Render filtered overall page
function renderFilteredOverall(filteredPlayers) {
    const tbody = document.getElementById('overall-tbody');
    tbody.innerHTML = '';
    
    if (filteredPlayers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    Arama kriterinize uygun oyuncu bulunamadı.
                </td>
            </tr>
        `;
        return;
    }
    
    // Calculate points and sort
    const playersWithPoints = filteredPlayers.map(player => ({
        ...player,
        points: calculatePlayerPoints(player)
    })).sort((a, b) => b.points - a.points);
    
    // Render rows
    playersWithPoints.forEach((player, index) => {
        const row = document.createElement('tr');
        const rank = index + 1;
        
        const rankCell = document.createElement('td');
        rankCell.textContent = `${rank}.`;
        row.appendChild(rankCell);
        
        const playerCell = document.createElement('td');
        playerCell.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${player.avatar}" alt="${player.name}" style="width: 40px; height: 40px; border-radius: 6px;">
                <div>
                    <div style="font-weight: 600;">${player.name}</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">
                        ${getRankTitle(player.points)} (${player.points} points)
                    </div>
                </div>
            </div>
        `;
        row.appendChild(playerCell);
        
        const regionCell = document.createElement('td');
        regionCell.textContent = player.region;
        row.appendChild(regionCell);
        
        const tiersCell = document.createElement('td');
        const tiersDiv = document.createElement('div');
        tiersDiv.style.display = 'flex';
        tiersDiv.style.flexWrap = 'wrap';
        tiersDiv.style.gap = '4px';
        
        Object.entries(player.tiers).forEach(([category, tier]) => {
            if (tier) {
                const tierSpan = document.createElement('span');
                tierSpan.style.cssText = `
                    background: rgba(255, 255, 255, 0.1);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    display: flex;
                    align-items: center;
                    gap: 3px;
                `;
                
                // Create icon with PNG and fallback
                const iconImg = document.createElement('img');
                iconImg.src = CATEGORY_ICONS[category];
                iconImg.alt = CATEGORY_NAMES[category];
                iconImg.style.width = '12px';
                iconImg.style.height = '12px';
                iconImg.style.objectFit = 'contain';
                iconImg.onerror = function() {
                    // Replace with emoji fallback if image fails
                    const emojiSpan = document.createElement('span');
                    emojiSpan.textContent = CATEGORY_ICONS_FALLBACK[category];
                    emojiSpan.style.fontSize = '0.75rem';
                    this.parentNode.replaceChild(emojiSpan, this);
                };
                
                tierSpan.appendChild(iconImg);
                tierSpan.innerHTML += tier;
                tiersDiv.appendChild(tierSpan);
            }
        });
        
        tiersCell.appendChild(tiersDiv);
        row.appendChild(tiersCell);
        
        const pointsCell = document.createElement('td');
        pointsCell.style.fontWeight = 'bold';
        pointsCell.textContent = player.points;
        row.appendChild(pointsCell);
        
        tbody.appendChild(row);
    });
}

// Render filtered category page
function renderFilteredCategory(filteredPlayers, category) {
    const container = document.getElementById('tier-container');
    container.innerHTML = '';
    
    const categoryPlayers = filteredPlayers.filter(player => 
        player.tiers && player.tiers[category]
    );
    
    if (categoryPlayers.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                <p>Bu kategoride arama kriterinize uygun oyuncu bulunamadı.</p>
            </div>
        `;
        return;
    }
    
    // Group players by tier level (1-5) - same logic as renderCategoryPage
    const tierLevels = {};
    for (let tierNum = 1; tierNum <= 5; tierNum++) {
        const htTier = `HT${tierNum}`;
        const ltTier = `LT${tierNum}`;
        
        const htPlayers = categoryPlayers.filter(player => 
            player.tiers[category] === htTier
        );
        const ltPlayers = categoryPlayers.filter(player => 
            player.tiers[category] === ltTier
        );
        
        const allTierPlayers = [...htPlayers, ...ltPlayers];
        
        // Add all tier levels (1-5), even if empty
        tierLevels[tierNum] = {
            htPlayers,
            ltPlayers,
            allTierPlayers
        };
    }
    
    // Sort tier levels (lowest first: Tier 1, Tier 2, Tier 3, Tier 4, Tier 5)
    const sortedTierLevels = Object.keys(tierLevels).sort((a, b) => a - b);
    
    // Create tier sections for all tiers (1-5)
    sortedTierLevels.forEach(tierNum => {
        const { htPlayers, ltPlayers, allTierPlayers } = tierLevels[tierNum];
        const tierSection = document.createElement('div');
        tierSection.className = `tier-section tier-${tierNum}`;
        
        // Create tier header
        const tierHeader = document.createElement('div');
        tierHeader.className = 'tier-header';
        tierHeader.innerHTML = `
            <h3>TIER ${tierNum}</h3>
            <span>${allTierPlayers.length} oyuncu</span>
        `;
        tierSection.appendChild(tierHeader);
        
        if (allTierPlayers.length === 0) {
            // Show empty state for this tier
            const emptyDiv = document.createElement('div');
            emptyDiv.style.cssText = `
                text-align: center;
                padding: 3rem 2rem;
                color: var(--text-secondary);
                opacity: 0.6;
                font-style: italic;
                font-size: 0.95rem;
            `;
            emptyDiv.textContent = 'Bu tier\'da oyuncu bulunmuyor';
            tierSection.appendChild(emptyDiv);
        } else {
            // Create LT subsection
            if (ltPlayers.length > 0) {
                const ltSection = document.createElement('div');
                
                const ltGrid = document.createElement('div');
                ltGrid.className = 'players-grid';
                
                ltPlayers.forEach(player => {
                    const playerCard = createPlayerCard(player, false, category);
                    ltGrid.appendChild(playerCard);
                });
                
                ltSection.appendChild(ltGrid);
                tierSection.appendChild(ltSection);
            }
        }
        
        container.appendChild(tierSection);
    });
}

// Show page
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

// Close profile modal
document.getElementById('closeProfile')?.addEventListener('click', () => {
    document.getElementById('profileOverlay').style.display = 'none';
    document.getElementById('profileContainer').style.display = 'none';
});

document.getElementById('profileOverlay')?.addEventListener('click', () => {
    document.getElementById('profileOverlay').style.display = 'none';
    document.getElementById('profileContainer').style.display = 'none';
});

// Load data when page loads
loadPlayersData();
