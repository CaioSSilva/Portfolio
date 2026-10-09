# Cai_OS — Documentation

**Version:** 2.5.1 · **Platform:** Web (Angular 22) · **Author:** Caio Souza Silva

---

## Table of Contents

1. [What is Cai_OS?](#what-is-caios)
2. [Getting Started](#getting-started)
3. [System Architecture](#system-architecture)
4. [Installed Applications](#installed-applications)
5. [Window Management](#window-management)
6. [Terminal](#terminal)
7. [Hermes — AI Assistant](#hermes--ai-assistant)
8. [Hermes Actions](#hermes-actions)
9. [Virtual File System](#virtual-file-system)
10. [Settings](#settings)
11. [Notifications & Tips](#notifications--tips)
12. [Mobile Navigation](#mobile-navigation)
13. [Data Models](#data-models)
14. [Core Services](#core-services)
15. [Internationalization (i18n)](#internationalization-i18n)
16. [Environment Variables](#environment-variables)
17. [Technical Reference](#technical-reference)

---

## What is Cai_OS?

**Cai_OS** is a simulated operating system that runs entirely in the browser. It is an interactive portfolio built as a GNOME-inspired desktop environment using Angular 22 with Signals-based reactivity.

Instead of a traditional portfolio page, visitors interact with real windowed applications, a Unix-like terminal, a virtual file system, an AI assistant (Hermes), and full system settings — all inside the browser.

**Technical highlights:**
- Standalone Angular 22 application with no routing — the OS is the application
- 100% Signals-based reactivity (`signal`, `computed`, `effect`)
- Full desktop window management: drag, resize, snap, maximize, minimize, cascade
- Responsive layout: full desktop and dedicated mobile layout with touch gestures
- Hermes AI assistant powered by `@google/generative-ai`, capable of controlling the OS via structured action tags
- Virtual file system loaded from a static JSON manifest (`/data/fs.json`)
- Synchronized lyrics for the music player via the public LRCLIB API
- Deployed on Vercel with Analytics and Speed Insights integrated at startup

---

## Getting Started

When you first access the system, you will see the **boot screen** with a simulated progress bar. Click "Press to Start" when it appears. The startup sound will play and the system will be ready.

After booting, the **About the project** application opens automatically with developer information.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser / Vercel                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │                  Angular App (SPA)               │   │
│  │                                                  │   │
│  │  ┌─────────────┐  ┌──────────────────────────┐  │   │
│  │  │  Layout     │  │   Shared UI              │  │   │
│  │  │  TopBar     │  │   Window (per process)   │  │   │
│  │  │  Dock       │  │   Boot / Shutdown        │  │   │
│  │  │  AppsGrid   │  │   ContextMenu            │  │   │
│  │  │  MobileNav  │  └──────────────────────────┘  │   │
│  │  └─────────────┘                                │   │
│  │                                                  │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │              Feature Apps                  │  │   │
│  │  │  Files  Terminal  Browser  Hermes  Musics  │  │   │
│  │  │  Photos  Documents  Settings  SystemMonitor│  │   │
│  │  │  AboutProject  DesktopIcons               │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  │                                                  │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │               Core Services               │  │   │
│  │  │  ProcessManager  WindowService  FileSystem │  │   │
│  │  │  Settings  Theme  Language  Notification   │  │   │
│  │  │  DockService  AppRegistry  AppLauncher     │  │   │
│  │  │  Gemini  HermesChat  HermesAction          │  │   │
│  │  │  AudioPlayer  LyricsService  Sound         │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  Static assets: /data/fs.json  /sounds/*.ogg            │
│                 /wallpapers/   /videos/wallpapers/       │
└─────────────────────────────────────────────────────────┘
```

**Data flow:**

```
User interaction
  → Component (signal mutation)
    → Service (signal update / effect)
      → Other services (computed derivation)
        → Template re-render (signal read)
```

**Design patterns:**
- **Service-per-concern**: each domain (process, file, audio, AI) is an isolated `providedIn: 'root'` service
- **Signals everywhere**: `signal()`, `computed()`, `effect()` — no direct template subscriptions
- **Base class inheritance**: all feature apps extend `Base<T>`, providing `data` and `handle`
- **Process model**: every open window is a `Process` object managed by `ProcessManager`; `WindowService` is provided per window instance
- **Hermes action pipeline**: raw AI text → regex parse `<!--caios:action {...} -->` → typed dispatch → execution

---

## Installed Applications

| ID | Name | Icon | Color | Handled extensions | Lazy-loaded |
|---|---|---|---|---|---|
| `files` | Files | `fas fa-folder` | `#3584e4` | — | No |
| `firefox` | Firefox | `fab fa-firefox-browser` | `#ff7139` | — | No |
| `terminal` | Terminal | `fas fa-terminal` | `#77767b` | — | No |
| `settings` | Settings | `fas fa-cog` | `#FE6F5E` | — | No |
| `about` | About the project | `fas fa-user` | `#6f42c1` | — | No |
| `photos` | Photos | `fas fa-image` | `#4a90e2` | jpg, jpeg, png, svg, webp, gif | No |
| `documents` | Documents | `fas fa-file` | `#e01b24` | txt, log, md, json, ts, js, css, scss, pdf, text | **Yes** |
| `musics` | Musics | `fas fa-music` | `#0077b6` | mp3, wav, ogg, m4a, flac | No |
| `systemMonitor` | System monitor | `fas fa-chart-pie` | `#9AB973` | — | No |
| `hermes` | Hermes | `fas fa-square-h` | `#00916E` | — | No |

### Application descriptions

**Files (`files`)**
File manager with collapsible sidebar, grid and list view modes, search bar, and resizable sidebar (desktop). Clicking a file detects the extension and opens the corresponding application automatically.

**Firefox (`firefox`)**
Embedded iframe browser. Supports any URL, navigation history, and back button. Some URLs may not load due to X-Frame-Options embedding policies.

**Terminal (`terminal`)**
Unix-like terminal emulator with command history (↑/↓ keys), Tab autocomplete, virtual file system navigation, and built-in commands. See the [Terminal](#terminal) section for the full command list.

**Settings (`settings`)**
Settings panel with sections: Appearance (theme, wallpaper), Desktop (dock, icon sizes), Sound, Language, and System (hardware info).

**About the project (`about`)**
Project presentation page with an app gallery, system feature showcase, and resume download.

**Photos (`photos`)**
Image gallery with viewer. Supports zoom (scroll / pinch), rotation, pan, keyboard navigation (← →), and horizontal swipe on mobile.

**Documents (`documents`)**
PDF, Markdown, and plain text viewer. Supports zoom, anchor scroll in Markdown, keyboard navigation, and horizontal swipe on mobile. Lazy-loaded to keep the `ng2-pdf-viewer` bundle separate.

**Musics (`musics`)**
Music player with library, playback controls, seek, volume, mute, and synchronized lyrics (LRC) via LRCLIB. The active lyric line auto-scrolls.

**System Monitor (`systemMonitor`)**
CPU and RAM graphs (simulated), network stats (real or simulated), active process list with kill action.

**Hermes (`hermes`)**
AI chat using Google Gemini. Supports image attachment, streaming response, model picker, and full OS control via action tags.

**Desktop Icons (`desktop-icons`)**
App shortcuts pinned directly on the wallpaper. Right-click to add/remove.

---

## Window Management

### Desktop

Every open window corresponds to a `Process` managed by `ProcessManager`. Windows support:

- **Drag**: hold the title bar and drag
- **Resize**: drag the bottom-right corner (minimum: 320×240 px)
- **Maximize**: click the maximize button or double-click the title bar
- **Minimize**: click the minimize button; the window disappears and can be restored from the Dock
- **Close**: click the close (X) button
- **Snap**: drag a window to screen edges/corners to snap into halves or quadrants
  - Left/right edge → 50% of the screen
  - Top edge (center) → full screen
  - Top corner → 25% quadrant (top corner)
  - Bottom edge → bottom half of the screen
- **Cascade**: new windows open with automatic offset to avoid stacking

### App Switcher (desktop)

Press `Ctrl + \`` (backtick) to open the window switcher. Press again to cycle. Release `Ctrl` to confirm.

### Mobile

On mobile, all windows are automatically maximized to full screen. Drag and resize are disabled.

---

## Terminal

The terminal emulates a Unix shell navigating the virtual file system.

**Prompt:** `user@caios:folder$`

### Available commands

| Command | Description |
|---|---|
| `help` | Display the command list |
| `ls` | List files and folders in the current directory |
| `cd <path>` | Change working directory (supports `.`, `..`, `/`, `~`, absolute and relative paths) |
| `open <file>` | Open a file with the associated application |
| `date` | Display current date and time (locale-aware) |
| `theme` | Toggle between light and dark mode |
| `clear` | Clear the terminal screen |
| `about` | Display Cai_OS version and kernel info |
| `neofetch` | Display ASCII logo with system information |
| `whoami` | Display developer information |

**Autocomplete:** press `Tab` to complete command and file names.

**History:** use ↑ and ↓ to navigate previous commands.

---

## Hermes — AI Assistant

Hermes is the intelligent assistant integrated into Cai_OS, powered by Google Gemini. It responds using Markdown formatting and can control the system in real time.

**Features:**
- Streaming responses (live typing effect)
- Image attachment support
- Gemini model picker (click the model name shown above the input field to open the selector)
- Conversation history (keeps the last 6 messages as context)
- Automatic fallback to a secondary API key on 404/429 errors
- **Agent Mode** — always-on voice activation via wake phrase (see below)

**How to use:**
1. Open the **Hermes** application from the dock or app grid
2. Type a message or ask a question
3. Optionally attach an image by clicking the image icon on the left of the input field

### Agent Mode

Agent Mode allows Hermes to listen passively and be activated by voice at any time — without opening the Hermes window.

**Enabling:**
Settings → Hermes → Agent Mode toggle (requires microphone permission).

**Wake phrases:** "Hello Hermes", "Oi Hermes", "Hey Hermes"

**Inline commands:** Say the wake phrase immediately followed by a command, e.g. *"Hey Hermes, open the terminal"* — no need to wait for a second utterance.

**Spoken replies (opt-in):** Enable Settings → Hermes → Spoken replies to have Hermes read its answers aloud.

**Stop:** Say *"stop listening"* or *"para de ouvir"* at any time, or click the microphone icon in the top bar to disable Agent Mode.

**Tray icon (top bar, right side):**

| State | Icon | Visual |
|---|---|---|
| Listening | Microphone | Dim blue background |
| Awake (waiting for command) | Microphone | Solid blue, pulsing |
| Processing | Spinning circle | Solid blue |
| Speaking | Speaker | Solid blue |

Clicking the tray icon disables Agent Mode.

**Privacy note:** Agent Mode uses the browser's Web Speech API. In Chrome, audio is sent to Google's servers for transcription — not only the audio after the wake phrase. Enable only on trusted networks. The feature is opt-in and off by default.

**Browser support:** Chrome / Chromium (full), Safari (partial), Firefox (not supported — toggle is disabled automatically).

---

## Hermes Actions

Hermes can execute OS actions. When it decides to trigger an action, it appends a special tag to its response:

```
<!--caios:action {"type": "<action>", "payload": { ... }} -->
```

This tag is invisible to you — the system processes it automatically. You can ask Hermes to perform any of the actions below:

| Action | Payload | What it does |
|---|---|---|
| `open_app` | `{"app": "terminal"\|"files"\|"firefox"\|"photos"\|"documents"\|"musics"\|"settings"\|"systemMonitor"\|"about"}` | Opens an application |
| `close_app` | `{"app": "<app_id>"}` | Closes all instances of an app |
| `open_file` | `{"name": "file.ext", "url": "/data/root/…"}` | Opens a file with its associated handler |
| `set_theme` | `{"dark": true\|false}` | Sets dark or light mode |
| `toggle_theme` | `{}` | Toggles the current theme |
| `set_wallpaper` | `{"path": "/wallpapers/desktop/sunset.webp"\|"…/nebula.webp"\|"…/default.webp"}` | Changes the wallpaper |
| `set_dock_size` | `{"size": 28..64}` | Sets the dock icon size |
| `set_desktop_size` | `{"size": 32..80}` | Sets the desktop icon size |
| `toggle_sounds` | `{}` | Enables/disables system sounds |
| `play_sound` | `{"sound": "bell"\|"click"\|"startup"\|"office"}` | Plays a system sound |
| `show_notification` | `{"title": "…", "message": "…"}` | Shows a system notification |
| `toggle_notification_panel` | `{}` | Opens/closes the notification panel |
| `set_language` | `{"lang": "pt"\|"en"}` | Changes the system language |
| `toggle_auto_hide_dock` | `{}` | Toggles dock auto-hide |
| `toggle_tips` | `{}` | Enables/disables system tips |
| `toggle_agent_mode` | `{}` | Enables/disables Agent Mode |

**Example requests to Hermes:**
- "Open the terminal"
- "Switch to dark mode"
- "Change the wallpaper to the sunset"
- "Show a notification with the message 'Hello!'"
- "Change the language to Portuguese"

---

## Virtual File System

The file system is loaded from `/data/fs.json` the first time an application needs it. The file describes a hierarchical tree of folders and files (`FileItem`).

**Node structure:**

```typescript
interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'drive';
  icon: string;
  color?: string;
  size?: number;
  modified?: string;
  children?: FileItem[];
  url?: string;
  thumb?: string;
}
```

**Recognized extensions:**

| Type | Extensions |
|---|---|
| Images | jpg, jpeg, png, svg, webp, gif |
| Audio | mp3, wav, ogg, m4a, flac |
| Documents | txt, log, md, json, ts, js, css, scss, pdf, text |

When you click a file in the file manager or use the terminal command `open`, `ProcessManager` queries `AppRegistry` to find the application that supports the extension and opens it automatically.

---

## Settings

The **Settings** application has the following sections:

### Appearance
- **Color scheme**: Light / Dark
- **Wallpaper**: Choose between static (`.webp`) or animated (`.mp4`) wallpapers for desktop; separate wallpaper for mobile

### Desktop
- **Auto-hide Dock**: hides the dock automatically when windows are over it
- **Dock Icon Size**: adjusts icon size (default: 48, range 28–64)
- **Desktop Items Size**: adjusts the size of icons pinned to the desktop (default: 40, range 32–80)

### Sound
- **System Sounds**: enable/disable interaction sounds (mouse, boot, notifications)

### Language
- **Language & Region**: Portuguese (Brazil) or English (United States). Changes are applied instantly.

### Hermes
- **AI Model**: select the Gemini model Hermes uses
- **Agent Mode**: enable always-on voice activation (requires microphone permission)
- **Spoken replies**: have Hermes read its responses aloud (opt-in)
- **Wake phrases**: "Hello Hermes", "Oi Hermes", "Hey Hermes"

### System
- **System Tips**: enable/disable system tip notifications

**Persistence:** all settings are saved in the browser's `localStorage` and automatically restored on the next visit.

---

## Notifications & Tips

### Notification Center

Click the bell icon in the top bar (or swipe down on mobile) to open the notification panel. The panel shows:
- Active notifications (auto-dismissed after ~6 seconds by default)
- Full notification history for the session
- Music player widget (if a track is playing)

### System Tips

The system displays periodic tips as notifications:
- First tip: 15 seconds after boot
- Subsequent tips: every 7–10 minutes
- Separate pools for desktop and mobile (no repetition until the cycle is exhausted)
- Can be disabled in Settings → System

---

## Mobile Navigation

On devices with screen width less than 768 px, Cai_OS uses a dedicated mobile layout:

### Bottom navigation bar

| Button | Action |
|---|---|
| Square icon | Toggle Overview (recent apps) |
| Center pill | Home — minimizes all processes and closes drawers |
| Grid icon | Toggle App Drawer |

### Overview (recent apps)

- **Swipe up** on a card → closes the process with animation
- **Tap** a card → resumes the app and closes the overview
- **Individual close button** per card
- **Close all** → terminates all processes

### In-app gestures

| App | Gesture | Action |
|---|---|---|
| Photos | Horizontal swipe | Navigate between images |
| Photos | Pinch | Zoom |
| Documents | Horizontal swipe | Navigate between documents |
| Documents | Pinch | Zoom |
| TopBar | Swipe down | Opens the notification panel |
| Dock | Long-press (500 ms) | Opens the app context menu |

---

## Data Models

TypeScript interfaces copied verbatim from source:

```typescript
// Open process data
interface Process extends AppBase {
  id: string;
  appId: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  cascadeIndex: number;
  data?: ProcessData;
}

// Installed app definition
interface AppDefinition extends AppBase {
  data?: ProcessData;
  handle?: string[];                             // supported file extensions
  loadComponent?: () => Promise<Type<Base>>;     // lazy loading
}

// Dock item (app + runtime state)
interface DockItem extends AppDefinition {
  pinned: boolean;
  isOpen: boolean;
  isActive: boolean;
  count: number;
  pids: string[];
}

// Virtual file system node
interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'drive';
  icon: string;
  color?: string;
  size?: number;
  modified?: string;
  children?: FileItem[];
  url?: string;
  thumb?: string;
}

// Notification
interface Notification {
  id: string;
  title: string;
  message: string;
  icon?: string;
  color?: string;
  appId?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  duration?: number;
  action?: () => void;
}

// Music player state
interface MusicPlayerState {
  currentTrack: FileItem | null;
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  discSpinState: DiscSpinState;
}

// Hermes message
interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
}

// Hermes action
interface HermesAction {
  type: HermesActionType;
  payload?: Record<string, JsonValue>;
}

// Loaded document
interface LoadedDoc {
  fileType: 'pdf' | 'text' | 'markdown' | 'unsupported';
  fileName: string;
  textContent: string;
}
```

---

## Core Services

| Service | Responsibility |
|---|---|
| `ProcessManager` | Window/process lifecycle (open, close, focus, minimize) |
| `WindowService` | Drag, resize, snap per window instance (provided locally) |
| `ScreenService` | Viewport width/height, `isMobile` and `isDesktop` signals |
| `AppRegistry` | Reactive app catalog, lookup by ID and file extension |
| `AppLauncher` | App launch orchestration |
| `DockService` | Dock items, pin/unpin, `localStorage` persistence |
| `FileSystem` | Virtual file system (HTTP → JSON → node maps) |
| `Settings` | Persisted preferences (wallpaper, dockSize, geminiModel, …) |
| `Theme` | Dark/light mode, syncs with `prefers-color-scheme` |
| `LanguageService` | Language switching (pt/en), `localStorage` persistence |
| `NotificationService` | Active notification queue and history |
| `Sound` | `AudioContext` sound player with buffer cache |
| `Gemini` | Google Generative AI wrapper with API key fallback |
| `HermesChatService` | Chat state, history, send with streaming |
| `HermesActionService` | Parse and dispatch `<!--caios:action -->` tags |
| `AgentModeService` | Agent Mode state machine: listening → awake → processing → speaking |
| `SpeechRecognitionService` | Web Speech API wrapper with auto-restart and backoff |
| `SpeechSynthesisService` | Browser TTS wrapper, Markdown stripping |
| `WakeWordService` | Wake phrase detection with fuzzy matching (Levenshtein ≤ 1) |
| `AudioPlayer` | HTML `<audio>` wrapper with seek, playlist, and state |
| `LyricsService` | LRCLIB lyrics fetch, LRC parse, active line tracking |
| `TerminalCommands` | Terminal command implementations |
| `DesktopIconsService` | Desktop-pinned app shortcuts, `localStorage` persistence |
| `DocumentLoaderService` | Document loading and type detection |
| `SystemTips` | Periodic tip scheduling |

---

## Internationalization (i18n)

**Supported languages:** Portuguese (`pt`) and English (`en`).

The active language is determined in order:
1. `lang` key in `localStorage`
2. `navigator.language` prefix (`pt` or `en`)
3. Default: `pt`

To change the language: Settings → Language, or ask Hermes: *"Change the language to Portuguese"*.

`LanguageService` exposes `currentLang` (signal) and `t` (computed with all translations). Every user-visible string comes from `lang.t().section.key`.

---

## Environment Variables

Environment variables are read from `src/.env` by the `mynode.js` script and written to `src/environments/environment.ts` (git-ignored).

| Variable | Type | Purpose |
|---|---|---|
| `geminiApiKey` | `string` | Primary Google Generative AI API key (used by Hermes) |
| `geminiApiKey2` | `string` | Fallback key — used when the primary returns 404 or 429 |

---

## Technical Reference

### Stack

| Technology | Version |
|---|---|
| Angular | 22.2.1 |
| TypeScript | 6.0.3 |
| Tailwind CSS | 4.1.18 |
| `@google/generative-ai` | 0.24.1 |
| `ng2-pdf-viewer` | 10.4.0 |
| Vitest | 4.0.18 |
| Node.js (build) | ≥ 20 |

### npm Scripts

| Script | Description |
|---|---|
| `npm start` | Generates `environment.ts` and starts the development server |
| `npm run build` | Production build |
| `npm test` | Runs the test suite (Vitest) |
| `npm run watch` | Incremental development build |

### localStorage Persistence

| Key | Default | Description |
|---|---|---|
| `lang` | `pt` | Current language |
| `theme` | — (system) | `dark` or `light` |
| `wallpaper` | `/wallpapers/desktop/default.webp` | Desktop wallpaper |
| `mobileWallpaper` | `/wallpapers/mobile/default.webp` | Mobile wallpaper |
| `dockSize` | `48` | Dock icon size |
| `desktopSize` | `40` | Desktop icon size |
| `soundMuted` | `false` | System sounds muted |
| `autoHideDock` | `true` | Dock auto-hide enabled |
| `tipsEnabled` | `true` | System tips enabled |
| `geminiModel` | `gemini-flash-lite-latest` | Selected Gemini model |
| `agentModeEnabled` | `false` | Agent Mode enabled |
| `agentSpeakReplies` | `false` | Spoken replies enabled |
| `pinnedAppIds` | `['firefox','files','terminal']` | Apps pinned to dock |
| `desktopIcons` | `[]` | Apps pinned to desktop |

---

## Contact

**Caio Souza Silva**
- Portfolio: [caiossilva.com](https://caiossilva.com)
- GitHub: [github.com/CaioSSilva](https://github.com/CaioSSilva)
- Email: caiosouzasilva13650@gmail.com
