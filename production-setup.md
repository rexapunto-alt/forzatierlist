# https://forzatierlist.xyz Domain Bağlantısı

## 1. Hosting Seçenekleri

### A. Render (Ücretsiz)
```bash
# Render'a yükleme için:
1. https://render.com/'a git
2. "New Web Service" de
3. GitHub reposunu bağla
4. Build Command: npm install
5. Start Command: node server.js
6. Environment Variables:
   - PORT=3000
   - DISCORD_WEBHOOK_URL=http://localhost:3001/discord-notify (isteğe bağlı)
```

### B. Railway (Ücretsiz)
```bash
# Railway'e yükleme:
1. https://railway.app/'a git
2. New Project -> Deploy from GitHub repo
3. Environment Variables ekle:
   - PORT=3000
   - NODE_ENV=production
```

### C. Vercel (Sınırlı)
```bash
# Vercel için server.js'i düzenle gerekir
```

## 2. Domain Ayarları

### Cloudflare DNS Ayarları:
```
Type: A
Name: @
Content: SUNUCU_IP_ADRESI
TTL: Auto
Proxy status: Proxied (turuncu bulut)
```

## 3. NGROK (Test İçin)
```bash
# Geçici test için:
npm install -g ngrok
ngrok http 3000
# Oluşturulan URL'yi Cloudflare'de kullan
```

## 4. Environment Variables (.env)
```bash
# .env dosyası oluştur:
PORT=3000
NODE_ENV=production
DISCORD_WEBHOOK_URL=http://localhost:3001/discord-notify
ADMIN_PASSWORD=Admin123321
```

## 5. Server.js Güncellemesi (Production)
```javascript
// En üste ekle:
require('dotenv').config();

// PORT satırını güncelle:
const PORT = process.env.PORT || 3000;
```

## 6. Başlatma Scriptleri
```json
// package.json'a ekle:
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "discord": "node discord-bot.js"
}
```

## 7. Test
```bash
# Local test:
npm start

# Production test:
git push
# Hosting platformunda otomatik deploy olur
```

## Hata Çözümü
- Error 522: Sunucu çalışmıyor veya port yanlış
- Error 525: SSL sertifikası sorunu
- Error 404: Dosya yolu yanlış
