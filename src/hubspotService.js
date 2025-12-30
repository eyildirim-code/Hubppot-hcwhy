const hubspot = require('@hubspot/api-client');
const config = require('./config');

class HubSpotService {
  constructor() {
    this.client = new hubspot.Client({
      accessToken: config.hubspotAccessToken
    });
  }

  /**
   * Get contacts modified in the previous day
   * @returns {Promise<Array>} Array of contacts
   */
  async getContactsFromPreviousDay() {
    try {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const today = new Date(yesterday);
      today.setDate(today.getDate() + 1);
      
      const yesterdayTimestamp = yesterday.getTime();
      const todayTimestamp = today.getTime();

      console.log(`Fetching contacts modified between ${yesterday.toISOString()} and ${today.toISOString()}`);

      // Search for contacts modified in the previous day
      const filterGroups = [
        {
          filters: [
            {
              propertyName: 'lastmodifieddate',
              operator: 'GTE',
              value: yesterdayTimestamp.toString()
            },
            {
              propertyName: 'lastmodifieddate',
              operator: 'LT',
              value: todayTimestamp.toString()
            }
          ]
        }
      ];

      const publicObjectSearchRequest = {
        filterGroups,
        properties: [
          'firstname',
          'lastname',
          'email',
          'phone',
          'company',
          'jobtitle',
          'website',
          'industry',
          'lifecyclestage',
          'hs_lead_status'
        ],
        limit: 100
      };

      const response = await this.client.crm.contacts.searchApi.doSearch(publicObjectSearchRequest);
      
      console.log(`Found ${response.results.length} contacts from previous day`);
      return response.results;
    } catch (error) {
      console.error('Error fetching contacts from HubSpot:', error.message);
      throw error;
    }
  }

  /**
   * Extract relevant data from contact for AI evaluation
   * @param {Object} contact - HubSpot contact object
   * @returns {Object} Extracted contact data
   */
  extractContactData(contact) {
    const properties = contact.properties;
    return {
      id: contact.id,
      firstname: properties.firstname || '',
      lastname: properties.lastname || '',
      email: properties.email || '',
      phone: properties.phone || '',
      company: properties.company || '',
      jobtitle: properties.jobtitle || '',
      website: properties.website || '',
      industry: properties.industry || '',
      lifecyclestage: properties.lifecyclestage || '',
      leadStatus: properties.hs_lead_status || ''
    };
  }

  /**
   * Add or update tags for a contact
   * @param {string} contactId - Contact ID
   * @param {Array<string>} tags - Array of tag names
   */
  async updateContactTags(contactId, tags) {
    try {
      console.log(`Updating contact ${contactId} with tags: ${tags.join(', ')}`);

      // In HubSpot, we use a custom property for tags
      // You need to create this property in HubSpot first:
      // Settings → Properties → Contact Properties → Create property
      // - Name: Tags
      // - Field type: Single-line text
      // - Internal name: tags
      
      const properties = {
        tags: tags.join(';') // Store as semicolon-separated string
      };

      await this.client.crm.contacts.basicApi.update(contactId, {
        properties
      });

      console.log(`Successfully updated tags for contact ${contactId}`);
    } catch (error) {
      // Handle the case where the tags property doesn't exist
      if (error.message && error.message.includes('Property values were not valid')) {
        console.error(`Error: The 'tags' property may not exist in HubSpot. Please create it first.`);
        console.error(`See README.md for instructions on creating the tags property.`);
      } else {
        console.error(`Error updating tags for contact ${contactId}:`, error.message);
      }
      // Don't throw - log the error and continue with other contacts
      console.warn(`Skipping tag update for contact ${contactId}`);
    }
  }
}

module.exports = HubSpotService;
