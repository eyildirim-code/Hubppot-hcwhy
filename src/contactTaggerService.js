const HubSpotService = require('./hubspotService');
const OpenAIService = require('./openaiService');

class ContactTaggerService {
  constructor() {
    this.hubspotService = new HubSpotService();
    this.openaiService = new OpenAIService();
  }

  /**
   * Main process to fetch contacts, evaluate them, and update tags
   */
  async processContacts() {
    try {
      console.log('=== Starting Contact Tagging Process ===');
      console.log(`Started at: ${new Date().toISOString()}`);

      // Step 1: Fetch contacts from previous day
      const contacts = await this.hubspotService.getContactsFromPreviousDay();

      if (contacts.length === 0) {
        console.log('No contacts found from previous day. Nothing to process.');
        return {
          processed: 0,
          success: 0,
          failed: 0
        };
      }

      // Step 2: Process each contact
      let successCount = 0;
      let failedCount = 0;
      const RATE_LIMIT_DELAY = 500; // 500ms between requests (configurable)

      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        try {
          // Extract relevant data
          const contactData = this.hubspotService.extractContactData(contact);

          // Use OpenAI to evaluate and generate tags
          const tags = await this.openaiService.evaluateAndGenerateTags(contactData);

          // Update contact tags in HubSpot
          await this.hubspotService.updateContactTags(contact.id, tags);

          successCount++;
          
          // Add delay between requests to avoid rate limiting
          // Only delay if not the last contact
          if (i < contacts.length - 1) {
            await this.sleep(RATE_LIMIT_DELAY);
          }
        } catch (error) {
          console.error(`Failed to process contact ${contact.id}:`, error.message);
          failedCount++;
          
          // If it's a rate limit error, wait longer before continuing
          if (error.message && error.message.toLowerCase().includes('rate limit')) {
            console.warn('Rate limit detected, waiting 5 seconds before continuing...');
            await this.sleep(5000);
          }
        }
      }

      const summary = {
        processed: contacts.length,
        success: successCount,
        failed: failedCount,
        completedAt: new Date().toISOString()
      };

      console.log('=== Contact Tagging Process Completed ===');
      console.log(`Total processed: ${summary.processed}`);
      console.log(`Successful: ${summary.success}`);
      console.log(`Failed: ${summary.failed}`);
      console.log(`Completed at: ${summary.completedAt}`);

      return summary;
    } catch (error) {
      console.error('Error in contact tagging process:', error.message);
      throw error;
    }
  }

  /**
   * Sleep utility function
   * @param {number} ms - Milliseconds to sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = ContactTaggerService;
