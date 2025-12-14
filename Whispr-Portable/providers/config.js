/**
 * AI Provider Configurations
 * Defines metadata, endpoints, and models for each supported provider
 */

const PROVIDERS = {
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    models: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'],
    defaultModel: 'gemini-2.0-flash',
    requiresApiKey: true,
    apiKeyName: 'GOOGLE_API_KEY',
    apiKeyLink: 'https://aistudio.google.com/app/apikey',
    supportsMultimodal: true,
    openaiCompatible: false,
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    endpoint: 'https://api.groq.com/openai/v1',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
    defaultModel: 'llama-3.3-70b-versatile',
    requiresApiKey: true,
    apiKeyName: 'GROQ_API_KEY',
    apiKeyLink: 'https://console.groq.com/keys',
    supportsMultimodal: false,
    openaiCompatible: true,
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4o-mini',
    requiresApiKey: true,
    apiKeyName: 'OPENAI_API_KEY',
    apiKeyLink: 'https://platform.openai.com/api-keys',
    supportsMultimodal: true,
    openaiCompatible: true,
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    endpoint: 'https://api.anthropic.com/v1',
    models: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
    defaultModel: 'claude-sonnet-4-20250514',
    requiresApiKey: true,
    apiKeyName: 'ANTHROPIC_API_KEY',
    apiKeyLink: 'https://console.anthropic.com/settings/keys',
    supportsMultimodal: true,
    openaiCompatible: false,
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    endpoint: 'https://openrouter.ai/api/v1',
    models: ['anthropic/claude-3.5-sonnet', 'openai/gpt-4o', 'google/gemini-pro-1.5', 'meta-llama/llama-3.1-70b-instruct'],
    defaultModel: 'anthropic/claude-3.5-sonnet',
    requiresApiKey: true,
    apiKeyName: 'OPENROUTER_API_KEY',
    apiKeyLink: 'https://openrouter.ai/keys',
    supportsMultimodal: true,
    openaiCompatible: true,
    extraHeaders: {
      'HTTP-Referer': 'https://gabay.app',
      'X-Title': 'Gabay AI Assistant',
    },
  },
};

module.exports = { PROVIDERS };
