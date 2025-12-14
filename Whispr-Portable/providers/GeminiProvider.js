/**
 * Google Gemini Provider
 * Uses the @google/generative-ai SDK
 */

const BaseProvider = require('./BaseProvider');

class GeminiProvider extends BaseProvider {
  constructor(apiKey, config) {
    super(apiKey, config);
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ model: this.currentModel });
  }

  async generateContent(prompt, conversationHistory = []) {
    // Ensure prompt is a string
    const safePrompt = String(prompt || '');
    const fullPrompt = this.buildPrompt(safePrompt, conversationHistory);
    const result = await this.model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    return this.postProcessResponse(String(text || ''), conversationHistory);
  }

  async generateMultimodalContent(prompt, attachments, conversationHistory = []) {
    const contentParts = [];

    // Add file attachments as inline data
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        contentParts.push({
          inlineData: {
            data: attachment.data,
            mimeType: attachment.type,
          },
        });
      }
    }

    // Add text prompt - ensure it's a string
    const safePrompt = String(prompt || 'Please analyze the attached file(s) thoroughly.');
    const fullPrompt = this.buildPrompt(safePrompt, conversationHistory, true);
    contentParts.push({ text: fullPrompt });

    const result = await this.model.generateContent(contentParts);
    const response = await result.response;
    const text = response.text();
    return this.postProcessResponse(String(text || ''), conversationHistory);
  }

  setModel(modelName) {
    super.setModel(modelName);
    this.model = this.client.getGenerativeModel({ model: this.currentModel });
  }

  buildPrompt(message, conversationHistory, isMultimodal = false) {
    // Ensure message is a string
    const safeMessage = String(message || '');

    const historyText = conversationHistory
      .slice(-8)
      .map((turn, index) => `${index + 1}. User: ${String(turn.user || '')}\n   Assistant: ${String(turn.assistant || '')}`)
      .join('\n');

    const systemPrompt = isMultimodal ? this.getMultimodalSystemPrompt() : this.getSystemPrompt();

    return `${systemPrompt}

---
CONVERSATION HISTORY (last ${Math.min(conversationHistory.length, 8)} exchanges):
${historyText || '(This is the start of the conversation)'}

---
USER: ${safeMessage}

${isMultimodal ? 'Analyze the provided content and respond thoughtfully:' : 'Respond thoughtfully:'}`;
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

module.exports = GeminiProvider;
