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
  const devUrl = "http://localhost:3001";
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
  // Try multiple shortcuts for toggle window
  const shortcuts = [
    "CommandOrControl+L",
    "CommandOrControl+Shift+G",  // Fallback 1
    "Alt+Space",                  // Fallback 2
  ];

  let registered = false;
  for (const shortcut of shortcuts) {
    try {
      const ret = globalShortcut.register(shortcut, () => {
        toggleWindow();
      });
      if (ret) {
        console.log(`Global shortcut ${shortcut} registered successfully`);
        registered = true;
        break;
      }
    } catch (e) {
      console.log(`Failed to register ${shortcut}:`, e.message);
    }
  }

  if (!registered) {
    console.log("All global shortcuts failed - window can still be opened from system tray");
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

// AI Integration - Multi-Provider Support
const { createProvider, getProviders, PROVIDERS } = require('./providers/ProviderFactory');

let currentProvider = null;
let currentProviderId = null;

// Migrate old settings format to new format
function migrateSettings(settings) {
  if (settings.apiKey && !settings.apiKeys) {
    // Old format: { apiKey: "..." }
    // New format: { apiKeys: { gemini: "..." }, activeProvider: "gemini" }
    settings.apiKeys = { gemini: settings.apiKey };
    settings.activeProvider = 'gemini';
    settings.selectedModel = PROVIDERS.gemini.defaultModel;
    delete settings.apiKey;
    saveSettings(settings);
    console.log("Migrated settings to new multi-provider format");
  }
  return settings;
}

async function initializeAI() {
  try {
    let settings = loadSettings();
    settings = migrateSettings(settings);

    const providerId = settings.activeProvider || 'gemini';
    const apiKeys = settings.apiKeys || {};

    // Get API key for selected provider - check settings first, then environment
    const providerConfig = PROVIDERS[providerId];
    let apiKey = apiKeys[providerId];

    if (!apiKey && providerConfig) {
      apiKey = process.env[providerConfig.apiKeyName];
    }

    if (!apiKey) {
      console.error(`No API key for provider: ${providerId}`);
      return null;
    }

    // Ensure apiKey is a string
    apiKey = String(apiKey);

    console.log(`Initializing AI with provider: ${providerId}`);
    console.log("API key starts with:", apiKey.length > 8 ? apiKey.substring(0, 8) + "..." : "***");

    currentProvider = createProvider(providerId, apiKey);
    currentProviderId = providerId;

    // Set model if specified in settings
    if (settings.selectedModel) {
      currentProvider.setModel(settings.selectedModel);
    }

    console.log(`AI initialized with provider: ${providerId}, model: ${currentProvider.getModel()}`);
    return currentProvider;
  } catch (error) {
    console.error("Failed to initialize AI:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return null;
  }
}
// In-memory lightweight conversation history (last 8 turns)
let conversationHistory = [];
const MAX_TURNS_TO_KEEP = 8;

// IPC handlers
function setupIPC() {
  // Handle AI message requests
  ipcMain.handle("ai-message", async (event, data) => {
    // Support both old format (string) and new format (object with message and systemPrompt)
    let message = '';
    let customSystemPrompt = null;

    if (typeof data === 'string') {
      message = data;
    } else if (data && typeof data === 'object') {
      message = String(data.message || '');
      customSystemPrompt = data.systemPrompt || null;
    }

    console.log("ai-message received:", { dataType: typeof data, messageLength: message.length });

    try {
      if (!currentProvider) {
        console.log("Initializing AI provider...");
        currentProvider = await initializeAI();
      }

      if (!currentProvider) {
        console.error("AI provider initialization failed - no provider created");
        throw new Error("AI provider not available - please set an API key in Settings");
      }

      console.log("Sending message to AI, length:", message.length);

      // Set custom system prompt if provided
      if (customSystemPrompt && currentProvider.setCustomSystemPrompt) {
        currentProvider.setCustomSystemPrompt(customSystemPrompt);
      }

      // Retry for transient errors (503/overloaded) with exponential backoff
      async function generateWithRetry(maxRetries = 3) {
        let attempt = 0;
        let lastError = null;

        while (attempt <= maxRetries) {
          try {
            return await currentProvider.generateContent(message, conversationHistory);
          } catch (err) {
            lastError = err;
            const msg = String(err?.message || "");
            if (msg.includes("503") || msg.toLowerCase().includes("overloaded") || msg.includes("unavailable") || msg.includes("rate_limit")) {
              const delayMs = Math.min(1500 * Math.pow(2, attempt), 6000);
              console.log(`AI overloaded, retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})`);
              await new Promise(r => setTimeout(r, delayMs));
              attempt += 1;
              continue;
            }
            throw err;
          }
        }
        throw lastError;
      }

      const text = await generateWithRetry(3);
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
      if (error.message.includes("API key") || error.message.includes("api_key") || error.message.includes("authentication")) {
        throw new Error("Invalid API key - please check your API key in Settings");
      } else if (error.message.includes("quota") || error.message.includes("rate_limit")) {
        throw new Error("API quota/rate limit exceeded - please try again later");
      } else if (error.message.includes("permission")) {
        throw new Error("API permission denied - please check your API configuration");
      } else if (error.code === "ENOTFOUND" || error.message.includes("network") || error.message.includes("fetch")) {
        throw new Error("Network error - please check your internet connection");
      } else {
        throw new Error(`AI service error: ${error.message}`);
      }
    }
  });

  // Handle multimodal AI message requests (with file attachments)
  ipcMain.handle("ai-message-multimodal", async (event, data) => {
    // Safely extract parameters
    const message = String(data?.message || '');
    const attachments = data?.attachments || [];
    const systemPrompt = data?.systemPrompt || null;

    try {
      if (!currentProvider) {
        console.log("Initializing AI provider for multimodal...");
        currentProvider = await initializeAI();
      }

      if (!currentProvider) {
        console.error("AI provider initialization failed");
        throw new Error("AI provider not available - please set an API key in Settings");
      }

      console.log(`Sending multimodal message with ${attachments.length} attachments`);

      // Set custom system prompt if provided
      if (systemPrompt && currentProvider.setCustomSystemPrompt) {
        currentProvider.setCustomSystemPrompt(systemPrompt);
      }

      // Check if provider supports multimodal
      if (!currentProvider.supportsMultimodal()) {
        console.log("Provider doesn't support multimodal, falling back to text-only");
      }

      // Retry for transient errors with exponential backoff
      async function generateMultimodalWithRetry(maxRetries = 3) {
        let attempt = 0;
        let lastError = null;

        while (attempt <= maxRetries) {
          try {
            return await currentProvider.generateMultimodalContent(message, attachments, conversationHistory);
          } catch (err) {
            lastError = err;
            const msg = String(err?.message || "");
            if (msg.includes("503") || msg.toLowerCase().includes("overloaded") || msg.includes("unavailable") || msg.includes("rate_limit")) {
              const delayMs = Math.min(1500 * Math.pow(2, attempt), 6000);
              console.log(`AI overloaded, retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})`);
              await new Promise(r => setTimeout(r, delayMs));
              attempt += 1;
              continue;
            }
            throw err;
          }
        }
        throw lastError;
      }

      const text = await generateMultimodalWithRetry(3);
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
      if (error.message.includes("API key") || error.message.includes("api_key") || error.message.includes("authentication")) {
        throw new Error("Invalid API key - please check your API key in Settings");
      } else if (error.message.includes("quota") || error.message.includes("rate_limit")) {
        throw new Error("API quota/rate limit exceeded - please try again later");
      } else if (error.message.includes("permission")) {
        throw new Error("API permission denied - please check your API configuration");
      } else if (error.code === "ENOTFOUND" || error.message.includes("network") || error.message.includes("fetch")) {
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

  // Handle API key management (legacy - for backwards compatibility)
  ipcMain.handle("get-api-key", () => {
    let settings = loadSettings();
    settings = migrateSettings(settings);
    // Return the active provider's API key
    const providerId = settings.activeProvider || 'gemini';
    if (settings.apiKeys && settings.apiKeys[providerId]) {
      return settings.apiKeys[providerId];
    }
    const providerConfig = PROVIDERS[providerId];
    return providerConfig ? (process.env[providerConfig.apiKeyName] || "") : "";
  });

  ipcMain.handle("set-api-key", async (event, apiKey) => {
    try {
      let settings = loadSettings();
      settings = migrateSettings(settings);
      const providerId = settings.activeProvider || 'gemini';

      if (!settings.apiKeys) settings.apiKeys = {};
      settings.apiKeys[providerId] = apiKey;
      const saved = saveSettings(settings);

      if (saved) {
        // Reset provider so it reinitializes with new key
        currentProvider = null;
        console.log(`API key saved for provider: ${providerId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to save API key:", error);
      return false;
    }
  });

  // Get available providers
  ipcMain.handle("get-providers", () => {
    return PROVIDERS;
  });

  // Get current provider settings
  ipcMain.handle("get-provider-settings", () => {
    let settings = loadSettings();
    settings = migrateSettings(settings);

    // Mask API keys for display
    const maskedKeys = {};
    if (settings.apiKeys) {
      for (const [key, value] of Object.entries(settings.apiKeys)) {
        const strValue = String(value || '');
        if (strValue && strValue.length > 12) {
          maskedKeys[key] = strValue.substring(0, 8) + "..." + strValue.slice(-4);
        } else if (strValue) {
          maskedKeys[key] = "****";
        } else {
          maskedKeys[key] = "";
        }
      }
    }

    return {
      activeProvider: settings.activeProvider || 'gemini',
      selectedModel: settings.selectedModel || PROVIDERS.gemini.defaultModel,
      apiKeys: maskedKeys,
      hasApiKeys: settings.apiKeys || {},
    };
  });

  // Set active provider
  ipcMain.handle("set-provider", async (event, providerId) => {
    try {
      if (!PROVIDERS[providerId]) {
        throw new Error(`Unknown provider: ${providerId}`);
      }

      let settings = loadSettings();
      settings = migrateSettings(settings);
      settings.activeProvider = providerId;
      settings.selectedModel = PROVIDERS[providerId].defaultModel;
      saveSettings(settings);

      // Reset provider so it reinitializes
      currentProvider = null;
      currentProviderId = null;
      console.log(`Switched to provider: ${providerId}`);
      return true;
    } catch (error) {
      console.error("Failed to set provider:", error);
      return false;
    }
  });

  // Set model for current provider
  ipcMain.handle("set-model", async (event, modelName) => {
    try {
      let settings = loadSettings();
      settings = migrateSettings(settings);
      settings.selectedModel = modelName;
      saveSettings(settings);

      if (currentProvider) {
        currentProvider.setModel(modelName);
      }
      console.log(`Model set to: ${modelName}`);
      return true;
    } catch (error) {
      console.error("Failed to set model:", error);
      return false;
    }
  });

  // Set API key for a specific provider
  ipcMain.handle("set-provider-api-key", async (event, { providerId, apiKey }) => {
    try {
      if (!PROVIDERS[providerId]) {
        throw new Error(`Unknown provider: ${providerId}`);
      }

      let settings = loadSettings();
      settings = migrateSettings(settings);
      if (!settings.apiKeys) settings.apiKeys = {};
      settings.apiKeys[providerId] = apiKey;
      saveSettings(settings);

      // If this is the active provider, reset it
      if (providerId === settings.activeProvider) {
        currentProvider = null;
      }
      console.log(`API key saved for provider: ${providerId}`);
      return true;
    } catch (error) {
      console.error("Failed to save provider API key:", error);
      return false;
    }
  });

  // Get API key for a specific provider (unmasked - for settings modal)
  ipcMain.handle("get-provider-api-key", async (event, providerId) => {
    try {
      let settings = loadSettings();
      settings = migrateSettings(settings);
      if (settings.apiKeys && settings.apiKeys[providerId]) {
        return settings.apiKeys[providerId];
      }
      const providerConfig = PROVIDERS[providerId];
      return providerConfig ? (process.env[providerConfig.apiKeyName] || "") : "";
    } catch (error) {
      console.error("Failed to get provider API key:", error);
      return "";
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
