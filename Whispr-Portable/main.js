const {
  app,
  BrowserWindow,
  globalShortcut,
  Tray,
  Menu,
  screen,
  ipcMain,
  shell,
} = require("electron");

const path = require("path");
const fs = require("fs");

// Try multiple paths for .env file
const possibleEnvPaths = [
  path.join(__dirname, '../.env'),                    // Development
  path.join(__dirname, '.env'),                       // Same directory as main.js
  path.join(process.cwd(), '.env'),                   // Project root
];

let envLoaded = false;
for (const envPath of possibleEnvPaths) {
  try {
    require('dotenv').config({ path: envPath });
    if (process.env.GOOGLE_API_KEY) {
      console.log(`Environment loaded from: ${envPath}`);
      envLoaded = true;
      break;
    }
  } catch (e) {
    // Continue to next path
  }
}

// User data path for storing settings (initialized after app ready)
let userDataPath = null;
let settingsPath = null;

// Initialize settings paths (call after app is ready)
function initSettingsPaths() {
  if (!userDataPath) {
    try {
      userDataPath = app.getPath("userData");
      settingsPath = path.join(userDataPath, "settings.json");
      // Ensure directory exists
      if (!fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath, { recursive: true });
      }
    } catch (error) {
      console.error("Failed to initialize settings path:", error);
      // Fallback to temp directory if userData fails
      userDataPath = app.getPath("temp");
      settingsPath = path.join(userDataPath, "gabay-settings.json");
    }
  }
}

// Load/save settings
function loadSettings() {
  try {
    initSettingsPaths();
    if (settingsPath && fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, "utf8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to load settings:", e);
  }
  return {};
}

function saveSettings(settings) {
  try {
    initSettingsPaths();
    if (!settingsPath) return false;
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (e) {
    console.error("Failed to save settings:", e);
    return false;
  }
}

// isDev will be set after app is ready
let isDev = process.env.ELECTRON_IS_DEV === "true";

// Disable GPU acceleration for WSL compatibility
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');

// Catch uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit - keep app running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

let mainWindow = null;
let tray = null;
let isWindowVisible = false;

function createWindow() {
  // Get the primary display's work area
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } =
    primaryDisplay.workAreaSize;

  // Window dimensions
  const windowWidth = 400;
  const windowHeight = 600;

  // Position window at center for WSL compatibility
  const x = Math.floor((screenWidth - windowWidth) / 2);
  const y = Math.floor((screenHeight - windowHeight) / 2);

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    minWidth: 350,
    minHeight: 400,
    maxWidth: screenWidth,
    maxHeight: screenHeight,
    x: x,
    y: y,
    frame: false,
    resizable: true,
    maximizable: false,
    alwaysOnTop: true,
    show: true,
    skipTaskbar: true,
    transparent: true,
    backgroundColor: '#00000000',
    icon: path.join(__dirname, "../src/Image/Whispr-no-bg.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Keep window within screen bounds when moved or resized
  mainWindow.on('will-resize', (event, newBounds) => {
    const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
    if (newBounds.x + newBounds.width > sw || newBounds.y + newBounds.height > sh) {
      event.preventDefault();
      const constrainedBounds = {
        x: Math.min(newBounds.x, sw - newBounds.width),
        y: Math.min(newBounds.y, sh - newBounds.height),
        width: Math.min(newBounds.width, sw - newBounds.x),
        height: Math.min(newBounds.height, sh - newBounds.y),
      };
      mainWindow.setBounds(constrainedBounds);
    }
  });

  mainWindow.on('will-move', (event, newBounds) => {
    const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
    const bounds = mainWindow.getBounds();
    if (newBounds.x + bounds.width > sw || newBounds.y + bounds.height > sh || newBounds.x < 0 || newBounds.y < 0) {
      event.preventDefault();
      mainWindow.setBounds({
        x: Math.max(0, Math.min(newBounds.x, sw - bounds.width)),
        y: Math.max(0, Math.min(newBounds.y, sh - bounds.height)),
        width: bounds.width,
        height: bounds.height,
      });
    }
  });


  // Load the app with graceful fallback
  const devUrl = "http://localhost:3000";
  // In production, use app.getAppPath() which points to resources/app in packaged build
  const prodPath = app.isPackaged
    ? path.join(app.getAppPath(), "build", "index.html")
    : path.join(__dirname, "../build/index.html");
  const fileUrl = `file://${prodPath}`;
  const targetUrl = isDev ? devUrl : fileUrl;

  console.log("Loading app from:", targetUrl);
  console.log("Is packaged:", app.isPackaged);
  console.log("App path:", app.getAppPath());
  console.log("Prod path:", prodPath);
  console.log("File exists:", fs.existsSync(prodPath));

  mainWindow.loadURL(targetUrl);

  // Show window when content is ready
  mainWindow.webContents.on("did-finish-load", () => {
    console.log("Content loaded successfully");
    if (!mainWindow.isVisible()) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // If dev server is not running, fall back to local build automatically
  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDesc, validatedUrl) => {
    console.log("Primary load failed:", errorCode, errorDesc, "URL:", validatedUrl);
    if (targetUrl !== fileUrl && !validatedUrl.startsWith("file://")) {
      console.log("Falling back to local build:", fileUrl);
      mainWindow.loadURL(fileUrl);
    } else {
      // If even local file fails, show an error page
      console.error("Failed to load app - file not found:", prodPath);
      mainWindow.loadURL(`data:text/html,<html><body style="background:#1f2937;color:white;font-family:sans-serif;padding:20px;"><h1>Error Loading App</h1><p>Could not find: ${prodPath}</p><p>Please ensure the app was built correctly.</p></body></html>`);
    }
  });

  // Hide window instead of closing
  mainWindow.on("close", (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      hideWindow();
    }
  });

  // Handle window events
  mainWindow.on("blur", () => {
    // Optional: Hide window when it loses focus
    // hideWindow();
  });

  // Don't auto-open dev tools
  // if (isDev) {
  //   mainWindow.webContents.openDevTools();
  // }

  // Set the window as visible on startup
  isWindowVisible = true;
}

