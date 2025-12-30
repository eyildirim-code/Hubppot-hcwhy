# Project Summary / Proje Özeti

## HubSpot Contact Tagging System

Bu proje, HubSpot'taki kontakları otomatik olarak etiketleyen tam özellikli bir Node.js uygulamasıdır.

## 🎯 Ana Özellikler

1. **Otomatik Veri Çekme**: HubSpot API'den son 24 saatte değiştirilmiş kontakları otomatik olarak çeker
2. **AI Tabanlı Etiketleme**: OpenAI GPT-3.5-turbo kullanarak kontak özelliklerine göre akıllı etiketler oluşturur
3. **Otomatik Güncelleme**: Oluşturulan etiketleri HubSpot'taki kontaklara otomatik olarak yükler
4. **Zamanlanmış Çalışma**: Her 24 saatte bir otomatik olarak çalışır (cron job)
5. **REST API**: İzleme, manuel tetikleme ve durum kontrolü için endpoint'ler
6. **Production Ready**: Render platformunda deployment için hazır

## 📁 Proje Yapısı

```
hubspot-hcwhy/
├── index.js                          # Ana server dosyası (Express + cron)
├── src/
│   ├── orchestrator.js               # Ana iş akışı orkestratörü
│   └── services/
│       ├── hubspot.service.js        # HubSpot API entegrasyonu
│       └── openai.service.js         # OpenAI API entegrasyonu
├── test-validation.js                # Temel validation testleri
├── package.json                      # NPM dependencies
├── render.yaml                       # Render deployment konfigürasyonu
├── .env.example                      # Environment variables şablonu
├── .gitignore                        # Git ignore dosyası
├── README.md                         # Ana dokümantasyon
├── DEPLOYMENT.md                     # Deployment kılavuzu
└── CONFIGURATION.md                  # Konfigürasyon örnekleri
```

## 🔄 İş Akışı

```
1. Cron Job Tetiklenir (Her 24 saatte bir)
         ↓
2. HubSpot'tan Son 24 Saatin Kontakları Çekilir
         ↓
3. Her Kontak İçin Veri Ekstraksiyon
   (İsim, email, şirket, pozisyon, industry, vb.)
         ↓
4. OpenAI ile Her Kontak Analiz Edilir
   (Job title, industry, lifecycle stage'e göre)
         ↓
5. AI Tarafından Etiketler Oluşturulur
   (Örn: "decision-maker", "tech-industry", "high-priority")
         ↓
6. Etiketler HubSpot'a Geri Yüklenir
         ↓
7. Sonuçlar Loglanır ve API'den Erişilebilir
```

## 🚀 Hızlı Başlangıç

### 1. Kurulum

```bash
npm install
```

### 2. Konfigürasyon

`.env` dosyası oluşturun:

```env
HUBSPOT_ACCESS_TOKEN=your_hubspot_token
OPENAI_API_KEY=your_openai_key
PORT=3000
CRON_SCHEDULE=0 0 * * *
```

### 3. Çalıştırma

```bash
npm start
```

### 4. Test

```bash
npm test
```

## 📡 API Endpoints

- `GET /` - Servis bilgileri
- `GET /health` - Sağlık kontrolü (Render için)
- `GET /status` - Son çalışma durumu ve istatistikler
- `POST /trigger` - Manuel tetikleme
- `GET /logs` - Detaylı son çalışma logları

## 🔐 Güvenlik

- ✅ Tüm API key'ler environment variables'da
- ✅ `.env` dosyası `.gitignore`'da
- ✅ CodeQL security scan: 0 güvenlik açığı
- ✅ npm audit: 0 güvenlik açığı
- ✅ Hassas bilgiler kod içinde yok

## 📊 Performans ve Limitler

### HubSpot API
- Rate Limit: 100 requests/10 saniye
- Fetch Limit: 100 kontak/istek
- Kod içinde batch processing mevcut

