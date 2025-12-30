# HubSpot Contact Tagger

Automated system that fetches HubSpot contacts from the previous day, evaluates them using OpenAI, and updates their tags based on AI analysis.

## Features

- 🔄 Automated daily processing of HubSpot contacts
- 🤖 AI-powered tag generation using OpenAI
- ⏰ Configurable scheduling (default: every 24 hours)
- 🚀 Ready for deployment on Render
- 📊 Health check and manual trigger endpoints

## How It Works

1. **Fetch Contacts**: Retrieves contacts modified in the previous day from HubSpot
2. **Extract Data**: Extracts relevant information (name, email, job title, company, etc.)
3. **AI Evaluation**: Uses OpenAI to analyze contact data and generate appropriate tags
4. **Update Tags**: Updates the contact's tags in HubSpot with AI-generated suggestions

## Prerequisites

- Node.js 18 or higher
- HubSpot account with API access
- OpenAI API account
- Render account (for deployment)

## Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Hubppot-hcwhy
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
HUBSPOT_ACCESS_TOKEN=your_hubspot_access_token_here
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
NODE_ENV=production
CRON_SCHEDULE=0 0 * * *
```

### 4. HubSpot Configuration

Before running the application, you need to create a custom property in HubSpot:

1. Go to HubSpot Settings → Properties → Contact Properties
2. Create a new property:
   - **Name**: Tags
   - **Field type**: Single-line text
   - **Internal name**: `tags`

Alternatively, you can modify the code to use HubSpot's native tagging system or custom properties.

## Running Locally

### Development Mode

```bash
npm run dev
```

This will:
- Start the Express server on the configured port (default: 3000)
- Initialize the scheduler (runs immediately in development mode)
- Make health check available at `http://localhost:3000/health`

### Production Mode

```bash
NODE_ENV=production npm start
```

## API Endpoints

### Health Check

```bash
GET /health
```

Returns the service status and uptime.

### Manual Trigger

```bash
POST /trigger
```

Manually triggers the contact tagging process without waiting for the scheduled time.

Example:
```bash
curl -X POST http://localhost:3000/trigger
```

## Deployment on Render

### Option 1: Using render.yaml (Recommended)

The repository includes a `render.yaml` file for easy deployment:

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" → "Blueprint"
4. Connect your repository
5. Render will automatically detect the `render.yaml` file
6. Add your environment variables in the Render dashboard:
   - `HUBSPOT_ACCESS_TOKEN`
   - `OPENAI_API_KEY`
7. Deploy!

### Option 2: Manual Setup

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your repository
4. Configure:
   - **Name**: hubspot-contact-tagger
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables
6. Deploy!

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `HUBSPOT_ACCESS_TOKEN` | HubSpot API access token | Yes | - |
| `OPENAI_API_KEY` | OpenAI API key | Yes | - |
| `PORT` | Server port | No | 3000 |
| `NODE_ENV` | Environment (development/production) | No | development |
| `CRON_SCHEDULE` | Cron schedule for automated runs | No | `0 0 * * *` |

## Cron Schedule Format

The `CRON_SCHEDULE` environment variable uses standard cron syntax:

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, Sunday = 0 or 7)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

Examples:
- `0 0 * * *` - Daily at midnight
- `0 */12 * * *` - Every 12 hours
- `0 9 * * *` - Daily at 9:00 AM
- `0 0 * * 1` - Every Monday at midnight

## Generated Tags

The AI evaluates contacts and generates tags based on:

- Job title and decision-making level
- Company and industry information
- Lifecycle stage and lead status
- Overall engagement potential

Example tags:
- `high-value`
- `decision-maker`
- `c-level`
- `technical`
- `hot-lead`
- `nurture`
- `enterprise`
- `smb`
- `needs-follow-up`

## Monitoring

The service provides several ways to monitor its operation:

1. **Health Check Endpoint**: `GET /health`
2. **Console Logs**: Detailed logging of all operations
3. **Render Logs**: Available in the Render dashboard

## Troubleshooting

### "Missing required environment variables" Error

Make sure you've set both `HUBSPOT_ACCESS_TOKEN` and `OPENAI_API_KEY` in your `.env` file or Render environment variables.

### No Contacts Found

The service fetches contacts modified in the previous day. If no contacts were modified yesterday, it will report 0 contacts found.

### Rate Limiting

The service includes a 1-second delay between processing contacts to avoid API rate limits. If you encounter rate limiting issues, you can modify this delay in `src/contactTaggerService.js`.

### HubSpot Tag Property Not Found

Make sure you've created the custom `tags` property in HubSpot, or modify the code to use your preferred tagging method.

## Development

### Project Structure

```
Hubppot-hcwhy/
├── src/
│   ├── index.js                 # Main application entry point
│   ├── config.js                # Configuration management
│   ├── scheduler.js             # Cron scheduler
│   ├── contactTaggerService.js  # Main business logic
│   ├── hubspotService.js        # HubSpot API integration
│   └── openaiService.js         # OpenAI API integration
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── package.json                 # Node.js dependencies
├── render.yaml                  # Render deployment configuration
└── README.md                    # This file
```

### Adding New Features

1. Modify contact data extraction in `hubspotService.js`
2. Update AI evaluation prompt in `openaiService.js`
3. Add new tag logic in `contactTaggerService.js`
4. Test locally before deploying

## Security Notes

- Never commit `.env` file to version control
- Use Render's environment variable management for secrets
- Rotate API keys regularly
- Monitor API usage to prevent unexpected costs

## Cost Considerations

- **HubSpot API**: Check your HubSpot plan's API limits
- **OpenAI API**: GPT-3.5-turbo usage is charged per token
- **Render**: Free tier available, check limits

## License

ISC

## Support

For issues and questions, please open an issue in the GitHub repository.
