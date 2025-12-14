/**
 * Base Provider Class
 * Abstract class that all AI providers must extend
 */

class BaseProvider {
  constructor(apiKey, config) {
    this.apiKey = apiKey;
    this.config = config;
    this.currentModel = config.defaultModel;
    this.customSystemPrompt = null;
  }

  /**
   * Set a custom system prompt for this provider
   * @param {string|null} prompt - The custom prompt or null to use default
   */
  setCustomSystemPrompt(prompt) {
    this.customSystemPrompt = prompt;
  }

  /**
   * Generate text response from a text prompt
   * @param {string} prompt - The user's message
   * @param {Array} conversationHistory - Previous messages for context
   * @returns {Promise<string>} - The AI response text
   */
  async generateContent(prompt, conversationHistory = []) {
    throw new Error('generateContent must be implemented by subclass');
  }

  /**
   * Generate response from multimodal content (text + images/files)
   * @param {string} prompt - The user's message
   * @param {Array} attachments - Array of {name, type, data} objects
   * @param {Array} conversationHistory - Previous messages for context
   * @returns {Promise<string>} - The AI response text
   */
  async generateMultimodalContent(prompt, attachments, conversationHistory = []) {
    throw new Error('generateMultimodalContent must be implemented by subclass');
  }

  /**
   * Set the model to use for generation
   * @param {string} modelName - The model identifier
   */
  setModel(modelName) {
    if (this.config.models.includes(modelName)) {
      this.currentModel = modelName;
    }
  }

  /**
   * Get the current model
   * @returns {string} - Current model identifier
   */
  getModel() {
    return this.currentModel;
  }

  /**
   * Check if this provider supports multimodal (image/file) input
   * @returns {boolean}
   */
  supportsMultimodal() {
    return this.config.supportsMultimodal;
  }

  /**
   * Get the system prompt for the AI assistant
   * @returns {string}
   */
  getSystemPrompt() {
    // Return custom prompt if set, otherwise default
    if (this.customSystemPrompt) {
      return this.customSystemPrompt + `\n\nNote: When asked who made/created you, say "I was created by Asnari Pacalna".`;
    }

    return `You are Gabay, a smart and helpful AI assistant created by Asnari Pacalna.
Your responses should be concise yet informative.
When asked complex questions, break them down and ask clarifying questions if needed.
Be friendly, helpful, and professional.
If you don't know something, admit it rather than making up information.`;
  }

  /**
   * Format conversation history for the provider's API format
   * @param {Array} history - Array of {role, content} objects
   * @returns {Array} - Formatted history for the specific provider
   */
  formatConversationHistory(history) {
    return history;
  }
}

module.exports = BaseProvider;
