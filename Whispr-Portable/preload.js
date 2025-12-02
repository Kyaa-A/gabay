const { contextBridge, ipcRenderer, clipboard } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // AI communication methods
  sendMessage: (message) => ipcRenderer.invoke("ai-message", message),

  // AI communication with file attachments (multimodal)
  sendMessageWithAttachments: (message, attachments) =>
    ipcRenderer.invoke("ai-message-multimodal", { message, attachments }),

  // Clear AI conversation history (for switching conversations)
  clearConversationHistory: () => ipcRenderer.invoke("clear-conversation-history"),

  // Window control methods
  closeWindow: () => ipcRenderer.send("close-window"),
  minimizeWindow: () => ipcRenderer.send("minimize-window"),

  // API Key management
  getApiKey: () => ipcRenderer.invoke("get-api-key"),
  setApiKey: (key) => ipcRenderer.invoke("set-api-key", key),

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
