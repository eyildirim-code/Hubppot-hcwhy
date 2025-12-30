const OpenAI = require('openai');

class OpenAIService {
  constructor(apiKey) {
    this.client = new OpenAI({
      apiKey: apiKey
    });
  }

  /**
   * Analyze contact data and generate appropriate tags
   * @param {Object} contactData - Extracted contact data
   * @returns {Promise<Array<string>>} Array of generated tags
   */
  async generateTags(contactData) {
    try {
      const prompt = this.buildPrompt(contactData);
      
      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that analyzes contact information and generates relevant tags for categorization and segmentation. 
            Your task is to evaluate the contact's features such as job title, industry, lifecycle stage, and lead status to determine appropriate tags.
            Return ONLY a comma-separated list of 3-5 relevant tags. Keep tags concise and professional.
            
            Example tags: high-priority, decision-maker, tech-industry, nurturing-needed, qualified-lead, enterprise, startup, small-business, etc.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 100
      });

      const tagsText = completion.choices[0].message.content.trim();
      const tags = this.parseTags(tagsText);
      
      console.log(`Generated tags for contact ${contactData.email}: ${tags.join(', ')}`);
      return tags;
    } catch (error) {
      console.error('Error generating tags with OpenAI:', error.message);
      // Return default tags in case of error
      return ['unclassified'];
    }
  }

  /**
   * Build a prompt for tag generation
   * @param {Object} contactData - Contact information
   * @returns {string} Formatted prompt
   */
  buildPrompt(contactData) {
    return `Analyze this contact and generate relevant tags for categorization:

Contact Information:
- Name: ${contactData.firstName} ${contactData.lastName}
- Email: ${contactData.email}
- Company: ${contactData.company}
- Job Title: ${contactData.jobTitle}
- Industry: ${contactData.industry}
- Lifecycle Stage: ${contactData.lifecycleStage}
- Lead Status: ${contactData.leadStatus}
- Website: ${contactData.website}
- Phone: ${contactData.phone}

Generate 3-5 relevant tags that would be useful for marketing, sales, or customer segmentation purposes.`;
  }

  /**
   * Parse tags from AI response
   * @param {string} tagsText - Raw tags text from AI
   * @returns {Array<string>} Cleaned tags array
   */
  parseTags(tagsText) {
    // Split by comma and clean up
    const tags = tagsText
      .split(',')
      .map(tag => tag.trim().toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/\s+/g, '-'))
      .filter(tag => tag.length > 0);
    
    return tags;
  }

  /**
   * Batch process multiple contacts
   * @param {Array<Object>} contactsData - Array of contact data
   * @returns {Promise<Array<Object>>} Array of {contactId, tags} objects
   */
  async batchGenerateTags(contactsData) {
    const results = [];
    
    for (const contactData of contactsData) {
      try {
        const tags = await this.generateTags(contactData);
        results.push({
          contactId: contactData.id,
          email: contactData.email,
          tags: tags
        });
        
        // Add a small delay to avoid rate limiting
        await this.delay(500);
      } catch (error) {
        console.error(`Error processing contact ${contactData.email}:`, error.message);
        results.push({
          contactId: contactData.id,
          email: contactData.email,
          tags: ['error-processing']
        });
      }
    }
    
    return results;
  }

  /**
   * Utility function to add delay
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = OpenAIService;
