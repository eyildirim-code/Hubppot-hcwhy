# Quick Start Guide / Hızlı Başlangıç Kılavuzu

Bu kılavuz, sistemi en hızlı şekilde çalıştırmak isteyenler içindir. Detaylı bilgi için diğer dokümanlara bakın.

## 🚀 5 Dakikada Başla

### 1. API Key'leri Hazırla (3 dakika)

**HubSpot Token:**
1. https://app.hubspot.com → Settings → Integrations → Private Apps
2. "Create private app" → İsim ver → Scopes: `crm.objects.contacts.read` + `crm.objects.contacts.write`
3. Token'ı kopyala

**OpenAI Key:**
1. https://platform.openai.com/api-keys
2. "Create new secret key" → İsim ver
3. Key'i kopyala

### 2. HubSpot'ta Property Oluştur (1 dakika)

1. HubSpot → Settings → Properties → Contact properties
2. "Create property":
   - Label: `AI Generated Tags`
   - Property name: `ai_generated_tags`
   - Field type: `Single-line text`
3. Save

### 3. Render'da Deploy Et (1 dakika)

1. https://render.com → New → Web Service
2. Repository'yi bağla: `eyildirim-code/Hubppot-hcwhy`
3. Environment variables ekle:
   ```
   HUBSPOT_ACCESS_TOKEN = your_hubspot_token
   OPENAI_API_KEY = your_openai_key
   CRON_SCHEDULE = 0 0 * * *
   ```
4. "Create Web Service"

### 4. Test Et

Service URL'ni al (örn: `https://your-service.onrender.com`), sonra:

```bash
# Sağlık kontrolü
curl https://your-service.onrender.com/health

# Manuel tetikleme
curl -X POST https://your-service.onrender.com/trigger

# 30 saniye bekle, sonra durumu kontrol et
curl https://your-service.onrender.com/status
```

## ✅ İşlem Tamamlandı!

Sistem her 24 saatte bir otomatik olarak çalışacak.

---

## 🖥️ Yerel Test (Opsiyonel)

```bash
# Repository'yi klonla
git clone https://github.com/eyildirim-code/Hubppot-hcwhy.git
cd Hubppot-hcwhy

# Dependencies yükle
npm install

# .env dosyası oluştur
cp .env.example .env

# .env dosyasını düzenle (API key'leri ekle)
nano .env

# Testleri çalıştır
npm test

# Servisi başlat
npm start
```

Server `http://localhost:3000` adresinde çalışacak.

## 📊 Monitoring

**Status Kontrolü:**
```bash
curl http://localhost:3000/status
```

**Son Çalışma Logları:**
```bash
curl http://localhost:3000/logs
```

**Manuel Tetikleme:**
```bash
curl -X POST http://localhost:3000/trigger
```

## 🔧 Cron Schedule Değiştirme

Environment variable'da `CRON_SCHEDULE` değerini değiştir:

- `0 0 * * *` → Her gün gece yarısı (varsayılan)
- `0 */12 * * *` → Her 12 saatte bir
- `0 9 * * 1-5` → Hafta içi her gün saat 9'da
- `*/30 * * * *` → Her 30 dakikada bir (test için)

## 📖 Daha Fazla Bilgi

- **Kurulum & Kullanım**: `README.md`
- **Deployment Detayları**: `DEPLOYMENT.md`
- **Özelleştirme**: `CONFIGURATION.md`
- **Proje Özeti**: `PROJECT_SUMMARY.md`

## 🆘 Sorun mu Yaşıyorsun?

### HubSpot Bağlanmıyor
- Token'ın doğru kopyalandığını kontrol et
- Private app'te scope'ların verildiğini kontrol et

### OpenAI Çalışmıyor
- API key'in geçerli olduğunu kontrol et
- Hesabında kredi olduğunu kontrol et

### Render'da Hata
- Environment variables'ın doğru girildiğini kontrol et
- Logs sekmesinden hata mesajlarına bak

### Manuel Test
```bash
# Yerel testler
npm test

# Syntax kontrolü
node -c index.js
```

## 🎯 Beklenen Sonuç

Sistem her gün otomatik olarak:
1. Son 24 saatte değişen kontakları çeker
2. AI ile analiz edip etiketler oluşturur
3. Etiketleri HubSpot'a yükler
4. Sonuçları loglar

Status endpoint'inden her zaman son durumu görebilirsin!

**Başarılar! 🎉**
