const { contextBridge, ipcRenderer, clipboard } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // AI communication methods
  sendMessage: (message, systemPrompt = null) => ipcRenderer.invoke("ai-message", { message, systemPrompt }),

  // AI communication with file attachments (multimodal)
  sendMessageWithAttachments: (message, attachments, systemPrompt = null) =>
    ipcRenderer.invoke("ai-message-multimodal", { message, attachments, systemPrompt }),

  // Clear AI conversation history (for switching conversations)
  clearConversationHistory: () => ipcRenderer.invoke("clear-conversation-history"),

  // Window control methods
  closeWindow: () => ipcRenderer.send("close-window"),
  minimizeWindow: () => ipcRenderer.send("minimize-window"),

  // API Key management (legacy)
  getApiKey: () => ipcRenderer.invoke("get-api-key"),
  setApiKey: (key) => ipcRenderer.invoke("set-api-key", key),

  // Multi-provider management
  getProviders: () => ipcRenderer.invoke("get-providers"),
  getProviderSettings: () => ipcRenderer.invoke("get-provider-settings"),
  setProvider: (providerId) => ipcRenderer.invoke("set-provider", providerId),
  setModel: (modelName) => ipcRenderer.invoke("set-model", modelName),
  setProviderApiKey: (providerId, apiKey) =>
    ipcRenderer.invoke("set-provider-api-key", { providerId, apiKey }),
  getProviderApiKey: (providerId) =>
    ipcRenderer.invoke("get-provider-api-key", providerId),

  // Open external links in default browser
  openExternal: (url) => ipcRenderer.invoke("open-external", url),

  // Clipboard methods with error handling for WSL compatibility
  writeText: (text) => {
    try {
      clipboard.writeText(text);
      // Verify the write worked by reading back
      const written = clipboard.readText();
      return written === text;
    } catch (err) {
      console.error("Clipboard write failed:", err);
      return false;
    }
  },
  readText: () => {
    try {
      return clipboard.readText();
    } catch (err) {
      console.error("Clipboard read failed:", err);
      return "";
    }
  },
});
