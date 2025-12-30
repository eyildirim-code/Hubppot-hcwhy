# Configuration Examples / Konfigürasyon Örnekleri

Bu dosya, sistemin çeşitli kullanım senaryolarına göre nasıl özelleştirileceğini gösterir.

## 1. Farklı Zamanlamalar

### Her 6 Saatte Bir Çalıştırma

```env
CRON_SCHEDULE=0 */6 * * *
```

### İş Saatleri İçinde Her Saat (Hafta İçi 9-17)

```env
CRON_SCHEDULE=0 9-17 * * 1-5
```

### Her Hafta Pazartesi Sabah 8'de

```env
CRON_SCHEDULE=0 8 * * 1
```

### Her Ayın İlk Günü

```env
CRON_SCHEDULE=0 0 1 * *
```

## 2. HubSpot Contact Properties Özelleştirme

`src/services/hubspot.service.js` dosyasında daha fazla property ekleyebilirsiniz:

```javascript
properties: [
  'firstname',
  'lastname',
  'email',
  'company',
  'phone',
  'jobtitle',
  'website',
  'industry',
  'lifecyclestage',
  'hs_lead_status',
  // Ek özellikler:
  'annualrevenue',
  'city',
  'country',
  'hs_analytics_source',
  'hs_email_domain',
  'num_associated_deals',
  'hs_latest_meeting_activity',
  'recent_deal_amount'
]
```

## 3. AI Tag Oluşturma Stratejileri

### Yüksek Kaliteli Leadler İçin

`src/services/openai.service.js` dosyasında prompt'u özelleştirin:

```javascript
{
  role: "system",
  content: `You are a B2B sales AI assistant specializing in lead qualification.
  Analyze the contact and assign tags focused on:
  - Lead quality (hot-lead, warm-lead, cold-lead)
  - Decision-making authority (decision-maker, influencer, user)
  - Company size (enterprise, mid-market, small-business, startup)
  - Engagement level (highly-engaged, moderately-engaged, low-engagement)
  - Industry vertical
  
  Return ONLY 3-5 tags that would help prioritize sales outreach.`
}
```

### E-ticaret/SaaS Odaklı

```javascript
{
  role: "system",
  content: `You are an e-commerce marketing AI assistant.
  Analyze the contact and assign tags focused on:
  - Customer lifecycle (new-customer, returning-customer, at-risk, churned)
  - Value segment (high-value, medium-value, low-value)
  - Product interest category
  - Engagement channel preference (email-engaged, social-engaged, web-engaged)
  
  Return ONLY 3-5 actionable marketing tags.`
}
```

### Event/Webinar Odaklı

```javascript
{
  role: "system",
  content: `You are an event marketing AI assistant.
  Analyze the contact and assign tags focused on:
  - Event attendance likelihood (likely-attendee, maybe-attendee, unlikely)
  - Interest areas based on job title and industry
  - Seniority level (executive, manager, individual-contributor)
  - Geographic relevance
  
  Return ONLY 3-5 event-targeting tags.`
}
```

## 4. Gelişmiş Filtreleme

### Sadece Yeni Kontakları İşleme

`src/services/hubspot.service.js` içinde:

```javascript
async getContactsFromPreviousDay() {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayTimestamp = yesterday.getTime();

  const response = await this.client.crm.contacts.searchApi.doSearch({
    filterGroups: [
      {
        filters: [
          {
            propertyName: 'createdate',  // Değişti: lastmodifieddate -> createdate
            operator: 'GTE',
            value: yesterdayTimestamp.toString()
          }
        ]
      }
    ],
    // ...
  });
}
```

### Belirli Lifecycle Stage'deki Kontakları İşleme

```javascript
filterGroups: [
  {
    filters: [
      {
        propertyName: 'lastmodifieddate',
        operator: 'GTE',
        value: yesterdayTimestamp.toString()
      },
      {
        propertyName: 'lifecyclestage',
        operator: 'EQ',
        value: 'lead'  // Sadece 'lead' stage'indekiler
      }
    ]
  }
]
```

### Birden Fazla Filtre Kombinasyonu

```javascript
filterGroups: [
  {
    filters: [
      {
        propertyName: 'lastmodifieddate',
        operator: 'GTE',
        value: yesterdayTimestamp.toString()
      },
      {
        propertyName: 'hs_lead_status',
        operator: 'NEQ',
        value: 'UNQUALIFIED'  // Disqualified olmayan
      },
      {
        propertyName: 'email',
        operator: 'HAS_PROPERTY'  // Email olan
      }
    ]
  }
]
```

## 5. Tag Depolama Seçenekleri

