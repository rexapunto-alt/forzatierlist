document.addEventListener('DOMContentLoaded', () => {

    const TIER_POINTS = {
        'LT5': 1, 'HT5': 2,
        'LT4': 3, 'HT4': 4,
        'LT3': 6, 'HT3': 10,
        'LT2': 20, 'HT2': 30,
        'LT1': 45, 'HT1': 60
    };

    const TIER_COLORS = {
        'HT1': { text: '#ebd05a', border: '#70622d' }, // Derived from LT1 based on user input
        'LT1': { text: '#d5a93c', border: '#584c25' },
        'HT2': { text: '#bed3e7', border: '#5e6979' },
        'LT2': { text: '#a0a7b2', border: '#5e6979' },
        'HT3': { text: '#f39c5a', border: '#6b4b36' },
        'LT3': { text: '#c67b42', border: '#593722' },
        'HT4': { text: '#81749a', border: '#303144' },
        'LT4': { text: '#655b79', border: '#2c2e40' },
        'HT5': { text: '#8282a8', border: '#2b2c3d' },
        'LT5': { text: '#655b79', border: '#262a3a' }
    };

    const KITS = [
        { id: 'nethpot', name: 'Nethpot', icon: '/images/nethpot.png' },
        { id: 'axe', name: 'Axe', icon: '/images/axe.png' },
        { id: 'beast', name: 'Beast', icon: '/images/beast.png' },
        { id: 'diapot', name: 'Diapot', icon: '/images/diapot.png' },
        { id: 'ogv', name: 'OGV', icon: '/images/gapple.png' },
        { id: 'mace', name: 'Mace', icon: '/images/mace.png' },
        { id: 'smp', name: 'SMP', icon: '/images/smp.png' },
        { id: 'uhc', name: 'UHC', icon: '/images/uhc.png' },
        { id: 'crystal', name: 'Crystal', icon: '/images/vanilla.png' }
    ];

    const REGIONS = ['TR', 'EU'];
    const F_REGIONS = { 'TR': 'Turkey', 'EU': 'Europe' };
    const BASE_NAMES = ['janevkv', 'BlvckWlf', 'Swight', 'coldified', 'Marlowww', 'ItzRealMe', 'YungSimsek', 'Merrypenguin', 'YungExple', 'BetterOffSad', 'K1ngmichi', 'Wzduuh', 'Mo0a_', 'DontrunLOL', 'LilZayy_', 'FlameFragse', 'Pennyywisee_', 'NotDevJawa', 'Swagnesss', 'MeowKimmy'];
    const TIERS_ARRAY = Object.keys(TIER_POINTS);

    let players = [];

    // Load players from file
    fetch('/player.json')
        .then(res => res.json())
        .then(data => {
            const playerList = Array.isArray(data) ? data : (data.players || []);
            players = playerList.map((p, idx) => {
                let totalPoints = 0;
                if (p.tiers) {
                    for (const kit in p.tiers) {
                        const tr = p.tiers[kit];
                        if (TIER_POINTS[tr]) totalPoints += TIER_POINTS[tr];
                    }
                }
                return {
                    id: idx,
                    name: p.name,
                    region: p.region || 'EU',
                    points: totalPoints,
                    tiers: p.tiers || {},
                    skin: `https://mc-heads.net/avatar/${p.name}/100` 
                };
            });

            // Sort players by points globally
            players.sort((a, b) => b.points - a.points);
            // Assign Global Rank
            players.forEach((p, idx) => p.globalRank = idx + 1);

            // Initial render
            renderOverall();
        })
        .catch(err => console.error('Error loading players:', err));

    function getSubtitle(points) {
        if(points >= 400) return 'Combat Grandmaster';
        if(points >= 280) return 'Combat Master';
        if(points >= 200) return 'Combat Ace';
        if(points >= 100) return 'Combat Veteran';
        return 'Combat Fighter';
    }

    // Render Modes Navbar
    const modesNavbar = document.getElementById('modes-navbar');
    
    // 1. Render Overall Tab
    let overallTab = document.createElement('button');
    overallTab.className = 'mode-tab active';
    overallTab.innerHTML = `<i class="fa-solid fa-trophy"></i><span>Overall</span>`;
    overallTab.onclick = () => switchView('overall', overallTab);
    modesNavbar.appendChild(overallTab);

    // 2. Render Kit Tabs
    KITS.forEach(kit => {
        let kitTab = document.createElement('button');
        kitTab.className = 'mode-tab';
        kitTab.innerHTML = `<img src="${kit.icon}" alt="${kit.name}"><span>${kit.name}</span>`;
        kitTab.onclick = () => switchView(kit.id, kitTab);
        modesNavbar.appendChild(kitTab);
    });

    // View Switching
    const overallView = document.getElementById('overall-view');
    const kitView = document.getElementById('kit-view');

    function switchView(viewId, clickedTab) {
        // Update tabs active state
        document.querySelectorAll('.mode-tab').forEach(tab => tab.classList.remove('active'));
        clickedTab.classList.add('active');

        if (viewId === 'overall') {
            overallView.style.display = 'block';
            kitView.style.display = 'none';
            renderOverall();
        } else {
            overallView.style.display = 'none';
            kitView.style.display = 'block';
            renderKitView(viewId);
        }
    }

    // Render Overall
    const overallList = document.getElementById('overall-list');
    function renderOverall() {
        overallList.innerHTML = '';
        players.forEach(p => {
            const row = document.createElement('div');
            row.className = `o-row rank-${p.globalRank}`;
            row.onclick = () => window.openProfile(p);
            
            let tiersHtml = '';
            KITS.forEach(kitObj => {
                if(p.tiers[kitObj.id]) {
                    const tier = p.tiers[kitObj.id];
                    const colors = TIER_COLORS[tier] || { text: '#fff', border: '#fff' };
                    tiersHtml += `
                        <div class="tier-item">
                            <div class="t-icon-ring">
                                <img src="${kitObj.icon}" alt="${kitObj.id}">
                            </div>
                            <span class="tier-badge" style="color: ${colors.text}">${tier}</span>
                        </div>
                    `;
                }
            });

            row.innerHTML = `
                <div class="o-rank-box"><span class="o-rank">${p.globalRank}.</span></div>
                <div class="o-player">
                    <img class="o-avatar" src="${p.skin}" alt="">
                    <div class="o-name-box">
                        <span class="o-name">${p.name}</span>
                        <span class="o-subtitle"><i class="fa-solid fa-gem"></i> ${getSubtitle(p.points)} (${p.points} points)</span>
                    </div>
                </div>
                <div class="o-region">
                    <span class="region-badge region-${p.region}">${p.region}</span>
                </div>
                <div class="o-tiers">
                    <div class="tiers-container">
                        ${tiersHtml}
                    </div>
                </div>
            `;
            overallList.appendChild(row);
        });
    }

    // Render Kit Columns
    const tierColumnsCtn = document.getElementById('tier-columns');
    function renderKitView(kitId) {
        tierColumnsCtn.innerHTML = '';
        
        // Map elements into Tier 1(HT1,LT1), Tier2(HT2,LT2)...
        const tierGroups = {
            1: { tiers: ['HT1', 'LT1'], players: [] },
            2: { tiers: ['HT2', 'LT2'], players: [] },
            3: { tiers: ['HT3', 'LT3'], players: [] },
            4: { tiers: ['HT4', 'LT4'], players: [] },
            5: { tiers: ['HT5', 'LT5'], players: [] }
        };

        // Filter players that have this kit 
        players.forEach(p => {
            if (p.tiers[kitId]) {
                const tInfo = p.tiers[kitId];
                // Check which group it belongs to
                for (let i = 1; i <= 5; i++) {
                    if (tierGroups[i].tiers.includes(tInfo)) {
                        tierGroups[i].players.push({
                            ...p,
                            myTier: tInfo
                        });
                        break;
                    }
                }
            }
        });

        // Generate 5 columns
        for (let i = 1; i <= 5; i++) {
            const colData = tierGroups[i];

            // Sort internal column players (HT before LT)
            colData.players.sort((a,b) => {
                if(a.myTier.startsWith('HT') && b.myTier.startsWith('LT')) return -1;
                if(a.myTier.startsWith('LT') && b.myTier.startsWith('HT')) return 1;
                return a.name.localeCompare(b.name);
            });

            const colDiv = document.createElement('div');
            colDiv.className = `tier-col col-t${i}`;
            
            let html = `<div class="tier-col-header"><i class="fa-solid fa-trophy"></i> Tier ${i}</div>`;
            html += `<div class="tier-list">`;
            
            colData.players.forEach(p => {
                let isHt = p.myTier.startsWith('HT');
                let chevronHtml = isHt ? 
                    `<i class="fa-solid fa-angles-up chevron-ht"></i>` : 
                    `<i class="fa-solid fa-angle-up chevron-lt"></i>`;

                html += `
                    <div class="tier-list-item" onclick="window.openProfile(${p.id})">
                        <div class="t-player-info">
                            <img src="${p.skin}" alt="">
                            <span class="t-player-name">${p.name}</span>
                        </div>
                        <div class="t-chevron">
                            ${chevronHtml}
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
            colDiv.innerHTML = html;
            tierColumnsCtn.appendChild(colDiv);
        }
    }

    // Modal Logic
    const modal = document.getElementById('profile-modal');
    const btnClose = document.getElementById('close-modal');
    
    btnClose.onclick = () => modal.classList.remove('active');
    
    // Global exposure so inline onclick can see it (from Kit view)
    window.openProfile = (playerId) => {
        let p;
        if (typeof playerId === 'object') p = playerId;
        else p = players.find(x => x.id === parseInt(playerId));

        if (!p) return;

        document.getElementById('modal-skin').src = `https://mc-heads.net/avatar/${p.name}/200`;
        document.getElementById('modal-name').textContent = p.name;
        document.getElementById('modal-subtitle').textContent = getSubtitle(p.points);
        document.getElementById('modal-region').textContent = F_REGIONS[p.region] || p.region;
        
        document.getElementById('modal-namemc').href = `https://namemc.com/search?q=${p.name}`;
        
        document.getElementById('modal-rank').textContent = `${p.globalRank}.`;
        document.getElementById('modal-score').textContent = `(${p.points} points)`;

        const grid = document.getElementById('modal-tiers-grid');
        grid.innerHTML = '';
        
        KITS.forEach(kit => {
            if(p.tiers[kit.id]) {
                const tr = p.tiers[kit.id];
                const colors = TIER_COLORS[tr] || { text: '#fff', border: '#fff' };
                grid.innerHTML += `
                    <div class="tier-item">
                        <div class="t-icon-ring">
                            <img src="${kit.icon}" alt="${kit.id}">
                        </div>
                        <span class="tier-badge" style="color: ${colors.text};">${tr}</span>
                    </div>
                `;
            } else {
                grid.innerHTML += `
                    <div class="tier-item">
                        <div class="t-icon-ring" style="border-style: dashed;">
                        </div>
                        <span class="tier-badge-empty">-</span>
                    </div>
                `;
            }
        });

        modal.classList.add('active');
    };

    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if(e.target === modal) modal.classList.remove('active');
    });

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const term = searchInput.value.trim().toLowerCase();
                if (!term) return;
                
                // Find player case-insensitive
                const foundPlayer = players.find(p => p.name.toLowerCase() === term);
                if (foundPlayer) {
                    window.openProfile(foundPlayer);
                    searchInput.value = ''; // clear on success
                    searchInput.blur();
                } else {
                    alert('Player not found in the database!');
                }
            }
        });
        
        // Listen for '/' hotkey to focus the search bar
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && document.activeElement !== searchInput) {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }

    // Initial render is inside fetch
});
