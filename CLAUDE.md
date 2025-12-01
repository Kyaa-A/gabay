# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Whispr is a desktop AI chatbot application built with Electron and React, powered by Google Gemini AI. It features a floating window with global hotkey activation (Ctrl+L), system tray integration, and rich text formatting.

## Development Commands

```bash
# Development
npm start              # Start dev server with Electron hot reload
npm run react-start    # React dev server only (localhost:3000)
npm run electron-dev   # Electron in dev mode

# Building
npm run build          # React production build (outputs to build/)
npm run electron-build # Build React + Electron distributable

# Portable Build
cd Whispr-Portable && npm start  # Run portable Electron build
```

## Environment Setup

Requires `.env` file with `GOOGLE_API_KEY` for AI functionality. The portable build resolves .env from multiple paths (development, production, resources).

## Architecture

**Technology Stack**: React 18 + Electron 27 + Tailwind CSS 3 + Google Generative AI

**Component Structure**:
```
App.js → Detects Electron environment
  ├─ Browser: Landing page
  └─ Electron: ChatWindow
       ├─ Header (frameless window controls)
       ├─ MessageList → Message (with textFormatter)
       ├─ InputArea
       ├─ ScrollToBottomButton
       └─ Modal (full content viewer)
```

**Key Files**:
- `src/components/ChatWindow.js` - Main container, state management (messages, modals, typing state)
- `src/utils/textFormatter.js` - Converts markdown-like syntax to JSX (bold, italic, code, headings, lists)
- `Whispr-Portable/main.js` - Electron main process: window management, global shortcuts, tray, AI integration
- `Whispr-Portable/preload.js` - IPC bridge (context isolation enabled)

**IPC Flow**: React UI ↔ preload.js (electronAPI) ↔ main.js ↔ Google Gemini API

## Custom Hooks

- `useScrollManagement` - Auto-scroll logic with manual scroll detection
- `useCopyToClipboard` - Multi-method fallback: Electron API → Browser API → Textarea

## Configuration

**Message Settings** (`src/constants/initialMessages.js`):
- `LONG_MESSAGE_THRESHOLD: 300` - Chars before showing preview
- `SCROLL_THRESHOLD: 100` - Pixels from bottom for auto-scroll

**Tailwind Theme** (`tailwind.config.js`):
- Custom colors: `chat-bg`, `chat-surface`, `chat-border`, `chat-primary`, `chat-secondary`
- Custom animations: `slide-up`, `fade-in`

## Electron-Specific Notes

- All interactive components need `className="no-drag"` for frameless window compatibility
- Window: 400x600px, frameless, bottom-right positioning, always-on-top
- Security: Node integration disabled, context isolation enabled, preload script for IPC
- Global hotkey: Ctrl+L toggles visibility
- System tray integration with context menu

## AI Integration

Located in `Whispr-Portable/main.js`:
- Model: `gemini-1.5-flash`
- Custom system prompt defined in `setupIPC()` function
- Streaming responses via IPC to renderer