### Option 1: Tek Metin Alanı (Mevcut)

```javascript
// src/services/hubspot.service.js
const properties = {
  ai_generated_tags: tags.join(';')
};
```

### Option 2: Custom Multi-Select Property

```javascript
// HubSpot'ta multi-select property oluşturduktan sonra:
const properties = {
  ai_tags: tags  // Array olarak gönder
};
```

### Option 3: Her Tag İçin Ayrı Boolean Property

```javascript
// Tag'leri boolean property'lere çevir
const properties = {};
tags.forEach(tag => {
  properties[`tag_${tag.replace(/[^a-z0-9]/g, '_')}`] = true;
});
```

## 6. Rate Limiting ve Performans

### OpenAI İstekleri Arası Delay Ayarlama

`src/services/openai.service.js` içinde:

```javascript
// Daha hızlı işleme (dikkat: rate limit riski)
await this.delay(200);  // 200ms

// Daha güvenli işleme
await this.delay(1000);  // 1 saniye
```

### Batch Size Sınırlama

`src/services/hubspot.service.js` içinde:

```javascript
// Fetch contacts with limit
const response = await this.client.crm.contacts.searchApi.doSearch({
  // ...
  limit: 50  // Azalt veya arttır (max 100)
});
```

### Paralel İşleme (Gelişmiş)

```javascript
// src/services/openai.service.js
async batchGenerateTags(contactsData, batchSize = 5) {
  const results = [];
  
  for (let i = 0; i < contactsData.length; i += batchSize) {
    const batch = contactsData.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(contact => this.generateTags(contact))
    );
    results.push(...batchResults);
    
    // Batch'ler arası delay
    if (i + batchSize < contactsData.length) {
      await this.delay(1000);
    }
  }
  
  return results;
}
```

## 7. Logging ve Monitoring

### Detaylı Logging Ekleme

```javascript
// src/orchestrator.js içinde her adımda:
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  step: 'fetch_contacts',
  count: contacts.length,
  details: { /* ... */ }
}));
```

### External Monitoring Service Entegrasyonu

```javascript
// Örnek: Sentry entegrasyonu
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

// Hata yakalama:
try {
  await this.processContacts();
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

## 8. Webhook Entegrasyonu

### HubSpot Webhook ile Real-time Tagging

`index.js` dosyasına ekleyin:

```javascript
app.post('/webhook/contact-created', async (req, res) => {
  const contactId = req.body.contactId;
  
  // Tek kontak işle
  const contact = await hubspotService.getContactById(contactId);
  const data = hubspotService.extractContactData(contact);
  const tags = await openaiService.generateTags(data);
  await hubspotService.updateContactTags(contactId, tags);
  
  res.json({ success: true });
});
```

## 9. Test Modları

### Dry Run Modu

Environment variable ekleyin:

```env
DRY_RUN=true
```

Kod içinde:

```javascript
async updateContactTags(contactId, tags) {
  if (process.env.DRY_RUN === 'true') {
    console.log(`[DRY RUN] Would update contact ${contactId} with tags:`, tags);
    return { dryRun: true, contactId, tags };
  }
  
  // Gerçek güncelleme...
}
```

### Debug Modu

```env
DEBUG=true
LOG_LEVEL=verbose
```

```javascript
const debug = process.env.DEBUG === 'true';
if (debug) {
  console.log('Debug info:', { /* detaylı bilgi */ });
}
```

## 10. Notification Sistemleri

### Email Bildirimleri (NodeMailer)

```javascript
const nodemailer = require('nodemailer');

async function sendCompletionEmail(results) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: 'HubSpot Tagging Complete',
    text: `Processed ${results.processedCount} contacts`
  });
}
```

### Slack Bildirimleri

```javascript
const axios = require('axios');

async function sendSlackNotification(message) {
  await axios.post(process.env.SLACK_WEBHOOK_URL, {
    text: message,
    username: 'HubSpot Tagging Bot'
  });
}
```

## Önerilen Production Konfigürasyonu

```env
# API Keys
HUBSPOT_ACCESS_TOKEN=your_token
OPENAI_API_KEY=your_key

# App Config
NODE_ENV=production
PORT=10000

# Scheduling
CRON_SCHEDULE=0 2 * * *  # Her gece saat 02:00

# Optional
DRY_RUN=false
DEBUG=false
LOG_LEVEL=info

# Monitoring (opsiyonel)
SENTRY_DSN=your_sentry_dsn
SLACK_WEBHOOK_URL=your_slack_webhook
```

Bu konfigürasyonlar, sistemi farklı ihtiyaçlara göre özelleştirmenize olanak tanır.