function showWindow() {
  console.log("showWindow called");
  if (mainWindow) {
    // For WSL compatibility: restore, show, then focus with delay
    mainWindow.restore();
    mainWindow.show();
    mainWindow.setAlwaysOnTop(true);
    // Small delay to ensure window appears on WSL
    setTimeout(() => {
      mainWindow.focus();
      mainWindow.moveTop();
    }, 100);
    isWindowVisible = true;
    console.log("Window shown and focused");
  }
}

function hideWindow() {
  console.log("hideWindow called");
  if (mainWindow) {
    // Just hide without minimize for better WSL compatibility
    mainWindow.hide();
    isWindowVisible = false;
    console.log("Window hidden");
  }
}

function toggleWindow() {
  console.log("Toggle called, mainWindow exists:", !!mainWindow, "isWindowVisible:", isWindowVisible);
  if (mainWindow) {
    // Use the tracked flag for WSL compatibility instead of isVisible()
    if (isWindowVisible) {
      console.log("Hiding window...");
      hideWindow();
    } else {
      console.log("Showing window...");
      showWindow();
    }
  }
}

function createTray() {
  try {
    const { nativeImage } = require("electron");

    // Try to use custom icon, fallback to simple icon if it fails
    let icon;
    try {
      icon = nativeImage.createFromPath(path.join(__dirname, "../src/Image/Whispr-no-bg.png"));
      // Resize for tray (16x16)
      icon = icon.resize({ width: 16, height: 16 });
    } catch (error) {
      // Fallback to simple blue square icon
      icon = nativeImage.createFromDataURL(
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAAB5JREFUOJFj/P//P8NAAiaGUQNGDRg1gHIwasCoAYQBAF8QIAOk8LHhAAAAAElFTkSuQmCC"
      );
    }

    tray = new Tray(icon);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Show/Hide Chatbot",
        click: toggleWindow,
      },
      {
        type: "separator",
      },
      {
        label: "Quit",
        click: () => {
          app.isQuiting = true;
          app.quit();
        },
      },
    ]);

    tray.setToolTip("Desktop Chatbot");
    tray.setContextMenu(contextMenu);

    // Show/hide on tray click
    tray.on("click", toggleWindow);
  } catch (error) {
    console.log("Tray creation failed:", error.message);
  }
}

function registerGlobalShortcuts() {
  // Register Ctrl+L to toggle window
  const ret = globalShortcut.register("CommandOrControl+L", () => {
    toggleWindow();
  });

  if (!ret) {
    console.log("Global shortcut registration failed");
  } else {
    console.log("Global shortcut Ctrl+L registered successfully");
  }

  // Register Ctrl+Shift+I to open DevTools (for debugging)
  globalShortcut.register("CommandOrControl+Shift+I", () => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.toggleDevTools();
      console.log("DevTools toggled");
    }
  });
  console.log("DevTools shortcut Ctrl+Shift+I registered");
}