### OpenAI API
- Model: GPT-3.5-turbo (maliyet etkin)
- Rate Limiting: İstekler arası 500ms delay
- Error Handling: Hata durumunda 'unclassified' tag

## 💰 Tahmini Maliyetler

### Render (Hosting)
- Free Tier: 750 saat/ay ücretsiz
- Paid Plan: $7/ay'dan başlayan

### OpenAI
- GPT-3.5-turbo: ~$0.001-0.002 per request
- 100 kontak/gün: ~$3-6/ay

### HubSpot
- API kullanımı: Ücretsiz
- Rate limits dahilinde

### **Toplam Tahmini**: ~$10-15/ay (veya free tier'da $0)

## 🛠️ Teknolojiler

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Scheduling**: node-cron
- **HubSpot SDK**: @hubspot/api-client
- **AI**: OpenAI SDK (GPT-3.5-turbo)
- **Deployment**: Render
- **Environment**: dotenv

## 📖 Dokümantasyon

1. **README.md** - Ana kullanım ve kurulum kılavuzu
2. **DEPLOYMENT.md** - Adım adım deployment rehberi
   - HubSpot API token alma
   - OpenAI key alma
   - Render'da deployment
   - Sorun giderme
3. **CONFIGURATION.md** - Gelişmiş özelleştirme örnekleri
   - Farklı zamanlamalar
   - Custom prompts
   - Filtreleme stratejileri
   - Monitoring entegrasyonları

## ✅ Test Coverage

- ✅ Module loading testleri
- ✅ Method existence kontrolleri
- ✅ Tag parsing validation
- ✅ Contact data extraction
- ✅ Syntax checking
- ✅ Code review: Tüm sorunlar çözüldü
- ✅ Security scan: 0 açık

## 🔮 Gelecek Geliştirmeler (Opsiyonel)

1. **Webhook Support**: HubSpot webhook'ları ile real-time tagging
2. **Dashboard**: Web UI ile monitoring ve manuel yönetim
3. **Advanced Analytics**: Tag effectiveness tracking
4. **Multi-language Support**: Farklı dillerde etiketler
5. **Custom Rules Engine**: Kullanıcı tanımlı tagging kuralları
6. **Slack/Email Notifications**: Otomatik bildirimler
7. **A/B Testing**: Farklı prompt stratejilerini test etme

## 📝 Önemli Notlar

### HubSpot Property Gereksinimleri

Sistemin çalışması için HubSpot'ta custom bir property oluşturulmalı:

- **Property Name**: `ai_generated_tags`
- **Field Type**: Single-line text veya Multiple checkboxes
- **Object**: Contact

Detaylı talimatlar için `DEPLOYMENT.md` dosyasına bakın.

### Sales Hub Dependency

Kod içinde kullanılan `hs_lead_status` property'si HubSpot Sales Hub'ın bir parçasıdır. Eğer Sales Hub'ınız yoksa:

1. `src/services/hubspot.service.js` dosyasını açın
2. Properties listesinden `hs_lead_status`'u kaldırın
3. Veya Marketing Hub'daki alternatif bir property kullanın

## 🤝 Katkıda Bulunma

1. Bu repo'yu fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📄 Lisans

ISC License

## 🆘 Destek

Sorularınız veya sorunlarınız için:
- GitHub Issues: https://github.com/eyildirim-code/Hubppot-hcwhy/issues
- Dokümantasyon: README.md, DEPLOYMENT.md, CONFIGURATION.md

## 🎉 Proje Durumu

**✅ PRODUCTION READY**

Proje production ortamında kullanıma hazırdır. Tüm temel özellikler implement edilmiş, test edilmiş ve güvenlik taramasından geçmiştir.

### Deployment için Yapılması Gerekenler:

1. HubSpot Private App oluştur ve token al
2. OpenAI API key al
3. HubSpot'ta `ai_generated_tags` property'sini oluştur
4. Render'da web service oluştur
5. Environment variables'ı ayarla
6. Deploy et!

Detaylı adımlar için `DEPLOYMENT.md` dosyasına bakın.
