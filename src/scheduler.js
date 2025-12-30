const cron = require('node-cron');
const config = require('./config');
const ContactTaggerService = require('./contactTaggerService');

class Scheduler {
  constructor() {
    this.contactTaggerService = new ContactTaggerService();
  }

  /**
   * Start the scheduled job
   */
  start() {
    console.log('Starting HubSpot Contact Tagger Scheduler');
    console.log(`Cron schedule: ${config.cronSchedule}`);
    console.log(`Environment: ${config.nodeEnv}`);

    // Validate cron expression
    if (!cron.validate(config.cronSchedule)) {
      throw new Error(`Invalid cron schedule: ${config.cronSchedule}`);
    }

    // Schedule the task
    const task = cron.schedule(config.cronSchedule, async () => {
      console.log('\n=== Scheduled Task Triggered ===');
      console.log(`Time: ${new Date().toISOString()}`);
      
      try {
        await this.contactTaggerService.processContacts();
      } catch (error) {
        console.error('Error in scheduled task:', error);
      }
    });

    console.log('Scheduler started successfully');
    console.log('Waiting for scheduled execution...');

    // Run immediately on startup (optional, for testing)
    if (config.nodeEnv === 'development') {
      console.log('\nRunning initial execution in development mode...');
      this.contactTaggerService.processContacts()
        .then(() => console.log('Initial execution completed'))
        .catch(error => console.error('Initial execution failed:', error));
    }

    return task;
  }
}

module.exports = Scheduler;
