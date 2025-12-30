const HubSpotService = require('./services/hubspot.service');
const OpenAIService = require('./services/openai.service');

class ContactTaggingOrchestrator {
  constructor(hubspotToken, openaiKey) {
    this.hubspotService = new HubSpotService(hubspotToken);
    this.openaiService = new OpenAIService(openaiKey);
  }

  /**
   * Main process to fetch contacts, generate tags, and update HubSpot
   * @returns {Promise<Object>} Process results
   */
  async processContacts() {
    const startTime = new Date();
    console.log('\n=== Starting Contact Tagging Process ===');
    console.log(`Start time: ${startTime.toISOString()}\n`);

    try {
      // Step 1: Fetch contacts from previous day
      console.log('Step 1: Fetching contacts from HubSpot...');
      const contacts = await this.hubspotService.getContactsFromPreviousDay();
      
      if (contacts.length === 0) {
        console.log('No contacts found from the previous day.');
        return {
          success: true,
          processedCount: 0,
          message: 'No contacts to process'
        };
      }

      // Step 2: Extract relevant data from contacts
      console.log('\nStep 2: Extracting contact data...');
      const contactsData = contacts.map(contact => 
        this.hubspotService.extractContactData(contact)
      );
      console.log(`Extracted data from ${contactsData.length} contacts`);

      // Step 3: Generate tags using OpenAI
      console.log('\nStep 3: Generating tags with AI...');
      const tagResults = await this.openaiService.batchGenerateTags(contactsData);
      console.log(`Generated tags for ${tagResults.length} contacts`);

      // Step 4: Update contacts in HubSpot with new tags
      console.log('\nStep 4: Updating contacts in HubSpot...');
      const updateResults = await this.hubspotService.batchUpdateContacts(tagResults);
      
      // Calculate statistics
      const successCount = updateResults.filter(r => r.success).length;
      const failureCount = updateResults.filter(r => !r.success).length;

      const endTime = new Date();
      const duration = (endTime - startTime) / 1000;

      console.log('\n=== Process Complete ===');
      console.log(`Total contacts processed: ${contacts.length}`);
      console.log(`Successfully updated: ${successCount}`);
      console.log(`Failed updates: ${failureCount}`);
      console.log(`Duration: ${duration.toFixed(2)} seconds`);
      console.log(`End time: ${endTime.toISOString()}\n`);

      return {
        success: true,
        processedCount: contacts.length,
        successCount,
        failureCount,
        duration,
        details: updateResults
      };

    } catch (error) {
      console.error('\n=== Process Failed ===');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      
      return {
        success: false,
        error: error.message,
        processedCount: 0
      };
    }
  }

  /**
   * Get process summary for monitoring
   * @returns {Object} Current status
   */
  getStatus() {
    return {
      hubspotConnected: !!this.hubspotService,
      openaiConnected: !!this.openaiService,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = ContactTaggingOrchestrator;
