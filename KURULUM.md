# HubSpot Contact Tagger - Türkçe Kurulum Kılavuzu

## Genel Bakış

Bu proje, HubSpot'tan önceki günün iletişim verilerini otomatik olarak çeker, OpenAI kullanarak değerlendirir ve uygun etiketler ekler.

## Özellikler

- ✅ Önceki gün değiştirilmiş HubSpot iletişimlerini otomatik çekme
- ✅ OpenAI ile akıllı etiket üretimi
- ✅ 24 saatte bir otomatik çalışma
- ✅ Render'da kolay dağıtım
- ✅ Sağlık kontrolü ve manuel tetikleme

## Hızlı Başlangıç

### 1. Gereksinimler

- Node.js 18 veya üzeri
- HubSpot hesabı ve API erişimi
- OpenAI API anahtarı
- Render hesabı (dağıtım için)

### 2. Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Çevre değişkenlerini ayarla
cp .env.example .env
```

### 3. Çevre Değişkenlerini Yapılandırma

`.env` dosyasını düzenleyin:

```env
HUBSPOT_ACCESS_TOKEN=hubspot_api_anahtariniz
OPENAI_API_KEY=openai_api_anahtariniz
PORT=3000
NODE_ENV=production
CRON_SCHEDULE=0 0 * * *
```

### 4. HubSpot'ta "Tags" Özelliği Oluşturma

**ÖNEMLİ**: Kodu çalıştırmadan önce HubSpot'ta özel bir özellik oluşturmalısınız:

1. HubSpot → Settings → Properties → Contact Properties
2. "Create property" tıklayın
3. Şu bilgileri girin:
   - **Name**: Tags
   - **Field type**: Single-line text
   - **Internal name**: `tags`
4. Kaydedin

### 5. Yerel Olarak Çalıştırma

```bash
# Geliştirme modu (hemen çalışır)
npm run dev

# Üretim modu
npm start
```

### 6. Test Etme

Manuel tetikleme için:

```bash
curl -X POST http://localhost:3000/trigger
```

Sağlık kontrolü:

```bash
curl http://localhost:3000/health
```

## Render'a Dağıtım

### Otomatik Dağıtım (Önerilen)

1. Kodunuzu GitHub'a push edin
2. [Render Dashboard](https://dashboard.render.com/) açın
3. "New" → "Blueprint" tıklayın
4. Repository'nizi bağlayın
5. Render otomatik olarak `render.yaml` dosyasını algılar
6. Environment variables ekleyin:
   - `HUBSPOT_ACCESS_TOKEN`
   - `OPENAI_API_KEY`
7. Deploy edin!

## Zamanlama Ayarları

`CRON_SCHEDULE` değişkeni ile çalışma zamanını ayarlayabilirsiniz:

- `0 0 * * *` - Her gün gece yarısı (varsayılan)
- `0 */12 * * *` - Her 12 saatte bir
- `0 9 * * *` - Her gün saat 09:00'da
- `0 0 * * 1` - Her Pazartesi gece yarısı

## API Endpoints

### Sağlık Kontrolü
```
GET /health
```

### Manuel Tetikleme
```
POST /trigger
```

## Nasıl Çalışır?

1. **Veri Çekme**: Önceki gün değiştirilmiş iletişimleri HubSpot'tan çeker
2. **Veri Çıkarma**: İlgili bilgileri (ad, e-posta, iş unvanı, şirket vb.) çıkarır
3. **AI Değerlendirme**: OpenAI ile iletişim verilerini analiz eder
4. **Etiket Güncelleme**: Oluşturulan etiketleri HubSpot'a yükler

## Oluşturulan Etiket Örnekleri

AI şu faktörleri değerlendirerek etiketler oluşturur:

- İş unvanı ve karar verme seviyesi
- Şirket ve sektör bilgisi
- Yaşam döngüsü aşaması
- Genel etkileşim potansiyeli

Örnek etiketler:
- `high-value` (yüksek değerli)
- `decision-maker` (karar verici)
- `c-level` (üst düzey yönetici)
- `technical` (teknik)
- `hot-lead` (sıcak müşteri adayı)
- `enterprise` (kurumsal)
- `needs-follow-up` (takip gerekiyor)

## Sorun Giderme

### "Missing required environment variables" Hatası

`.env` dosyasında `HUBSPOT_ACCESS_TOKEN` ve `OPENAI_API_KEY` değişkenlerini ayarladığınızdan emin olun.

### İletişim Bulunamadı

Sistem önceki günün iletişimlerini çeker. Dün hiç iletişim değiştirilmediyse, 0 iletişim bulunur.

### HubSpot Tags Özelliği Bulunamadı

HubSpot'ta `tags` özelliğini oluşturduğunuzdan emin olun (yukarıdaki adım 4'e bakın).

## Güvenlik Notları

- `.env` dosyasını asla commit etmeyin
- API anahtarlarını düzenli olarak yenileyin
- API kullanımını izleyin

## Maliyet Değerlendirmesi

- **HubSpot API**: Planınızın API limitlerini kontrol edin
- **OpenAI API**: GPT-3.5-turbo kullanımı token bazlı ücretlendirilir
- **Render**: Ücretsiz katman mevcut

## Destek

Sorular ve sorunlar için GitHub repository'de issue açabilirsiniz.
