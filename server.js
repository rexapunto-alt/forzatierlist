const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

// Config dosyasını oku
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

const app = express();
const PORT = process.env.PORT || config.server.port;

// CORS ayarları
const corsOptions = {
  origin: config.server.cors.origin,
  credentials: config.server.cors.credentials
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Admin login deneme limiti (IP bazlı)
const MAX_LOGIN_ATTEMPTS = config.admin.maxLoginAttempts;
const LOCK_TIME_MS = config.admin.lockTimeMs; // 5 dakika

// IP -> { attempts: number, lockedUntil: timestamp }
const loginAttempts = new Map();

// JSON dosya yolu
const PLAYERS_FILE = path.join(__dirname, config.database.playersFile);

// Discord webhook URL (isteğe bağlı)
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || null;

// Yardımcı: players.json oku
function readPlayersFile() {
    try {
        const raw = fs.readFileSync(PLAYERS_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (err) {
        return { players: [] };
    }
}

// Yardımcı: players.json yaz
function writePlayersFile(data) {
    fs.writeFileSync(PLAYERS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Discord bildirim gönder
async function sendDiscordNotification(type, player) {
    if (!DISCORD_WEBHOOK_URL) return;
    
    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: type,
                player: player
            })
        });
    } catch (error) {
        console.log('Discord notification failed:', error.message);
    }
}

// Admin login
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (!password) {
        return res.status(400).json({ success: false, message: 'Şifre gerekli' });
    }

    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    let state = loginAttempts.get(ip) || { attempts: 0, lockedUntil: 0 };

    // Kilit kontrolü
    if (state.lockedUntil && now < state.lockedUntil) {
        const remainingMs = state.lockedUntil - now;
        const remainingSec = Math.ceil(remainingMs / 1000);
        return res.status(429).json({
            success: false,
            message: `Çok fazla hatalı deneme yaptınız. Lütfen ${remainingSec} saniye sonra tekrar deneyin.`
        });
    }

    if (password === config.admin.password) {
        // Başarılı giriş: sayaç sıfırla
        loginAttempts.delete(ip);
        return res.json({ success: true });
    }

    // Hatalı şifre: deneme sayısını artır
    state.attempts += 1;

    if (state.attempts >= MAX_LOGIN_ATTEMPTS) {
        state.lockedUntil = now + LOCK_TIME_MS;
        loginAttempts.set(ip, state);
        return res.status(429).json({
            success: false,
            message: '3 kez hatalı şifre girdiniz. Lütfen 5 dakika sonra tekrar deneyin.'
        });
    }

    loginAttempts.set(ip, state);

    const remaining = MAX_LOGIN_ATTEMPTS - state.attempts;
    return res.status(401).json({
        success: false,
        message: `Hatalı şifre! Kalan deneme hakkı: ${remaining}`
    });
});

// Oyuncu listesini al
app.get('/api/players', (req, res) => {
    const data = readPlayersFile();
    res.json(data);
});

// Oyuncu ekle
app.post('/api/players', (req, res) => {
    const { name, region, avatar, tiers } = req.body;

    if (!name || !region) {
        return res.status(400).json({ success: false, message: 'İsim ve bölge zorunlu' });
    }

    const data = readPlayersFile();

    if (data.players.find(p => p.name.toLowerCase() === name.toLowerCase())) {
        return res.status(409).json({ success: false, message: 'Bu oyuncu zaten var' });
    }

    const newPlayer = { name, region, avatar, tiers: tiers || {} };
    data.players.push(newPlayer);
    writePlayersFile(data);

    // Discord bildirimi gönder
    sendDiscordNotification('player_added', newPlayer);

    res.status(201).json({ success: true, player: newPlayer });
});

// Oyuncu sil (isimle)
app.delete('/api/players/:name', (req, res) => {
    const playerName = req.params.name;
    const data = readPlayersFile();

    const index = data.players.findIndex(p => p.name.toLowerCase() === playerName.toLowerCase());
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Oyuncu bulunamadı' });
    }

    data.players.splice(index, 1);
    writePlayersFile(data);

    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
