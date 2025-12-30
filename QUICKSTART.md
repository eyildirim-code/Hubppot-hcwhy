# Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Get Your API Keys

#### HubSpot Access Token
1. Go to HubSpot → Settings → Integrations → Private Apps
2. Create a new private app
3. Grant these scopes:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
4. Copy the access token

#### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key

### Step 2: Configure Environment

```bash
# Create .env file
cp .env.example .env

# Edit .env and add your keys
HUBSPOT_ACCESS_TOKEN=your_hubspot_token_here
OPENAI_API_KEY=your_openai_key_here
```

### Step 3: Create HubSpot Tags Property

**Important:** Before running, create this property in HubSpot:

1. HubSpot → Settings → Properties → Contact Properties
2. Click "Create property"
3. Set:
   - **Label**: Tags
   - **Field type**: Single-line text
   - **Internal name**: `tags`
4. Save

### Step 4: Install & Run

```bash
# Install dependencies
npm install

# Run locally (development mode - runs immediately)
npm run dev
```

The server will start on http://localhost:3000

### Step 5: Test

```bash
# Check health
curl http://localhost:3000/health

# Trigger manually
curl -X POST http://localhost:3000/trigger
```

## 📊 What Happens?

When triggered (manually or by schedule):

1. ✅ Fetches contacts modified yesterday from HubSpot
2. ✅ For each contact:
   - Extracts: name, email, job title, company, industry
   - Sends to OpenAI for evaluation
   - Receives AI-generated tags
   - Updates contact in HubSpot
3. ✅ Shows summary in console

## 🔄 Scheduling

By default, runs **daily at midnight**. 

To change schedule, edit `.env`:

```env
# Every 12 hours
CRON_SCHEDULE=0 */12 * * *

# Every day at 9 AM
CRON_SCHEDULE=0 9 * * *

# Every Monday at midnight
CRON_SCHEDULE=0 0 * * 1
```

## 🌐 Deploy to Render

### Quick Deploy

1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" → "Blueprint"
4. Connect your repository
5. Render auto-detects `render.yaml`
6. Add environment variables:
   - `HUBSPOT_ACCESS_TOKEN`
   - `OPENAI_API_KEY`
7. Click "Apply"
8. Done! ✅

### Manual Deploy

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect repository
4. Set:
   - **Name**: hubspot-contact-tagger
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables
6. Deploy!

## 🏷️ Example Tags Generated

AI evaluates and generates tags like:

- `decision-maker` - C-level or VP roles
- `technical` - Engineering/IT roles
- `high-value` - Enterprise companies
- `hot-lead` - Recent engagement
- `needs-follow-up` - Incomplete information
- `c-level` - CEO, CTO, CFO, etc.
- `enterprise` - Large companies
- `smb` - Small/medium business

## 📝 Logs

Watch the logs to see processing:

```
=== Starting Contact Tagging Process ===
Fetching contacts modified between 2024-01-15T00:00:00 and 2024-01-16T00:00:00
Found 5 contacts from previous day

Evaluating contact: john@example.com
OpenAI response: ["decision-maker", "technical", "enterprise"]
Generated tags for contact 123: decision-maker, technical, enterprise
Updating contact 123 with tags: decision-maker, technical, enterprise
Successfully updated tags for contact 123

=== Contact Tagging Process Completed ===
Total processed: 5
Successful: 5
Failed: 0
```

## ⚠️ Troubleshooting

### No contacts found
- Normal if no contacts were modified yesterday
- Test with manual contact edit in HubSpot

### "Missing required environment variables"
- Check `.env` file exists
- Verify both `HUBSPOT_ACCESS_TOKEN` and `OPENAI_API_KEY` are set

### "Property values were not valid"
- Create the `tags` property in HubSpot (see Step 3)

### Rate limiting
- Default 500ms delay between contacts
- Auto-increases to 5s if rate limit hit
- Adjustable in `src/contactTaggerService.js`

## 💰 Costs

### HubSpot API
- **Free tier**: 100 requests/10 seconds
- This app: ~2-5 requests per contact
- Daily: Depends on contacts modified

### OpenAI API
- **Model**: GPT-3.5-turbo
- **Cost**: ~$0.002 per contact (approximate)
- **100 contacts/day**: ~$0.20/day = $6/month
- **1000 contacts/day**: ~$2/day = $60/month

### Render
- **Free tier**: 750 hours/month
- **Enough for**: Always-on service
- **Paid tier**: $7/month for more resources

## 📞 Support

- **Documentation**: See README.md (English) or KURULUM.md (Turkish)
- **Architecture**: See ARCHITECTURE.md
- **Issues**: Open issue on GitHub

## ✅ Checklist

Before deploying:

- [ ] HubSpot access token obtained
- [ ] OpenAI API key obtained
- [ ] `.env` file created and configured
- [ ] `tags` property created in HubSpot
- [ ] Tested locally with `npm run dev`
- [ ] Manual trigger tested and working
- [ ] Code pushed to GitHub
- [ ] Deployed to Render
- [ ] Environment variables set in Render
- [ ] Health check responding

**All done? 🎉 Your automation is live!**
