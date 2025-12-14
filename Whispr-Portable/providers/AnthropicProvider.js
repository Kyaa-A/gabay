/**
 * Anthropic Provider
 * Uses Anthropic's Messages API (different format from OpenAI)
 */

const BaseProvider = require('./BaseProvider');

class AnthropicProvider extends BaseProvider {
  constructor(apiKey, config) {
    super(apiKey, config);
    this.endpoint = config.endpoint;
  }

  async generateContent(prompt, conversationHistory = []) {
    // Ensure prompt is a string
    const safePrompt = String(prompt || '');
    const messages = this.buildMessages(safePrompt, conversationHistory);

    const response = await fetch(`${this.endpoint}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.currentModel,
        max_tokens: 4096,
        system: this.getSystemPrompt(),
        messages: messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const text = String(data.content?.[0]?.text || '');
    return this.postProcessResponse(text, conversationHistory);
  }

  async generateMultimodalContent(prompt, attachments, conversationHistory = []) {
    // Ensure prompt is a string
    const safePrompt = String(prompt || '');
    const messages = this.buildMultimodalMessages(safePrompt, attachments, conversationHistory);

    const response = await fetch(`${this.endpoint}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.currentModel,
        max_tokens: 4096,
        system: this.getMultimodalSystemPrompt(),
        messages: messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const text = String(data.content?.[0]?.text || '');
    return this.postProcessResponse(text, conversationHistory);
  }

  buildMessages(prompt, conversationHistory) {
    const messages = [];

    // Add conversation history - ensure all content is string
    for (const turn of conversationHistory.slice(-8)) {
      messages.push({ role: 'user', content: String(turn.user || '') });
      messages.push({ role: 'assistant', content: String(turn.assistant || '') });
    }

    // Add current message
    messages.push({ role: 'user', content: String(prompt || '') });

    return messages;
  }

  buildMultimodalMessages(prompt, attachments, conversationHistory) {
    const messages = [];

    // Add conversation history - ensure all content is string
    for (const turn of conversationHistory.slice(-8)) {
      messages.push({ role: 'user', content: String(turn.user || '') });
      messages.push({ role: 'assistant', content: String(turn.assistant || '') });
    }

    // Build content array for multimodal message (Anthropic format)
    const content = [];

    // Add images first
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        if (attachment.type.startsWith('image/')) {
          content.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: attachment.type,
              data: attachment.data,
            },
          });
        }
      }
    }

    // Add text - ensure it's a string
    content.push({
      type: 'text',
      text: String(prompt || 'Please analyze the attached file(s) thoroughly.'),
    });

    messages.push({ role: 'user', content: content });

    return messages;
  }

  getSystemPrompt() {
    // Check for custom system prompt from BaseProvider
    if (this.customSystemPrompt) {
      return this.customSystemPrompt + `\n\nNote: When asked who made/created you, say "I was created by Asnari Pacalna".`;
    }

    return `You are Gabay, a smart and helpful AI assistant. Be concise, clear, and conversational.

## Response Guidelines

**Be Brief**: Give short, focused answers. Skip lengthy explanations unless asked. Get to the point quickly.

**Be Conversational**: Talk naturally like a helpful friend, not a textbook. Use simple language.

**Be Smart**: Think through questions carefully, but share conclusions directly without showing all your work.

**Ask First**: For complex requests (like building a resume, writing code, planning something), ask 1-2 clarifying questions BEFORE diving into a long response. Don't assume - confirm what the user needs.

**Format Wisely**:
- Use bullet points sparingly, only when listing 3+ items
- Avoid walls of text - keep paragraphs short (2-3 sentences max)
- Don't use headers/sections for simple answers

## Behavioral Rules

- When asked who made/created you: "I was created by Asnari Pacalna"
- Never repeat your introduction
- Be direct and confident
- If unsure, admit it briefly and suggest how to find the answer`;
  }

  getMultimodalSystemPrompt() {
    // Check for custom system prompt from BaseProvider
    if (this.customSystemPrompt) {
      return this.customSystemPrompt + `\n\nNote: When asked who made/created you, say "I was created by Asnari Pacalna".\n\nYou have vision capabilities - you can analyze images and documents.`;
    }

    return `You are Gabay, a smart and helpful AI assistant with vision capabilities. Be concise, clear, and conversational.

## Response Guidelines

**Be Brief**: Give short, focused answers. Skip lengthy explanations unless asked.

**Be Conversational**: Talk naturally like a helpful friend. Use simple language.

**Ask First**: For complex requests, ask 1-2 clarifying questions BEFORE diving into a long response.

**Format Wisely**:
- Use bullet points sparingly
- Keep paragraphs short (2-3 sentences max)
- Don't over-format simple answers

## Vision & Document Analysis

When analyzing images/documents:
- Describe what you see concisely
- Focus on what's relevant to the user's question
- For code: identify issues briefly, suggest fixes
- For documents: extract key info, don't summarize everything

## Behavioral Rules

- When asked who made/created you: "I was created by Asnari Pacalna"
- Never repeat your introduction
- Be direct and confident`;
  }

  postProcessResponse(text, conversationHistory) {
    // Ensure text is a string
    let safeText = String(text || '');

    // Only strip repetitive self-introductions (not creator mentions)
    // This prevents the AI from saying "Hi, I'm Gabay" every message
    if (conversationHistory.length > 0 && safeText) {
      const lines = safeText.split(/\r?\n/);
      const filtered = lines.filter((line, idx) => {
        // Only filter out generic intro on first line
        if (idx === 0 && /^(hi|hello|hey)?,?\s*(i\'m|i am)\s+(whispr|gabay)/i.test(line.trim())) {
          return false;
        }
        return true;
      });
      safeText = filtered.join('\n').trim();
    }
    return safeText;
  }
}

module.exports = AnthropicProvider;