// AI Integration
const MODEL_PREFERENCE = [
  "gemini-2.0-flash",
  "gemini-2.5-pro",
  "gemini-1.5-flash"
];

let genAIClient = null;
let currentModelName = MODEL_PREFERENCE[0];

async function initializeAI() {
  try {
    console.log("Loading Google Generative AI library...");
    const { GoogleGenerativeAI } = require("@google/generative-ai");

    // Store API key from environment variable
    const API_KEY = process.env.GOOGLE_API_KEY;

    if (!API_KEY) {
      console.error("GOOGLE_API_KEY environment variable not set");
      return null;
    }

    if (!API_KEY) {
      console.error("No API key provided");
      return null;
    }

    console.log("API key found, initializing Google AI client...");
    console.log("API key starts with:", API_KEY.substring(0, 10) + "...");
    console.log("Running in production:", !isDev);
    console.log("App path:", app.getAppPath());
    console.log("Resources path:", process.resourcesPath || "not available");

    // Initialize the Google AI client
    genAIClient = new GoogleGenerativeAI(API_KEY);

    console.log("Getting Gemini model...");
    // Get the Gemini model (using the preferred model name)
    currentModelName = MODEL_PREFERENCE[0];
    const model = genAIClient.getGenerativeModel({ model: currentModelName });

    console.log("AI model initialized successfully");
    return model;
  } catch (error) {
    console.error("Failed to initialize AI:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return null;
  }
}

let aiModel = null;
// In-memory lightweight conversation history (last 8 turns)
let conversationHistory = [];
const MAX_TURNS_TO_KEEP = 8;

// IPC handlers
function setupIPC() {
  // Handle AI message requests
  ipcMain.handle("ai-message", async (event, message) => {
    try {
      if (!aiModel) {
        console.log("Initializing AI model...");
        aiModel = await initializeAI();
      }

      if (!aiModel) {
        console.error("AI model initialization failed");
        throw new Error("AI model not available");
      }

      console.log("Sending message to AI:", message.substring(0, 50) + "...");

      // Build short conversation memory (last few exchanges)
      const historyText = conversationHistory
        .slice(-MAX_TURNS_TO_KEEP)
        .map((turn, index) => `${index + 1}. User: ${turn.user}\n   Assistant: ${turn.assistant}`)
        .join("\n");

      // AI system prompt - concise and helpful
      const systemPrompt = `You are Gabay, a smart and helpful AI assistant. Be concise, clear, and conversational.

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

      const prompt = `${systemPrompt}

---
CONVERSATION HISTORY (last ${Math.min(conversationHistory.length, MAX_TURNS_TO_KEEP)} exchanges):
${historyText || "(This is the start of the conversation)"}

---
USER: ${message}

Respond thoughtfully:`;

      // Retry for transient errors (503/overloaded) with exponential backoff and model fallback
      async function generateWithRetry(maxRetries = 3) {
        let attempt = 0;
        let lastError = null;
        let modelIndex = MODEL_PREFERENCE.indexOf(currentModelName);
        while (attempt <= maxRetries) {
          try {
            const result = await aiModel.generateContent(prompt);
            return await result.response;
          } catch (err) {
            lastError = err;
            const msg = String(err?.message || "");
            if (msg.includes("503") || msg.toLowerCase().includes("overloaded") || msg.includes("unavailable")) {
              // Try switching to a fallback model first
              if (genAIClient && modelIndex + 1 < MODEL_PREFERENCE.length) {
                modelIndex += 1;
                currentModelName = MODEL_PREFERENCE[modelIndex];
                console.log(`Switching to fallback model: ${currentModelName}`);
                aiModel = genAIClient.getGenerativeModel({ model: currentModelName });
              } else {
                const delayMs = Math.min(1500 * Math.pow(2, attempt), 6000);
                console.log(`AI overloaded, retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})`);
                await new Promise(r => setTimeout(r, delayMs));
                attempt += 1;
              }
              continue;
            }
            throw err;
          }
        }
        throw lastError;
      }

      const response = await generateWithRetry(3);
      let text = response.text();

      // Post-process to strip repetitive intros after the first turn
      if (conversationHistory.length > 0) {
        const lines = text.split(/\r?\n/);
        const filtered = lines.filter((line, idx) => {
          if (idx === 0 && /\b(i\'m|i am)\s+(whispr|gabay)\b/i.test(line)) return false;
          if (/created by\s+asnari\s+pacalna/i.test(line)) return false;
          return true;
        });
        text = filtered.join("\n").trim();
      }

      console.log("AI response received successfully");

      // Update conversation history
      conversationHistory.push({ user: message, assistant: text });
      if (conversationHistory.length > MAX_TURNS_TO_KEEP) {
        conversationHistory = conversationHistory.slice(-MAX_TURNS_TO_KEEP);
      }

      return text;
    } catch (error) {
      console.error("Detailed AI error:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code
      });
      
      // Return more specific error messages
      if (error.message.includes("API key")) {
        throw new Error("Invalid API key - please check your Google AI API key");
      } else if (error.message.includes("quota")) {
        throw new Error("API quota exceeded - please check your Google Cloud billing");
      } else if (error.message.includes("permission")) {
        throw new Error("API permission denied - please enable Gemini API in Google Cloud Console");
      } else if (error.code === "ENOTFOUND" || error.message.includes("network")) {
        throw new Error("Network error - please check your internet connection");
      } else {
        throw new Error(`AI service error: ${error.message}`);
      }
    }
  });

  // Handle multimodal AI message requests (with file attachments)
  ipcMain.handle("ai-message-multimodal", async (event, { message, attachments }) => {
    try {
      if (!aiModel) {
        console.log("Initializing AI model for multimodal...");
        aiModel = await initializeAI();
      }

      if (!aiModel) {
        console.error("AI model initialization failed");
        throw new Error("AI model not available");
      }

      console.log(`Sending multimodal message with ${attachments?.length || 0} attachments`);

      // Build the content parts for multimodal request
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
          console.log(`Added attachment: ${attachment.name} (${attachment.type})`);
        }
      }

      // Build conversation context
      const historyText = conversationHistory
        .slice(-MAX_TURNS_TO_KEEP)
        .map((turn, index) => `${index + 1}. User: ${turn.user}\n   Assistant: ${turn.assistant}`)
        .join("\n");

      // AI system prompt - concise and helpful (multimodal version)
      const systemPrompt = `You are Gabay, a smart and helpful AI assistant with vision capabilities. Be concise, clear, and conversational.

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

      // Build the text prompt
      const textPrompt = `${systemPrompt}

---
CONVERSATION HISTORY (last ${Math.min(conversationHistory.length, MAX_TURNS_TO_KEEP)} exchanges):
${historyText || "(This is the start of the conversation)"}

---
USER: ${message || "Please analyze the attached file(s) thoroughly."}

Analyze the provided content and respond thoughtfully:`;

      // Add text prompt to content parts
      contentParts.push({ text: textPrompt });

      // Retry for transient errors with exponential backoff
      async function generateMultimodalWithRetry(maxRetries = 3) {
        let attempt = 0;
        let lastError = null;
        let modelIndex = MODEL_PREFERENCE.indexOf(currentModelName);

        while (attempt <= maxRetries) {
          try {
            const result = await aiModel.generateContent(contentParts);
            return await result.response;
          } catch (err) {
            lastError = err;
            const msg = String(err?.message || "");
            if (msg.includes("503") || msg.toLowerCase().includes("overloaded") || msg.includes("unavailable")) {
              // Try switching to a fallback model first
              if (genAIClient && modelIndex + 1 < MODEL_PREFERENCE.length) {
                modelIndex += 1;
                currentModelName = MODEL_PREFERENCE[modelIndex];
                console.log(`Switching to fallback model: ${currentModelName}`);
                aiModel = genAIClient.getGenerativeModel({ model: currentModelName });
              } else {
                const delayMs = Math.min(1500 * Math.pow(2, attempt), 6000);
                console.log(`AI overloaded, retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})`);
                await new Promise(r => setTimeout(r, delayMs));
                attempt += 1;
              }
              continue;
            }
            throw err;
          }
        }
        throw lastError;
      }

      const response = await generateMultimodalWithRetry(3);
      let text = response.text();

      // Post-process to strip repetitive intros after the first turn
      if (conversationHistory.length > 0) {
        const lines = text.split(/\r?\n/);
        const filtered = lines.filter((line, idx) => {
          if (idx === 0 && /\b(i\'m|i am)\s+(whispr|gabay)\b/i.test(line)) return false;
          if (/created by\s+asnari\s+pacalna/i.test(line)) return false;
          return true;
        });
        text = filtered.join("\n").trim();
      }

      console.log("Multimodal AI response received successfully");

      // Update conversation history (note: we store text description of attachments)
      const attachmentNote = attachments && attachments.length > 0
        ? ` [with ${attachments.length} file(s): ${attachments.map(a => a.name).join(", ")}]`
        : "";
      conversationHistory.push({
        user: (message || "Analyze attached files") + attachmentNote,
        assistant: text,
      });
      if (conversationHistory.length > MAX_TURNS_TO_KEEP) {
        conversationHistory = conversationHistory.slice(-MAX_TURNS_TO_KEEP);
      }

      return text;
    } catch (error) {
      console.error("Detailed multimodal AI error:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code
      });

      // Return more specific error messages
      if (error.message.includes("API key")) {
        throw new Error("Invalid API key - please check your Google AI API key");
      } else if (error.message.includes("quota")) {
        throw new Error("API quota exceeded - please check your Google Cloud billing");
      } else if (error.message.includes("permission")) {
        throw new Error("API permission denied - please enable Gemini API in Google Cloud Console");
      } else if (error.code === "ENOTFOUND" || error.message.includes("network")) {
        throw new Error("Network error - please check your internet connection");
      } else if (error.message.includes("INVALID_ARGUMENT")) {
        throw new Error("File format not supported by AI - try a different file type");
      } else {
        throw new Error(`AI service error: ${error.message}`);
      }
    }
  });

  // Handle window control
  ipcMain.on("close-window", () => {
    console.log("Close window IPC received - quitting app");
    app.isQuiting = true;
    app.quit();
  });

  ipcMain.on("minimize-window", () => {
    console.log("Minimize window IPC received - hiding window");
    hideWindow();
  });

  // Handle clearing conversation history (when switching conversations)
  ipcMain.handle("clear-conversation-history", () => {
    console.log("Clearing AI conversation history");
    conversationHistory = [];
    return true;
  });

  // Handle API key management
  ipcMain.handle("get-api-key", () => {
    const settings = loadSettings();
    // Return masked key for display (or empty if none)
    if (settings.apiKey) {
      return settings.apiKey;
    }
    return process.env.GOOGLE_API_KEY || "";
  });

  ipcMain.handle("set-api-key", async (event, apiKey) => {
    try {
      const settings = loadSettings();
      settings.apiKey = apiKey;
      const saved = saveSettings(settings);

      if (saved) {
        // Update the current process env as well
        process.env.GOOGLE_API_KEY = apiKey;
        // Reset AI model so it reinitializes with new key
        aiModel = null;
        console.log("API key saved and applied");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to save API key:", error);
      return false;
    }
  });

  // Open external URLs in default browser
  ipcMain.handle("open-external", async (event, url) => {
    try {
      await shell.openExternal(url);
      return true;
    } catch (error) {
      console.error("Failed to open external URL:", error);
      return false;
    }
  });
}

// Load API key from settings (must be called after app ready)
function loadApiKeyFromSettings() {
  if (!process.env.GOOGLE_API_KEY) {
    const settings = loadSettings();
    if (settings.apiKey) {
      process.env.GOOGLE_API_KEY = settings.apiKey;
      console.log("API key loaded from settings");
    } else {
      console.log("No API key found - user will need to set one in Settings");
    }
  }
}

// App event handlers
app.whenReady().then(() => {
  // Set isDev now that app is ready
  isDev = process.env.ELECTRON_IS_DEV === "true" || !app.isPackaged;

  // Initialize settings paths first
  initSettingsPaths();
  // Load API key from settings
  loadApiKeyFromSettings();

  createWindow();
  createTray();
  registerGlobalShortcuts();
  setupIPC();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  // Don't quit the app when all windows are closed (keep running in tray)
  // The app will only quit when explicitly requested from tray menu
});

app.on("will-quit", () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});

app.on("before-quit", () => {
  app.isQuiting = true;
});

// Handle app activation (macOS)
app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  } else {
    showWindow();
  }
});

// Security: Prevent new window creation
app.on("web-contents-created", (event, contents) => {
  contents.on("new-window", (event, navigationUrl) => {
    event.preventDefault();
  });
});
