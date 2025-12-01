# 🤖 Gabay - Desktop AI Chatbot Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Quick Setup](#quick-setup)
3. [Project Structure](#project-structure)
4. [Features & Functionalities](#features--functionalities)
5. [Component Architecture](#component-architecture)
6. [Customization Guide](#customization-guide)
7. [Troubleshooting](#troubleshooting)
8. [Development Guide](#development-guide)

---

## 🌟 Project Overview

**Gabay** is a modern desktop AI chatbot built with:
- **Frontend**: React.js with Tailwind CSS
- **Desktop Framework**: Electron
- **AI Integration**: Google Gemini AI
- **Architecture**: Clean, modular component structure

### Key Features
- 🚀 **Global Hotkey**: Access with `Ctrl+L` from anywhere
- 📝 **Rich Text Formatting**: Markdown-like formatting support
- 📋 **Copy to Clipboard**: Advanced clipboard functionality
- 🔄 **Auto Scroll**: Smart scroll management
- 🖥️ **System Tray**: Minimizes to tray, stays accessible
- 🎨 **Modern UI**: Professional dark theme design

---

## ⚡ Quick Setup

### Prerequisites
```bash
Node.js (v16 or higher)
npm (comes with Node.js)
```

### Installation
```bash
# 1. Clone or download the project
git clone <your-repo-url>
cd DesktopChatbotAI

# 2. Install dependencies
npm install

# 3. Start the application
npm start
```

### Usage
- **Launch**: Run `npm start` or use `Ctrl+L` when running
- **Hide/Show**: Click tray icon or use `Ctrl+L`
- **Close**: Click red button or right-click tray → Quit

---

## 📁 Project Structure

```
DesktopChatbotAI/
├── public/                     # Electron main process files
│   ├── main.js                 # Main Electron process & AI integration
│   ├── preload.js              # Preload script for security
│   └── index.html              # Entry HTML file
├── src/                        # React application source
│   ├── components/             # React components
│   │   ├── ChatWindow.js       # Main chat container (120 lines)
│   │   ├── Chat/               # Chat-specific components
│   │   │   ├── Header.js       # App header with controls (~70 lines)
│   │   │   ├── MessageList.js  # Scrollable messages container (~70 lines)
│   │   │   ├── Message.js      # Individual message component (~80 lines)
│   │   │   ├── InputArea.js    # Message input area (~80 lines)
│   │   │   └── Modal.js        # Full content modal (~160 lines)
│   │   └── UI/                 # Reusable UI components
│   │       └── ScrollToBottomButton.js (~45 lines)
│   ├── hooks/                  # Custom React hooks
│   │   ├── useScrollManagement.js (~80 lines)
│   │   └── useCopyToClipboard.js (~60 lines)
│   ├── utils/                  # Utility functions
│   │   ├── messageUtils.js     # Message processing (~20 lines)
│   │   └── textFormatter.js    # Rich text formatting (~250 lines)
│   ├── constants/              # Configuration constants
│   │   └── initialMessages.js  # App config (~20 lines)
│   ├── Image/                  # App icons and images
│   │   └── Whispr-no-bg.png   # App icon
│   ├── App.js                  # Root React component
│   ├── index.js                # React entry point
│   └── index.css               # Global styles & Tailwind
├── package.json                # Dependencies and scripts
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
└── README.md                   # Basic project info
```

---

## 🎯 Features & Functionalities

### 1. **Global Hotkey System**
- **File**: `public/main.js` (registerGlobalShortcuts function)
- **Functionality**: `Ctrl+L` toggles app visibility globally
- **How it works**: Uses Electron's `globalShortcut` API
- **Customization**: Change shortcut in main.js line ~145

### 2. **Rich Text Formatting**
- **Files**: `src/utils/textFormatter.js`, `src/components/Chat/Message.js`
- **Supported formats**:
  - `**bold**` or `__bold__` → **bold text**
  - `*italic*` or `_italic_` → *italic text*
  - `` `code` `` → `code snippets`
  - `# Heading` → # Heading (sizes 1-6)
  - `1. List` → Numbered lists
  - `- Bullet` → Bullet lists
  - `~~strike~~` → ~~strikethrough~~
  - Code blocks with ``` syntax

### 3. **Smart Message Handling**
- **Long Message Detection**: Auto-detects messages >200 characters or with code
- **Preview System**: Shows formatted preview with "Click Here To Fully View"
- **Modal Display**: Full content in scrollable modal with copy function
- **Configuration**: Adjust thresholds in `src/constants/initialMessages.js`

### 4. **Advanced Clipboard System**
- **File**: `src/hooks/useCopyToClipboard.js`
- **Multiple fallback methods**:
  1. Electron clipboard API (primary)
  2. Modern browser clipboard API
  3. Textarea simulation method
  4. Direct content selection
- **Visual feedback**: Success/failure notifications with 2-second display

### 5. **Auto-Scroll Management**
- **File**: `src/hooks/useScrollManagement.js`
- **Smart detection**: Knows when user manually scrolls up
- **Auto-scroll**: Automatically scrolls to new messages when at bottom
- **Scroll button**: "↓" button appears when not at bottom (100px threshold)
- **Debug helpers**: Console logs for scroll state

### 6. **AI Integration**
- **File**: `public/main.js` (initializeAI and setupIPC functions)
- **Provider**: Google Gemini AI (gemini-1.5-flash model)
- **API Key**: Hardcoded in main.js (line ~175) - change for production
- **Custom prompts**: Instructs AI to use rich formatting
- **Error handling**: Graceful fallbacks for connection issues
- **Response formatting**: AI trained to use markdown-like syntax

### 7. **System Tray Integration**
- **File**: `public/main.js` (createTray function)
- **Tray icon**: Custom Whispr icon (resized to 16x16)
- **Context menu**: Show/Hide and Quit options
- **Click behavior**: Single click toggles window visibility
- **Tooltip**: Shows "Desktop Chatbot" on hover

### 8. **Window Management**
- **Size**: 400x600 pixels, not resizable
- **Position**: Centers on screen at startup
- **Behavior**: Minimizes to tray instead of closing
- **Controls**: Minimize (yellow) and Close (red) buttons in header
- **Focus**: Auto-focuses input when shown

---

## 🏗️ Component Architecture

### Main Components Flow:
```
App.js (Root)
└── ChatWindow.js (Main Container - State Management)
    ├── Header.js (Title bar + window controls)
    ├── MessageList.js (Scrollable messages container)
    │   └── Message.js (Individual message bubbles)
    ├── InputArea.js (Message input + send button)
    ├── Modal.js (Full content viewer with copy)
    └── ScrollToBottomButton.js (Floating scroll button)
```

### Custom Hooks:
- **`useScrollManagement`**: 
  - Manages auto-scroll state
  - Detects user scroll behavior
  - Provides refs for containers
  - Handles scroll-to-bottom logic

- **`useCopyToClipboard`**: 
  - Multiple clipboard fallback methods
  - Visual feedback management
  - Error handling and logging

### Utilities:
- **`textFormatter.js`**: 
  - Converts markdown-like text to React JSX
  - Handles headings, lists, code blocks, inline formatting
  - Provides plain text extraction for length calculation

- **`messageUtils.js`**: 
  - Message validation and processing
  - Long message detection logic
  - Time formatting functions

### Constants:
- **`initialMessages.js`**: 
  - Welcome message content
  - Configuration thresholds
  - UI constants (heights, timeouts)

---

## 🎨 Customization Guide

### Change App Branding
1. **App Name**: 
   - `package.json` → `"name"` and `"productName"`
   - `src/components/Chat/Header.js` → title text
   - `public/main.js` → AI prompt section (change "Whispr" references)

2. **Icon**: 
   - Replace `src/Image/Whispr-no-bg.png`
   - Update paths in `package.json` and `main.js`

3. **Colors**: 
   - Primary: `#3b82f6` (blue)
   - Background: `#0f172a` (dark navy)
   - Secondary: `#1e293b` (slate)
   - Update in component styles

### Modify AI Behavior
**File**: `public/main.js` → `customPrompt` section (line ~190)

```javascript
const customPrompt = `You are [YourBotName], an AI assistant created by [YourName].

PERSONALITY:
- [Describe personality traits]
- [Set tone and style]

FORMATTING INSTRUCTIONS:
- Use **bold** for emphasis
- Use \`code\` for technical terms
- [Add your formatting preferences]

RESPONSE STYLE:
- [Set response guidelines]
- [Define behavior patterns]
`;
```

### Configure Hotkeys
**File**: `public/main.js` → `registerGlobalShortcuts()` (line ~145)

```javascript
// Change the hotkey
const ret = globalShortcut.register("CommandOrControl+Shift+C", () => {
  toggleWindow();
});
```

### Adjust Message Thresholds
**File**: `src/constants/initialMessages.js`

```javascript
export const MESSAGE_CONFIG = {
  LONG_MESSAGE_THRESHOLD: 300, // Increase for longer previews
  CODE_KEYWORDS: ["```", "function", "class"], // Add more keywords
  PREVIEW_LENGTH: 250, // Characters to show in preview
};
```

### Modify Styling
1. **Message bubbles**: `src/components/Chat/Message.js`
2. **Input area**: `src/components/Chat/InputArea.js`
3. **Modal**: `src/components/Chat/Modal.js`
4. **Global styles**: `src/index.css`

---

## 🔧 Troubleshooting

### Common Issues

#### 1. App Won't Start
```bash
# Check Node.js version (should be 16+)
node --version

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

#### 2. Hotkey Not Working
- **Windows**: Check if another app uses `Ctrl+L`
- **Check console**: Look for "Global shortcut registration failed"
- **Solution**: Change hotkey in `main.js` or close conflicting apps

#### 3. AI Not Responding
1. **Check API key** in `main.js` (line ~175)
2. **Check internet connection**
3. **Open DevTools**: Add `mainWindow.webContents.openDevTools();` in main.js
4. **View console**: Look for network errors or API quota issues

#### 4. Copy to Clipboard Fails
- **Check console logs**: Look for copy method attempts
- **Electron context**: Should work automatically in desktop app
- **Browser testing**: May need HTTPS or user interaction
- **Try different text**: Some special characters might cause issues

#### 5. Formatting Not Working
1. **Check syntax**: Ensure proper markdown formatting (`**bold**`, not `*bold*`)
2. **Restart app**: Clear any cached components
3. **Check console**: Look for JavaScript errors in textFormatter.js
4. **Test simple formatting**: Try just `**bold**` first

#### 6. Scroll Issues
- **Check container heights**: Ensure messages container has proper height
- **Debug scroll**: Use browser DevTools to inspect scroll values
- **Console logs**: Look for scroll detection messages
- **Manual test**: Use `window.testScroll()` and `window.testScrollUp()` in console

### Debug Mode
**Enable Developer Tools**:
```javascript
// Add to main.js createWindow() function:
mainWindow.webContents.openDevTools();
```

**Useful Console Commands**:
```javascript
// Test scroll functions
window.testScroll()      // Scroll to bottom
window.testScrollUp()    // Scroll to top

// Check message state
console.log("Messages:", messages);

// Test formatting
formatText("**bold** and *italic*");
```

---

## 💻 Development Guide

### Adding New Features

#### 1. Add a New Component
```bash
# Create component file
touch src/components/Chat/NewComponent.js
```

**Template**:
```javascript
import React from 'react';

const NewComponent = ({ message, onAction }) => {
  return (
    <div className="no-drag" style={{ /* styles */ }}>
      {/* Your JSX here */}
    </div>
  );
};

export default NewComponent;
```

#### 2. Add a Custom Hook
```bash
# Create hook file
touch src/hooks/useNewFeature.js
```

**Template**:
```javascript
import { useState, useEffect } from 'react';

export const useNewFeature = (dependency) => {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Hook logic here
  }, [dependency]);
  
  const handleAction = () => {
    // Action handler
  };
  
  return { state, setState, handleAction };
};
```

#### 3. Add Utility Functions
```bash
# Create utility file
touch src/utils/newFeatureUtils.js
```

**Template**:
```javascript
// Pure utility functions
export const processData = (data) => {
  // Processing logic
  return processedData;
};

export const validateInput = (input) => {
  // Validation logic
  return isValid;
};
```

### Code Style Guidelines

1. **Components**: 
   - Use functional components with hooks
   - Include `className="no-drag"` for Electron compatibility
   - Use inline styles for dynamic values, Tailwind for static

2. **File Naming**: 
   - Components: `PascalCase.js` (e.g., `MessageList.js`)
   - Hooks: `use[Feature].js` (e.g., `useScrollManagement.js`)
   - Utils: `[feature]Utils.js` (e.g., `messageUtils.js`)

3. **Import Order**:
   ```javascript
   // 1. React imports
   import React, { useState, useEffect } from 'react';
   
   // 2. Third-party imports
   import someLibrary from 'some-library';
   
   // 3. Local components
   import Header from './Chat/Header';
   
   // 4. Hooks and utilities
   import { useScrollManagement } from '../hooks/useScrollManagement';
   import { formatText } from '../utils/textFormatter';
   ```

4. **State Management**:
   - Keep state close to where it's used
   - Use custom hooks for complex logic
   - Pass down props explicitly

### Building for Production

```bash
# Build React app
npm run react-build

# Build Electron executable
npm run electron-build

# Output directory
ls dist/
```

**Build Configuration**: Check `package.json` → `"build"` section for Electron Builder settings.

### Performance Optimization

1. **Component Optimization**:
   ```javascript
   import React, { memo } from 'react';
   
   const ExpensiveComponent = memo(({ prop1, prop2 }) => {
     // Component logic
   });
   ```

2. **Lazy Loading**:
   ```javascript
   const LazyComponent = React.lazy(() => import('./LazyComponent'));
   
   // Use with Suspense
   <Suspense fallback={<div>Loading...</div>}>
     <LazyComponent />
   </Suspense>
   ```

3. **Bundle Analysis**:
   ```bash
   npm run react-build
   npx source-map-explorer build/static/js/*.js
   ```

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks
```bash
# Monthly dependency updates
npm update

# Security audit
npm audit
npm audit fix

# Clean rebuild
rm -rf node_modules package-lock.json
npm install
```

### Backup Strategy
1. **Version Control**: Use Git for code versioning
2. **Settings Backup**: Export any custom configurations
3. **Build Artifacts**: Keep production builds archived
4. **Documentation**: Keep this file updated with changes

### Getting Help
1. **Console Logs**: Always check browser/Electron console first
2. **Documentation**: Re-read relevant sections in this file
3. **Official Docs**: 
   - [Electron Documentation](https://electronjs.org/docs)
   - [React Documentation](https://reactjs.org/docs)
   - [Tailwind CSS](https://tailwindcss.com/docs)
4. **Community**: Stack Overflow for specific error messages

---

## 🚀 Future Enhancement Ideas

### Potential Features to Add
1. **Chat History**: 
   - Persist conversations locally
   - Search through past messages
   - Export chat history

2. **Multiple AI Providers**:
   - Support OpenAI, Claude, etc.
   - Provider switching in UI
   - Custom API key management

3. **Themes & Customization**:
   - Light/dark mode toggle
   - Custom color schemes
   - Font size adjustment

4. **Advanced Features**:
   - Voice input/output
   - File attachments
   - Screenshot capture
   - Plugin system

5. **Settings Panel**:
   - Configurable hotkeys
   - AI behavior settings
   - UI preferences

### Implementation Guidelines
- **Maintain Architecture**: Keep components small and focused
- **Follow Patterns**: Use established hooks and utility patterns
- **Document Changes**: Update this file when adding features
- **Test Thoroughly**: Ensure new features don't break existing functionality

---

## 📝 Quick Reference

### Essential Commands
```bash
# Development
npm start              # Start development server
npm run react-build    # Build React app
npm run electron-build # Build desktop app

# Maintenance
npm update            # Update dependencies
npm audit             # Check security
npm install           # Install dependencies
```

### Key Files to Remember
- **Main Logic**: `public/main.js`
- **Main Component**: `src/components/ChatWindow.js`
- **AI Prompt**: `public/main.js` line ~190
- **Constants**: `src/constants/initialMessages.js`
- **Formatting**: `src/utils/textFormatter.js`

### Common Modifications
- **Change hotkey**: `main.js` → `registerGlobalShortcuts()`
- **Update AI prompt**: `main.js` → `customPrompt`
- **Adjust thresholds**: `constants/initialMessages.js`
- **Modify styling**: Individual component files

---

*This documentation is complete guide to understanding, maintaining, and extending the Whispr desktop chatbot* 🚀

**Last Updated**: December 2024  
**Version**: 1.0  
**Author**: Created for Whispr Desktop Chatbot
