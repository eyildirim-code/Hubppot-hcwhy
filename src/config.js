require('dotenv').config();

class Config {
  constructor() {
    this.hubspotAccessToken = process.env.HUBSPOT_ACCESS_TOKEN;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.port = process.env.PORT || 3000;
    this.nodeEnv = process.env.NODE_ENV || 'development';
    this.cronSchedule = process.env.CRON_SCHEDULE || '0 0 * * *'; // Default: daily at midnight
    
    this.validate();
  }

  validate() {
    const required = [
      'HUBSPOT_ACCESS_TOKEN',
      'OPENAI_API_KEY'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}

module.exports = new Config();
