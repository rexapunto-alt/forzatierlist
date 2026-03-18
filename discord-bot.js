const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');
const fs = require('fs');
const path = require('path');

// Config dosyasını oku
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

// Discord Bot Configuration
const BOT_TOKEN = config.discord.botToken;
const CHANNEL_ID = config.discord.channelId;

// Express app for webhooks
const app = express();
app.use(express.json());

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// JSON dosya yolu
const PLAYERS_FILE = path.join(__dirname, config.database.playersFile);

// Yardımcı: players.json oku
function readPlayersFile() {
    try {
        const raw = fs.readFileSync(PLAYERS_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (err) {
        return { players: [] };
    }
}

// Discord'a oyuncu ekleme bildirimi gönder
function sendPlayerAddNotification(player) {
    const channel = client.channels.cache.get(CHANNEL_ID);
    if (!channel) return;

    const embed = new EmbedBuilder()
        .setTitle('🎮 Yeni Oyuncu Eklendi!')
        .setColor('#00ff00')
        .addFields(
            { name: '👤 Oyuncu Adı', value: player.name, inline: true },
            { name: '🌍 Bölge', value: player.region, inline: true },
            { name: '📊 Tiers', value: Object.keys(player.tiers).length > 0 ? Object.entries(player.tiers).map(([k,v]) => `${k}: ${v}`).join(', ') : 'Yok', inline: false }
        )
        .setThumbnail(player.avatar || 'https://mc-heads.net/avatar/Steve')
        .setTimestamp()
        .setFooter({ text: 'Forza Tier List' });

    channel.send({ embeds: [embed] });
}

// Sıralama bildirimi
function sendRankingNotification() {
    const data = readPlayersFile();
    const channel = client.channels.cache.get(CHANNEL_ID);
    if (!channel) return;

    // En iyi 5 oyuncuyu hesapla
    const playersWithPoints = data.players.map(player => {
        let points = 0;
        const TIER_POINTS = {
            'LT5': 1, 'HT5': 2, 'LT4': 3, 'HT4': 4,
            'LT3': 6, 'HT3': 10, 'LT2': 20, 'HT2': 30,
            'LT1': 45, 'HT1': 60
        };
        
        for (const [category, tier] of Object.entries(player.tiers)) {
            if (tier && TIER_POINTS[tier]) {
                points += TIER_POINTS[tier];
            }
        }
        
        return { ...player, points };
    }).sort((a, b) => b.points - a.points).slice(0, 5);

    const embed = new EmbedBuilder()
        .setTitle('🏆 Top 5 Sıralama')
        .setColor('#ffd700')
        .setDescription('En iyi 5 oyuncu:')
        .addFields(
            playersWithPoints.map((player, index) => ({
                name: `${index + 1}. ${player.name}`,
                value: `💎 ${player.points} points | 🌍 ${player.region}`,
                inline: false
            }))
        )
        .setTimestamp()
        .setFooter({ text: 'Forza Tier List' });

    channel.send({ embeds: [embed] });
}

// Webhook endpoint - main server'dan bildirimler için
app.post('/discord-notify', (req, res) => {
    const { type, player } = req.body;
    
    if (type === 'player_added' && player) {
        sendPlayerAddNotification(player);
        res.json({ success: true });
    } else if (type === 'ranking_update') {
        sendRankingNotification();
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false, message: 'Invalid notification type' });
    }
});

// Discord komutları
client.on('messageCreate', (message) => {
    if (message.author.bot) return;
    
    const prefix = '!';
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    
    if (command === 'sıralama') {
        sendRankingNotification();
        message.reply('📊 Sıralama listesi gönderildi!');
    }
    
    if (command === 'oyuncular') {
        const data = readPlayersFile();
        const embed = new EmbedBuilder()
            .setTitle('👥 Tüm Oyuncular')
            .setColor('#0099ff')
            .setDescription(`Toplam ${data.players.length} oyuncu:`)
            .addFields(
                data.players.slice(0, 10).map(player => ({
                    name: player.name,
                    value: `🌍 ${player.region} | 📊 ${Object.keys(player.tiers).length} tier`,
                    inline: true
                }))
            )
            .setTimestamp();
            
        message.reply({ embeds: [embed] });
    }
});

// Bot hazır olduğunda
client.once('ready', () => {
    console.log(`Discord bot giriş yaptı: ${client.user.tag}`);
});

// Bot'u başlat
client.login(BOT_TOKEN);

// Express server'ı başlat (farklı port)
const DISCORD_PORT = process.env.DISCORD_PORT || config.discord.webhookPort;
app.listen(DISCORD_PORT, () => {
    console.log(`Discord webhook server running on port ${DISCORD_PORT}`);
});
