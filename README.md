# HubSpot Contact Tagging Service

Bu proje, HubSpot API'den son 24 saatte değiştirilmiş kontakları çekip, OpenAI kullanarak bu kontaklar için otomatik etiketler oluşturur ve HubSpot'a geri yükler. Uygulama her 24 saatte bir otomatik olarak çalışır ve Render platformunda host edilebilir.

## Özellikler

- 🔄 Her 24 saatte bir otomatik çalışma
- 📊 HubSpot API entegrasyonu ile kontak verisi çekme
- 🤖 OpenAI API ile akıllı etiket oluşturma
- 🏷️ Otomatik kontak etiketleme
- 🚀 Render platformunda kolay deployment
- 📝 REST API endpoint'leri ile manuel tetikleme ve monitoring

## Kurulum

### Gereksinimler

- Node.js 14 veya üzeri
- HubSpot hesabı ve API access token
- OpenAI API key
- Render hesabı (deployment için)

### Yerel Kurulum

1. Repository'yi klonlayın:
```bash
git clone https://github.com/eyildirim-code/Hubppot-hcwhy.git
cd Hubppot-hcwhy
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyası oluşturun (`.env.example` dosyasını kopyalayın):
```bash
cp .env.example .env
```

4. `.env` dosyasını düzenleyin ve gerekli API key'lerini ekleyin:
```
HUBSPOT_ACCESS_TOKEN=your_hubspot_access_token
OPENAI_API_KEY=your_openai_api_key
PORT=3000
CRON_SCHEDULE=0 0 * * *
```

### HubSpot API Token Alma

1. HubSpot hesabınıza giriş yapın
2. Settings > Integrations > Private Apps
3. Yeni bir private app oluşturun
4. Gerekli izinleri verin:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
5. Access token'ı kopyalayın ve `.env` dosyasına ekleyin

### OpenAI API Key Alma

1. https://platform.openai.com/ adresine gidin
2. API keys bölümünden yeni bir key oluşturun
3. Key'i kopyalayın ve `.env` dosyasına ekleyin

## Kullanım

### Yerel Olarak Çalıştırma

```bash
npm start
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

### API Endpoints

#### GET /
Servis bilgilerini gösterir.

```bash
curl http://localhost:3000/
```

#### GET /health
Sağlık kontrolü endpoint'i.

```bash
curl http://localhost:3000/health
```

#### GET /status
Son çalışma durumunu ve bir sonraki zamanlanmış çalışmayı gösterir.

```bash
curl http://localhost:3000/status
```

#### POST /trigger
Manuel olarak kontak etiketleme işlemini başlatır.

```bash
curl -X POST http://localhost:3000/trigger
```

#### GET /logs
Son çalışmanın detaylı sonuçlarını gösterir.

```bash
curl http://localhost:3000/logs
```

## Render'da Deployment

### Otomatik Deployment

1. Render hesabınıza giriş yapın
2. "New +" > "Web Service" seçin
3. Bu GitHub repository'sini bağlayın
4. Render otomatik olarak `render.yaml` dosyasını okuyacaktır
5. Environment variables ekleyin:
   - `HUBSPOT_ACCESS_TOKEN`
   - `OPENAI_API_KEY`
6. "Create Web Service" butonuna tıklayın

### Manuel Deployment

Alternatif olarak Render dashboard üzerinden manuel konfigürasyon yapabilirsiniz:

- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check Path**: `/health`

## Nasıl Çalışır?

1. **Veri Çekme**: Uygulama son 24 saatte değiştirilmiş HubSpot kontaklarını çeker
2. **Veri Ekstraksiyon**: Her kontak için önemli bilgiler (isim, email, şirket, pozisyon, vb.) çıkarılır
3. **AI Analizi**: OpenAI API kullanarak kontak bilgileri analiz edilir ve uygun etiketler oluşturulur
4. **Etiket Güncelleme**: Oluşturulan etiketler HubSpot'taki kontaklara eklenir

## Özelleştirme

### Cron Schedule Değiştirme

`.env` dosyasındaki `CRON_SCHEDULE` değişkenini düzenleyin:

```
# Her gün gece yarısı (varsayılan)
CRON_SCHEDULE=0 0 * * *

# Her 12 saatte bir
CRON_SCHEDULE=0 */12 * * *

# Her gün saat 09:00'da
CRON_SCHEDULE=0 9 * * *

# Her Pazartesi saat 10:00'da
CRON_SCHEDULE=0 10 * * 1
```

### Kontak Özellikleri

`src/services/hubspot.service.js` dosyasındaki `getContactsFromPreviousDay` metodunda istediğiniz kontak özelliklerini değiştirebilirsiniz:

```javascript
properties: [
  'firstname',
  'lastname',
  'email',
  'company',
  // Kendi özelliklerinizi ekleyin
]
```

### AI Tag Oluşturma

`src/services/openai.service.js` dosyasındaki prompt'u özelleştirebilirsiniz:

```javascript
buildPrompt(contactData) {
  // Kendi prompt'unuzu oluşturun
}
```

## Güvenlik

- API key'lerinizi asla kod içinde saklamayın
- `.env` dosyasını git'e commit etmeyin
- Production ortamında environment variables kullanın
- API key'lerinizi düzenli olarak yenileyin

## Sorun Giderme

### HubSpot API Hataları

- Access token'ın geçerli olduğundan emin olun
- İlgili izinlerin verildiğini kontrol edin
- Rate limiting hatası alıyorsanız, istekler arasına delay ekleyin

### OpenAI API Hataları

- API key'in geçerli olduğundan emin olun
- Yeterli krediniz olduğunu kontrol edin
- Rate limiting için retry mekanizması ekleyin

### Render Deployment Sorunları

- Environment variables'ın doğru ayarlandığından emin olun
- Logları kontrol edin: Render dashboard > Logs
- Health check endpoint'inin çalıştığından emin olun

## Lisans

ISC

## Destek

Sorularınız için issue açabilirsiniz.
