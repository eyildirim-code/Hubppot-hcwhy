const { Client } = require('@hubspot/api-client');

class HubSpotService {
  constructor(accessToken) {
    this.client = new Client({ accessToken });
  }

  /**
   * Fetch contacts modified in the previous day
   * @returns {Promise<Array>} Array of contacts
   */
  async getContactsFromPreviousDay() {
    try {
      // Calculate timestamp for previous day (24 hours ago)
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const yesterdayTimestamp = yesterday.getTime();

      console.log(`Fetching contacts modified after: ${yesterday.toISOString()}`);

      // Fetch contacts modified in the last 24 hours
      const response = await this.client.crm.contacts.searchApi.doSearch({
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'lastmodifieddate',
                operator: 'GTE',
                value: yesterdayTimestamp.toString()
              }
            ]
          }
        ],
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
          'hs_lead_status'
        ],
        limit: 100
      });

      console.log(`Found ${response.results.length} contacts from previous day`);
      return response.results;
    } catch (error) {
      console.error('Error fetching contacts from HubSpot:', error.message);
      throw error;
    }
  }

  /**
   * Extract relevant data from contact
   * @param {Object} contact - HubSpot contact object
   * @returns {Object} Extracted contact data
   */
  extractContactData(contact) {
    const properties = contact.properties || {};
    return {
      id: contact.id,
      email: properties.email || 'N/A',
      firstName: properties.firstname || '',
      lastName: properties.lastname || '',
      company: properties.company || 'N/A',
      phone: properties.phone || 'N/A',
      jobTitle: properties.jobtitle || 'N/A',
      website: properties.website || 'N/A',
      industry: properties.industry || 'N/A',
      lifecycleStage: properties.lifecyclestage || 'N/A',
      leadStatus: properties.hs_lead_status || 'N/A'
    };
  }

  /**
   * Add or update tags for a contact
   * @param {string} contactId - HubSpot contact ID
   * @param {Array<string>} tags - Array of tags to add
   * @returns {Promise<Object>} Updated contact
   */
  async updateContactTags(contactId, tags) {
    try {
      // In HubSpot, tags are typically stored in a custom property or using engagements
      // Here we'll use a custom multi-checkbox property called 'ai_generated_tags'
      // You may need to create this property in HubSpot first
      
      const properties = {
        ai_generated_tags: tags.join(';')
      };

      const response = await this.client.crm.contacts.basicApi.update(contactId, {
        properties
      });

      console.log(`Updated tags for contact ${contactId}: ${tags.join(', ')}`);
      return response;
    } catch (error) {
      console.error(`Error updating contact ${contactId}:`, error.message);
      throw error;
    }
  }

  /**
   * Batch update multiple contacts with tags
   * @param {Array<Object>} updates - Array of {contactId, tags} objects
   * @returns {Promise<Array>} Results of updates
   */
  async batchUpdateContacts(updates) {
    const results = [];
    
    for (const update of updates) {
      try {
        const result = await this.updateContactTags(update.contactId, update.tags);
        results.push({ success: true, contactId: update.contactId, result });
      } catch (error) {
        results.push({ success: false, contactId: update.contactId, error: error.message });
      }
    }

    return results;
  }
}

module.exports = HubSpotService;
