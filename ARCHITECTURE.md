# Architecture Overview

## System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Render Platform                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Express Server                          │  │
│  │  Port: 3000 (configurable)                                 │  │
│  │                                                             │  │
│  │  Endpoints:                                                 │  │
│  │  - GET  /health    (Health check)                          │  │
│  │  - POST /trigger   (Manual trigger)                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────┼───────────────────────────────┐  │
│  │                    Cron Scheduler                          │  │
│  │  Schedule: 0 0 * * * (Daily at midnight)                   │  │
│  │  Automatically triggers processing every 24 hours          │  │
│  └───────────────────────────┼───────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────▼───────────────────────────────┐  │
│  │              Contact Tagger Service                        │  │
│  │  Main orchestration logic                                  │  │
│  └───┬───────────────────────────────────────────────┬────────┘  │
│      │                                               │            │
│  ┌───▼──────────────────────┐           ┌───────────▼────────┐  │
│  │  HubSpot Service          │           │  OpenAI Service    │  │
│  │  - Fetch contacts         │           │  - Evaluate data   │  │
│  │  - Update tags            │           │  - Generate tags   │  │
│  └───┬──────────────────────┘           └────────────┬────────┘  │
│      │                                               │            │
└──────┼───────────────────────────────────────────────┼────────────┘
       │                                               │
   ┌───▼──────────────┐                   ┌───────────▼─────────┐
   │   HubSpot API    │                   │    OpenAI API       │
   │                  │                   │   (GPT-3.5-turbo)   │
   │  - Contacts      │                   │                     │
   │  - Properties    │                   │  - Chat completion  │
   │  - Tags          │                   │  - Tag generation   │
   └──────────────────┘                   └─────────────────────┘
```

## Data Flow

1. **Scheduled Trigger** (Daily at midnight)
   ```
   Cron Scheduler → Contact Tagger Service
   ```

2. **Fetch Contacts** (Previous day's modified contacts)
   ```
   Contact Tagger → HubSpot Service → HubSpot API
   Response: Array of contacts with properties
   ```

3. **For Each Contact:**

   a. **Extract Data**
   ```
   Contact Tagger → HubSpot Service
   Extracts: name, email, job title, company, industry, etc.
   ```

   b. **AI Evaluation**
   ```
   Contact Tagger → OpenAI Service → OpenAI API
   Input: Contact data
   Output: Array of relevant tags
   ```

   c. **Update Tags**
   ```
   Contact Tagger → HubSpot Service → HubSpot API
   Updates the contact's tags property
   ```

4. **Summary Report**
   ```
   Console logs showing:
   - Total contacts processed
   - Successful updates
   - Failed updates
   ```

## File Structure

```
Hubppot-hcwhy/
├── src/
│   ├── index.js                 # Express server & entry point
│   ├── config.js                # Environment configuration
│   ├── scheduler.js             # Cron job scheduler
│   ├── contactTaggerService.js  # Main orchestration
│   ├── hubspotService.js        # HubSpot API integration
│   └── openaiService.js         # OpenAI API integration
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies
├── render.yaml                  # Render config
├── README.md                    # English documentation
└── KURULUM.md                   # Turkish documentation
```

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `HUBSPOT_ACCESS_TOKEN` | HubSpot API authentication | Yes |
| `OPENAI_API_KEY` | OpenAI API authentication | Yes |
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment mode | No (default: development) |
| `CRON_SCHEDULE` | Scheduling pattern | No (default: 0 0 * * *) |

## Rate Limiting Strategy

- **Base delay**: 500ms between each contact
- **Smart backoff**: 5 seconds on rate limit detection
- **No delay**: After last contact in batch
- **Error handling**: Continues processing on individual failures

## Error Handling

1. **Missing HubSpot property**: Logs warning, continues processing
2. **API rate limits**: Automatic backoff and retry
3. **OpenAI parsing errors**: Falls back to default tag
4. **Individual contact failures**: Logs error, continues with next contact
5. **Missing environment variables**: Fails fast on startup

## Monitoring

- Health check endpoint for uptime monitoring
- Detailed console logging for debugging
- Processing summary after each run
- Render dashboard for deployment monitoring
