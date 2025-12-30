const OpenAI = require('openai');
const config = require('./config');

class OpenAIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: config.openaiApiKey
    });
  }

  /**
   * Evaluate contact data and generate appropriate tags
   * @param {Object} contactData - Contact data to evaluate
   * @returns {Promise<Array<string>>} Array of suggested tags
   */
  async evaluateAndGenerateTags(contactData) {
    try {
      console.log(`Evaluating contact: ${contactData.email || contactData.id}`);

      const prompt = this.buildEvaluationPrompt(contactData);

      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a CRM data analyst specialized in evaluating and tagging contacts. 
Your task is to analyze contact information and assign relevant tags based on their characteristics.
Consider factors like industry, job title, lifecycle stage, and other available data.
Return tags as a JSON array of strings. Be concise and use only relevant business tags.
Example tags: "high-value", "decision-maker", "technical", "c-level", "hot-lead", "nurture", "enterprise", "smb", "needs-follow-up"`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      });

      const response = completion.choices[0].message.content;
      console.log(`OpenAI response: ${response}`);

      // Parse the response to extract tags
      const tags = this.parseTagsFromResponse(response);
      
      console.log(`Generated tags for contact ${contactData.id}: ${tags.join(', ')}`);
      return tags;
    } catch (error) {
      console.error('Error calling OpenAI API:', error.message);
      throw error;
    }
  }

  /**
   * Build evaluation prompt from contact data
   * @param {Object} contactData - Contact data
   * @returns {string} Formatted prompt
   */
  buildEvaluationPrompt(contactData) {
    return `Analyze this contact and suggest relevant tags:

Contact Information:
- Name: ${contactData.firstname} ${contactData.lastname}
- Email: ${contactData.email}
- Job Title: ${contactData.jobtitle || 'Not provided'}
- Company: ${contactData.company || 'Not provided'}
- Industry: ${contactData.industry || 'Not provided'}
- Lifecycle Stage: ${contactData.lifecyclestage || 'Not provided'}
- Lead Status: ${contactData.leadStatus || 'Not provided'}
- Phone: ${contactData.phone ? 'Provided' : 'Not provided'}
- Website: ${contactData.website || 'Not provided'}

Please analyze this contact and return a JSON array of 2-5 relevant tags that would help in segmentation and marketing.
Focus on: decision-making level, lead quality, engagement potential, and business characteristics.

Return ONLY a valid JSON array of strings, for example: ["tag1", "tag2", "tag3"]`;
  }

  /**
   * Parse tags from OpenAI response
   * @param {string} response - OpenAI response
   * @returns {Array<string>} Parsed tags
   */
  parseTagsFromResponse(response) {
    try {
      // Try to parse as JSON first
      const cleanedResponse = response.trim();
      
      // Extract JSON array from response
      const jsonMatch = cleanedResponse.match(/\[.*\]/s);
      if (jsonMatch) {
        const tags = JSON.parse(jsonMatch[0]);
        if (Array.isArray(tags)) {
          return tags.map(tag => tag.toLowerCase().trim());
        }
      }

      // Fallback: split by common separators if JSON parsing fails
      return cleanedResponse
        .replace(/[\[\]"]/g, '')
        .split(/[,\n]/)
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);
    } catch (error) {
      console.error('Error parsing tags from response:', error.message);
      // Return general-purpose tag if parsing fails
      // Note: Ensure this tag exists in your HubSpot account
      return ['ai-review-needed'];
    }
  }
}

module.exports = OpenAIService;
