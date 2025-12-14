/**
 * Provider Factory
 * Creates the appropriate provider instance based on provider ID
 */

const { PROVIDERS } = require('./config');
const GeminiProvider = require('./GeminiProvider');
const OpenAICompatibleProvider = require('./OpenAICompatibleProvider');
const AnthropicProvider = require('./AnthropicProvider');

/**
 * Create a provider instance
 * @param {string} providerId - The provider identifier (e.g., 'gemini', 'groq', 'openai')
 * @param {string} apiKey - The API key for the provider
 * @returns {BaseProvider} - The provider instance
 */
function createProvider(providerId, apiKey) {
  const config = PROVIDERS[providerId];
  if (!config) {
    throw new Error(`Unknown provider: ${providerId}`);
  }

  if (!apiKey) {
    throw new Error(`API key required for provider: ${providerId}`);
  }

  switch (providerId) {
    case 'gemini':
      return new GeminiProvider(apiKey, config);
    case 'anthropic':
      return new AnthropicProvider(apiKey, config);
    case 'groq':
    case 'openai':
    case 'openrouter':
      return new OpenAICompatibleProvider(apiKey, config);
    default:
      throw new Error(`Provider ${providerId} not implemented`);
  }
}

/**
 * Get list of available providers
 * @returns {Object} - Provider configurations
 */
function getProviders() {
  return PROVIDERS;
}

/**
 * Get a specific provider's configuration
 * @param {string} providerId - The provider identifier
 * @returns {Object|null} - Provider configuration or null if not found
 */
function getProviderConfig(providerId) {
  return PROVIDERS[providerId] || null;
}

module.exports = {
  createProvider,
  getProviders,
  getProviderConfig,
  PROVIDERS,
};
