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

      for (const contact of contacts) {
        try {
          // Extract relevant data
          const contactData = this.hubspotService.extractContactData(contact);

          // Use OpenAI to evaluate and generate tags
          const tags = await this.openaiService.evaluateAndGenerateTags(contactData);

          // Update contact tags in HubSpot
          await this.hubspotService.updateContactTags(contact.id, tags);

          successCount++;
          
          // Add a small delay to avoid rate limiting
          await this.sleep(1000);
        } catch (error) {
          console.error(`Failed to process contact ${contact.id}:`, error.message);
          failedCount++;
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
