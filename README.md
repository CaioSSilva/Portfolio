# Cai_OS

![Version](https://img.shields.io/badge/version-3.1.0-blue)
![Angular](https://img.shields.io/badge/Angular-22-red)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue)
![Vitest](https://img.shields.io/badge/tests-Vitest-brightgreen)
![Deploy](https://img.shields.io/badge/deploy-Vercel-black)

A web-based operating system simulator built as an interactive developer portfolio. Cai_OS is a GNOME-inspired desktop environment running entirely in the browser, built with Angular 22 and Signals-based reactivity.

---

## Overview

Cai_OS is not a traditional portfolio page — it is a fully functional simulated desktop operating system. Visitors interact with real windowed applications, a terminal, a file system, an AI assistant (Hermes), and system settings, all inside the browser.

**Key highlights:**
- Standalone Angular 22 application with zero routing — the OS is the application
- Signals-based reactivity throughout (no NgRx, no RxJS state stores)
- Full desktop window management: drag, resize, snap, maximize, minimize, cascade
- Mobile-responsive: dedicated mobile layout with swipe navigation and overview
- Hermes AI assistant powered by `@google/generative-ai`, capable of controlling the OS via structured action tags
- **Agent Mode** — always-on voice activation via wake phrase ("Hello Hermes" / "Oi Hermes"), powered by the Web Speech API
- Virtual file system loaded from a static JSON manifest (`/data/fs.json`)
- Synced lyrics for the music player via the public LRCLIB API
- Vercel Analytics and Speed Insights integrated at startup

---

## Live Demo

> **[https://caiossilva.com](https://caiossilva.com)**

---

## Documentation

| Language | File |
|---|---|
| 🇧🇷 Português | [`public/data/root/home/documents/Cai_OS - Documentação.md`](public/data/root/home/documents/Cai_OS%20-%20Documenta%C3%A7%C3%A3o.md) |
| 🇺🇸 English | [`public/data/root/home/documents/Cai_OS - Documentation.md`](public/data/root/home/documents/Cai_OS%20-%20Documentation.md) |

> These files are also available **inside the running OS** — open the Documents app and select either file to read them in the Document Viewer.

---

## What's New — v3.1.0

- **Expanded Hermes AI Actions**: Full OS control with window management (`minimize_all`, `close_all_apps`, `focus_app`), browser navigation & Google search (`browser_open_url`, `browser_search`), advanced media playback (`music_set_volume`, `music_toggle_mute`, `music_seek`), and system triggers (`clear_notifications`, `toggle_voice_feedback`, `show_system_tip`)
- **Modular Action Architecture**: Extracted `HermesMediaActionsService` (`core/services/hermes-media-actions.ts`) to maintain strict service cohesion (≤ 5 dependencies per service)
- **Enhanced Agent Documentation & System Prompts**: Synchronized documentation and bilingual Hermes context dictionaries with all supported action tags
- **100% Test Suite Coverage**: Comprehensive unit test suite with 716 passing tests

<details>
<summary>Previous release — v3.0.0</summary>

- **Agent Mode**: Always-on voice service for Hermes — say "Hello Hermes" or "Oi Hermes" to wake it without opening any app. Inline commands supported (e.g. *"Hey Hermes, open the terminal"*)
- **Tray icon**: Microphone icon in the top-bar right cluster reflects live agent state (listening / awake / processing / speaking)
- **Spoken replies**: Opt-in TTS via Web Speech API — Hermes reads its answers aloud; Markdown is stripped before synthesis
- **Settings → Hermes section**: Agent mode toggle, spoken replies toggle, wake phrase reference, privacy notice, per-browser support detection
- **4 core services**: `AgentModeService` (state machine), `SpeechRecognitionService` (Web Speech wrapper + backoff), `SpeechSynthesisService` (TTS), `WakeWordService` (fuzzy wake-phrase detection, Levenshtein ≤ 1)
- **`toggle_agent_mode` action**: Hermes can enable/disable Agent Mode via the action tag pipeline
- **`notifyAgentReply()`** on `HermesChatService`: Shows a system notification when Agent Mode replies while the Hermes window is closed and spoken replies are off

</details>

<details>
<summary>Previous release — v2.5.0</summary>

- **Window snap system**: Drag-to-snap with ghost preview overlay (left, right, top-full, four corners)
- **Lyrics integration**: Synced (LRC) and plain-text lyrics from LRCLIB with active-line tracking
- **Desktop icons**: Pinnable shortcuts on the desktop, persisted to `localStorage`
- **Dock drag-and-drop**: Drag apps from the grid onto the dock to pin at a specific position
- **Dual API key fallback**: Gemini retries with a secondary key on 404/429 errors
- **Mobile gestures**: Pinch-to-zoom and swipe navigation in ImageViewer and DocumentViewer

</details>

---

## Architecture

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
│  │  │  AgentMode  SpeechRecognition  WakeWord    │  │   │
│  │  │  AudioPlayer  LyricsService  Sound         │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  Static Assets: /data/fs.json  /sounds/*.ogg            │
│                 /wallpapers/   /videos/wallpapers/       │
└─────────────────────────────────────────────────────────┘
```

**Design patterns used:**
- **Service-per-concern**: each domain (process management, file system, audio, AI) is an isolated `providedIn: 'root'` service
- **Signals everywhere**: `signal()`, `computed()`, `effect()` — no direct template subscriptions or OnPush-breaking patterns
- **Base class inheritance**: all feature apps extend `Base<T>` which provides `data` (model input) and `handle` (supported file extensions)
- **Process model**: every open window is a `Process` object managed by `ProcessManager`; `WindowService` is provided per window instance
- **Hermes action pipeline**: raw AI text → regex parse `<!--caios:action {...} -->` → typed dispatch → app/system action execution

**Data flow:**

```
User interaction
  → Component (signal mutation)
    → Service (signal update / effect)
      → Other services (computed derivation)
        → Template re-render (signal read)
```

---

## Technologies

### Core
| Package | Version |
|---|---|
| `@angular/core` | ^22.2.1 |
| `@angular/common` | ^22.2.1 |
| `@angular/forms` | ^22.2.1 |
| `@angular/router` | ^22.2.1 |
| `@angular/platform-browser` | ^22.2.1 |
| `rxjs` | ~7.8.2 |
| `tslib` | ^2.8.1 |

### Styling
| Package | Version |
|---|---|
| `tailwindcss` | ^4.1.18 |
| `@tailwindcss/postcss` | ^4.1.18 |
| `postcss` | ^8.5.6 |
| `@fortawesome/fontawesome-free` | ^7.1.0 |
| `@fortawesome/free-brands-svg-icons` | ^7.1.0 |

### AI & External
| Package | Version |
|---|---|
| `@google/generative-ai` | ^0.24.1 |
| `ng2-pdf-viewer` | ^10.4.0 |
| `@vercel/analytics` | ^1.6.1 |
| `@vercel/speed-insights` | ^1.3.1 |

### Dev Tools
| Package | Version |
|---|---|
| `typescript` | ~6.0.3 |
| `vitest` | ^4.0.18 |
| `@angular/cli` | ^22.0.4 |
| `@angular/build` | ^22.0.4 |
| `@angular/compiler-cli` | ^22.2.1 |
| `jsdom` | ^28.0.0 |
| `dotenv` | ^17.4.2 |

---

## Project Structure

```
src/
├── main.ts                          # Bootstrap + Vercel Analytics
├── environments/
│   └── environment.ts               # Generated by mynode.js (git-ignored)
├── app/
│   ├── app.ts                       # Root component
│   ├── app.html                     # Root template
│   ├── app.config.ts                # ApplicationConfig (HttpClient)
│   ├── app.routes.ts                # Empty (no routing — OS pattern)
│   │
│   ├── core/
│   │   ├── version.ts               # APP_VERSION constant
│   │   ├── models/                  # TypeScript interfaces & type aliases
│   │   │   ├── agent-mode.ts        # AgentModeState, Web Speech API interfaces, WakeWordMatch
│   │   │   ├── apps.ts              # AppRegistry + getInstalledApps()
│   │   │   ├── base.ts              # Base directive, AppBase, ProcessData
│   │   │   ├── desktop.ts           # Rect, pinnedDesktopItem
│   │   │   ├── dock.ts              # AppDefinition, DockItem
│   │   │   ├── document.ts          # DocFileType, LoadedDoc
│   │   │   ├── file.ts              # FileItem, extension constants
│   │   │   ├── gemini.ts            # GeminiModel, GenAIFactory
│   │   │   ├── hermes.ts            # Message
│   │   │   ├── hermes-action.ts     # HermesAction, all payload types
│   │   │   ├── music.ts             # MusicPlayerState, LrcLine, etc.
│   │   │   ├── notification.ts      # Notification
│   │   │   ├── process.ts           # Process
│   │   │   └── setting.ts           # SystemInfo, SettingSection
│   │   │
│   │   ├── services/                # Application services (all providedIn: root)
│   │   │   ├── process-manager.ts   # Window/process lifecycle
│   │   │   ├── window.ts            # Per-window drag/resize/snap (provided per Window)
│   │   │   ├── screen.ts            # Viewport size, isMobile, isDesktop
│   │   │   ├── apps.ts              # App grid, search, context menu
│   │   │   ├── app-launcher.ts      # Launch wrapper
│   │   │   ├── app-registry.ts      # Registry computed from getInstalledApps()
│   │   │   ├── dock.ts              # Dock items, pin/unpin, click handling
│   │   │   ├── desktop-icons.ts     # Desktop icon pin/unpin
│   │   │   ├── context-menu.ts      # Context menu state
│   │   │   ├── file-system.ts       # Virtual FS (HTTP → JSON tree)
│   │   │   ├── settings.ts          # Persisted user preferences
│   │   │   ├── theme.ts             # Dark/light mode
│   │   │   ├── language.ts          # i18n language switching
│   │   │   ├── notification.ts      # Notification queue + history
│   │   │   ├── sound.ts             # AudioContext-based sound playback
│   │   │   ├── mobile-nav.ts        # Mobile overview / home / app drawer
│   │   │   ├── gemini.ts            # Google Gemini API wrapper
│   │   │   ├── hermes-chat.ts       # Chat message state + send flow
│   │   │   ├── hermes-action.ts     # Action parser + dispatcher
│   │   │   ├── hermes-app-actions.ts  # open_app / close_app / open_file
│   │   │   ├── hermes-system-actions.ts # set_theme / set_wallpaper / etc.
│   │   │   ├── hermes-docs.ts       # System prompt + action reference (PT/EN)
│   │   │   ├── agent-mode.ts        # Agent Mode state machine orchestrator
│   │   │   ├── speech-recognition.ts  # Web Speech API wrapper + backoff
│   │   │   ├── speech-synthesis.ts  # Browser TTS wrapper, Markdown stripping
│   │   │   ├── wake-word.ts         # Wake phrase normalisation + fuzzy match
│   │   │   ├── terminal-commands.ts # Built-in terminal commands
│   │   │   ├── audio-player.ts      # HTML Audio element wrapper
│   │   │   ├── lyrics.service.ts    # LRCLIB fetch + LRC parsing
│   │   │   ├── system-info.ts       # Browser/device info
│   │   │   ├── system-tips.ts       # Random tip notifications
│   │   │   └── document-loader.ts   # PDF / Markdown / text loading
│   │   │
│   │   ├── language/
│   │   │   ├── i18n.types.ts        # Language type, TranslationSchema, TRANSLATIONS
│   │   │   ├── en.ts                # English strings
│   │   │   └── pt.ts                # Portuguese strings
│   │   │
│   │   ├── pipes/
│   │   │   └── markdown-pipe.ts     # Custom Markdown → SafeHtml pipe
│   │   │
│   │   └── utils/
│   │       └── uuid.ts              # crypto.randomUUID() wrapper
│   │
│   ├── layout/                      # Desktop chrome components
│   │   ├── top-bar/                 # Menu bar (clock, notifications, power)
│   │   ├── dock/                    # App dock with drag-and-drop pin
│   │   ├── apps-grid/               # App launcher overlay
│   │   ├── mobile-nav-bar/          # Bottom bar (mobile only)
│   │   ├── mobile-overview/         # Swipe-card app switcher (mobile)
│   │   ├── notification-center/     # Notification panel + music widget
│   │   ├── window-switcher/         # Ctrl+` app switcher overlay
│   │   ├── music-widget/            # Mini player inside notification panel
│   │   └── now-playing-widget/      # Now-playing indicator in top bar
│   │
│   ├── shared/
│   │   └── ui/
│   │       ├── window/              # Windowed app host (provides WindowService)
│   │       ├── boot/                # Boot screen with progress bar
│   │       ├── shutdown/            # Shutdown confirmation dialog
│   │       └── context-menu/        # Right-click context menu
│   │
│   └── features/                   # Feature applications (extend Base)
│       ├── about-project/           # About the project + app showcase
│       ├── browser/                 # Embedded iframe browser (Firefox)
│       ├── terminal/                # Unix-like terminal emulator
│       ├── files/                   # File manager (sidebar + grid/list)
│       │   └── components/
│       │       ├── breadcrumbs/
│       │       ├── grid/
│       │       ├── list/
│       │       └── sidebar/
│       ├── image-viewer/            # Photos gallery + viewer
│       ├── document-viewer/         # PDF + Markdown + text viewer
│       ├── musics/                  # Music player with lyrics
│       ├── settings/                # Settings panels
│       ├── system-monitor/          # CPU/RAM/network graphs + process list
│       ├── hermes/                  # Hermes AI chat interface
│       └── desktop-icons/           # Desktop icon overlay
│
public/
├── data/
│   ├── fs.json                      # Virtual file system manifest
│   └── root/home/…                  # Actual documents, images, audio
├── sounds/                          # .ogg system sounds
├── wallpapers/                      # Static wallpaper images
└── videos/wallpapers/               # Animated video wallpapers
```

---

## Components

### Layout Components

| Component | File | Description | Desktop | Mobile |
|---|---|---|---|---|
| `TopBar` | `layout/top-bar/top-bar.ts` | Menu bar: clock, notifications button, power button, now-playing widget | Visible | Visible (swipe-down to open notifications) |
| `Dock` | `layout/dock/dock.ts` | App dock with click, long-press context menu, drag-to-pin | Visible, auto-hide | Hidden |
| `AppsGrid` | `layout/apps-grid/apps-grid.ts` | Fullscreen app launcher with search and drag-to-dock | Overlay | Overlay |
| `MobileNavBar` | `layout/mobile-nav-bar/mobile-nav-bar.ts` | Bottom navigation: Home, Overview, All Apps | Hidden | Visible |
| `MobileOverview` | `layout/mobile-overview/mobile-overview.ts` | Swipe-card overview of open processes | Hidden | Overlay |
| `NotificationCenter` | `layout/notification-center/notification-center.ts` | Notification panel with history and music widget | Panel | Panel |
| `WindowSwitcher` | `layout/window-switcher/window-switcher.ts` | `Ctrl+\`` overlay for cycling open windows | Overlay | N/A |
| `MusicWidget` | `layout/music-widget/music-widget.ts` | Mini player inside the notification panel | Inside panel | Inside panel |
| `NowPlayingWidget` | `layout/now-playing-widget/now-playing-widget.ts` | Compact now-playing indicator in the top bar | Visible when playing | Visible when playing |

### Shared UI Components

| Component | File | Description |
|---|---|---|
| `Window` | `shared/ui/window/window.ts` | Host container for every process; provides `WindowService` per instance; handles drag, resize, snap |
| `Boot` | `shared/ui/boot/boot.ts` | Boot screen with simulated progress bar and startup sound |
| `Shutdown` | `shared/ui/shutdown/shutdown.ts` | Shutdown confirmation dialog with cancel, restart, power off |
| `ContextMenu` | `shared/ui/context-menu/context-menu.ts` | Right-click context menu for dock items and desktop icons |

### Feature Applications

| Component | File | Description | Desktop | Mobile |
|---|---|---|---|---|
| `AboutProject` | `features/about-project/about-project.ts` | Project overview, app descriptions, resume download | Windowed | Windowed |
| `Browser` | `features/browser/browser.ts` | Embedded iframe browser with URL history and back navigation | Windowed | Windowed |
| `Terminal` | `features/terminal/terminal.ts` | Unix-like terminal: command history, Tab autocomplete, path navigation | Windowed | Windowed |
| `Files` | `features/files/files.ts` | File manager with collapsible sidebar, grid/list views, search, resizable sidebar | Windowed | Windowed (no sidebar resize) |
| `ImageViewer` | `features/image-viewer/image-viewer.ts` | Image gallery with zoom, rotate, pan, pinch-to-zoom, keyboard arrow navigation | Windowed | Windowed |
| `DocumentViewer` | `features/document-viewer/document-viewer.ts` | PDF, Markdown, and text viewer with zoom, anchor scroll, keyboard navigation | Windowed (lazy-loaded) | Windowed |
| `Musics` | `features/musics/musics.ts` | Music player with library, playback controls, seek, synced lyrics | Windowed | Windowed (compact) |
| `SettingsComponent` | `features/settings/settings.ts` | Settings: appearance, desktop, sound, language, Hermes (agent mode, model, spoken replies), system info | Windowed | Windowed (narrow layout) |
| `SystemMonitor` | `features/system-monitor/system-monitor.ts` | CPU/RAM graph (simulated), network stats, process list with kill | Windowed | Windowed |
| `Hermes` | `features/hermes/hermes.ts` | AI chat with Gemini, image attachment, model picker, streaming response | Windowed | Windowed |
| `DesktopIcons` | `features/desktop-icons/desktop-icons.ts` | Desktop icon overlay rendered directly on the wallpaper | Visible | N/A |

---

## Services

### `ProcessManager` — `core/services/process-manager.ts`
Central process lifecycle manager.

**Signals:** `processes`, `isTopBarHidden`, `isDockHidden`, `hasActiveProcesses`, `activeProcessId`

**Public API:**
- `open(app, data?)` — open an app (singleton per appId unless `forceOpen`)
- `forceOpen(app, data?)` — always create a new instance
- `close(processId)` — close a process by ID
- `closeAllInstancesById(appId)` — close all windows of an app
- `focus(processId)` — bring a window to front
- `toggleMinimize(processId)` — minimize/restore
- `minimizeAllVisible()` — minimize all open windows
- `openFile(node)` — find the handler app for a file and open it
- `updateTopOverlap(bool)` / `updateBottomOverlap(bool)` — hide/show top bar or dock

---

### `WindowService` — `core/services/window.ts`
Per-window service (provided inside `Window` component). Handles drag, resize, snap.

**Signals:** `isMaximized`, `isSnapped`, `isDragging`, `isResizing`, `isVisible`, `snapGhost`

**Public API:** `init()`, `startDrag()`, `startResize()`, `toggleMaximize()`, `close()`, `minimize()`, `focus()`

---

### `ScreenService` — `core/services/screen.ts`
Tracks viewport dimensions. `MOBILE_BREAKPOINT = 768`, `TABLET_BREAKPOINT = 1024`.

**Signals:** `width`, `height`, `isMobile` (computed), `isDesktop` (computed)

---

### `AppRegistry` — `core/services/app-registry.ts`
Reactive app registry built from `getInstalledApps()`.

**Signals/Computed:** `registry`, `definitions`

**Public API:** `getAppById(id)`, `findHandlerForExtension(ext)`, `searchApps(query)`

---

### `DockService` — `core/services/dock.ts`
Manages dock items (pinned + open processes). Persists to `localStorage` under key `pinnedAppIds`. Default pinned apps: `['firefox', 'files', 'terminal']`.

**Signals:** `pinnedAppIds`, `forceShow`, `dockItems` (computed)

**Public API:** `handleAppClick()`, `pinApp(id, index?)`, `unpinApp(id)`, `closeActiveApp()`, `openActiveApp()`, `focusActiveApp()`, `unPinActiveApp()`

---

### `FileSystem` — `core/services/file-system.ts`
Loads `/data/fs.json`, builds node/parent/URL maps and a search index.

**Signals:** `tree`, `isLoaded`, `isLoading`, `error`, `totalFiles` (computed), `totalSize` (computed)

**Public API:** `ensureLoaded()`, `getNode(id)`, `getChildren(id)`, `getPath(id)`, `searchFiles(query, maxResults?)`, `formatFileSize(bytes)`, `getFileExtension(name)`, `getFilesByExtensions(exts)`, `getSiblingsByUrl(url, exts)`, `downloadFile(path, name)`

---

### `Settings` — `core/services/settings.ts`
Persisted user settings via `localStorage`.

**Signals:** `dockSize` (default 48, range 28–64), `desktopSize` (default 40, range 32–80), `systemMuted` (default false), `autoHideDock` (default true), `tipsEnabled` (default true), `geminiModel` (default `gemini-flash-lite-latest`), `agentModeEnabled` (default false), `agentSpeakReplies` (default false), `wallpaper` (computed from desktop/mobile)

**Public API:** `setWallpaper(path)`, `setDockSize(size)`, `setDesktopSize(size)`, `toggleAutoHideDock()`, `setGeminiModel(model)`, `toggleSystemTips()`, `toggleSystemSounds()`, `toggleAgentMode()`, `disableAgentMode()`, `toggleAgentSpeakReplies()`

---

### `Theme` — `core/services/theme.ts`
Dark/light mode. Persisted under `localStorage` key `theme`. Listens to `prefers-color-scheme` system changes.

**Signals:** `isDarkMode`

**Public API:** `toggle()`, `setDark(value)`

---

### `LanguageService` — `core/services/language.ts`
i18n language switching. Reads browser language on first load, persisted under `localStorage` key `lang`. Defaults to `'pt'`.

**Signals:** `currentLang`, `t` (computed translation object)

**Public API:** `setLanguage(lang)`, `toggle()`

---

### `NotificationService` — `core/services/notification.ts`
Manages active and historical notifications. Auto-dismisses after `duration` ms (default 6000).

**Signals:** `activeNotifications`, `history`, `isPanelOpen`

**Public API:** `show(notif)`, `dismiss(id)`, `clearHistory()`, `togglePanel()`, `openPanel()`, `closePanel()`

---

### `Sound` — `core/services/sound.ts`
`AudioContext`-based sound player with buffer cache. Sounds are `.ogg` files under `/sounds/`. Respects `Settings.systemMuted`.

**Public API:** `play(soundName)`

---

### `Gemini` — `core/services/gemini.ts`
Wraps `@google/generative-ai`. Uses `environment.geminiApiKey` with fallback to `environment.geminiApiKey2` on 404/429 errors. Injects Hermes system prompt + `HERMES_DOCS`.

**Public API:** `listModels()`, `generateResponse(prompt, history, fileData?)`, `generateResponseStream(prompt, history, fileData?, onChunk)`

---

### `HermesChatService` — `core/services/hermes-chat.ts`
Chat message state. Keeps the last 6 messages as context history. Streams responses, parses actions mid-stream.

**Signals:** `messages`, `isLoading`

**Public API:** `send(text, fileData, previewUrl)`, `clearMessages()`, `notifyAgentReply(text)`

---

### `HermesActionService` — `core/services/hermes-action.ts`
Parses `<!--caios:action {...} -->` tags from AI responses and dispatches to `HermesAppActionsService`, `HermesMediaActionsService`, or `HermesSystemActionsService`.

**Public API:** `parseActions(text): ParseActionResult`, `execute(action)`

---

### `AudioPlayer` — `core/services/audio-player.ts`
HTML5 `Audio` element wrapper with seek debouncing, disc spin state, and playlist support.

**Signals:** `currentTrack`, `trackList`, `isPlaying`, `isLoading`, `hasError`, `currentTime`, `duration`, `volume`, `isMuted`, `discSpinState`

**Public API:** `play(track, playlist?)`, `togglePlay()`, `stop()`, `nextTrack()`, `prevTrack()`, `seek(time, immediate?)`, `setVolume(volume)`, `toggleMute()`

---

### `LyricsService` — `core/services/lyrics.service.ts`
Fetches lyrics from `https://lrclib.net/api/search`. Parses LRC format. Tracks active line with binary search.

**Signals:** `lines`, `isLoading`, `hasLyrics`, `isPlainOnly`, `activeLine` (computed)

---

### `TerminalCommands` — `core/services/terminal-commands.ts`
Implements all terminal commands against the virtual file system.

**Public API:** `execute(rawCommand, currentPath): Promise<CommandResult>`, `resolvePath(pathStr, currentPath)`

---

### `DesktopIconsService` — `core/services/desktop-icons.ts`
Pinned desktop app shortcuts. Persisted under `localStorage` key `desktopIcons`.

**Signals:** `pinnedAppIds`, `onDesktopApps` (computed)

**Public API:** `pinApp(id)`, `unpinApp(id)`, `openApp(id)`

---

### `SystemTips` — `core/services/system-tips.ts`
Schedules random tip notifications. First tip at 15 s, then every 7–10 minutes. Separate pools for desktop and mobile.

**Public API:** `startRandomTips()`, `stopTips()`

---

### `DocumentLoaderService` — `core/services/document-loader.ts`
Loads and processes documents for the DocumentViewer. Detects PDF, Markdown, text, or unsupported.

**Signals:** `isLoading`, `hasError`

**Public API:** `loadAllDocs()`, `loadLibraryForUrl(url)`, `processFile(file)`, `resetState()`

---

### `AgentModeService` — `core/services/agent-mode.ts`
State machine orchestrating the full Agent Mode lifecycle: off → listening → awake → processing → speaking. Coordinates `SpeechRecognitionService`, `WakeWordService`, `HermesChatService`, and `SpeechSynthesisService`.

**Signals:** `state` (`AgentModeState`), `isSupported`, `isSecureContext`, `unsupportedReason` (`AgentUnsupportedReason`)

**Public API:** `toggleAgentMode()`

---

### `SpeechRecognitionService` — `core/services/speech-recognition.ts`
Wraps the browser Web Speech API with continuous restart and exponential backoff. Detects mobile devices (`navigator.maxTouchPoints` + UA) and marks them as unsupported.

**Tokens:** `SPEECH_RECOGNITION_FACTORY`, `SPEECH_RECOGNITION_UNSUPPORTED_REASON`

**Signals:** `transcript`, `isListening`, `isSupported`, `isSecureContext`, `unsupportedReason` (`AgentUnsupportedReason`)

**Public API:** `start(onTranscript, onError)`, `stop()`

---

### `SpeechSynthesisService` — `core/services/speech-synthesis.ts`
Browser TTS wrapper. Strips Markdown before speaking. Uses `queueMicrotask` to work around a Chrome `cancel()`→`speak()` bug.

**Signals:** `isSpeaking`

**Public API:** `speak(text)`, `cancel()`, `isSupported()`

---

### `WakeWordService` — `core/services/wake-word.ts`
Normalises transcripts and matches wake phrases ("Hello/Oi/Hey Hermes") using exact match plus Levenshtein ≤ 1 fuzzy fallback. Returns the extracted inline command if present.

**Public API:** `match(transcript): WakeWordMatch | null`

---

## Data Models

All interfaces are copied verbatim from source:

```typescript
// core/models/base.ts
export interface ProcessData {
  source?: { x: number; y: number };
  url?: string;
  [key: string]: string | number | boolean | { x: number; y: number } | undefined;
}

export interface AppBase {
  id: string;
  title: string;
  icon: string;
  color: string;
  component: Type<Base<ProcessData | string>>;
}
```

```typescript
// core/models/dock.ts
export interface AppDefinition extends AppBase {
  data?: ProcessData;
  handle?: string[];
  loadComponent?: () => Promise<Type<Base>>;
}

export interface DockItem extends AppDefinition {
  pinned: boolean;
  isOpen: boolean;
  isActive: boolean;
  count: number;
  pids: string[];
}
```

```typescript
// core/models/process.ts
export interface Process extends AppBase {
  id: string;
  appId: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  cascadeIndex: number;
  data?: ProcessData;
}
```

```typescript
// core/models/file.ts
export interface FileItem {
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

export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif'];
export const AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'm4a', 'flac'];
export const DOC_EXTENSIONS = ['txt', 'log', 'md', 'json', 'ts', 'js', 'css', 'scss', 'pdf', 'text'];
```

```typescript
// core/models/notification.ts
export interface Notification {
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
```

```typescript
// core/models/music.ts
export type DiscSpinState = 'playing' | 'seeking-forward' | 'seeking-backward' | 'paused';

export interface LrcLine {
  time: number;
  text: string;
}

export interface MusicPlayerState {
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
```

```typescript
// core/models/hermes-action.ts
export type HermesActionType =
  | 'open_app' | 'close_app' | 'open_file'
  | 'set_theme' | 'toggle_theme' | 'set_wallpaper'
  | 'set_dock_size' | 'set_desktop_size'
  | 'toggle_sounds' | 'play_sound'
  | 'show_notification' | 'toggle_notification_panel'
  | 'set_language' | 'toggle_auto_hide_dock' | 'toggle_tips'
  | 'toggle_agent_mode';

export interface HermesAction {
  type: HermesActionType;
  payload?: Record<string, JsonValue>;
}
```

```typescript
// core/models/setting.ts
export interface SystemInfo {
  os: string;
  kernel: string;
  arch: string;
  cpu: number | string;
  ram: string;
  resolution: string;
  language: string;
  browser: string;
}

export type SettingSection = 'appearance' | 'desktop' | 'sound' | 'about' | 'language' | 'hermes' | 'system';
```

```typescript
// core/models/document.ts
export type DocFileType = 'pdf' | 'text' | 'markdown' | 'unsupported';

export interface LoadedDoc {
  fileType: DocFileType;
  fileName: string;
  textContent: string;
}
```

---

## i18n

**Supported languages:** Portuguese (`pt`) and English (`en`).

The active language is determined at startup:
1. `localStorage` key `lang`
2. `navigator.language` prefix (`pt` or `en`)
3. Default: `pt`

**Translation files:** [`src/app/core/language/pt.ts`](src/app/core/language/pt.ts) and [`src/app/core/language/en.ts`](src/app/core/language/en.ts).

**Adding a new translation key:**

1. Add the key to `pt.ts` (this is the `BaseTranslation` type)
2. Add the same key to `en.ts`
3. The type system (`TranslationSchema extends BaseTranslation`) will flag missing keys at compile time
4. Use it via `inject(LanguageService).t().yourSection.yourKey`

> Note: `apps` and `files` sections have `Record<string, string | undefined>` index signatures to allow dynamic key lookups in templates.

---

## Applications

| ID | Title key | Icon | Color | File extensions handled | Lazy-loaded |
|---|---|---|---|---|---|
| `files` | `apps.files` | `fas fa-folder` | `#3584e4` | — | No |
| `firefox` | `apps.firefox` | `fab fa-firefox-browser` | `#ff7139` | — | No |
| `terminal` | `apps.terminal` | `fas fa-terminal` | `#77767b` | — | No |
| `settings` | `apps.settings` | `fas fa-cog` | `#FE6F5E` | — | No |
| `about` | `apps.about` | `fas fa-user` | `#6f42c1` | — | No |
| `photos` | `apps.photos` | `fas fa-image` | `#4a90e2` | jpg, jpeg, png, svg, webp, gif | No |
| `documents` | `apps.documents` | `fas fa-file` | `#e01b24` | txt, log, md, json, ts, js, css, scss, pdf, text | **Yes** |
| `musics` | `apps.musics` | `fas fa-music` | `#0077b6` | mp3, wav, ogg, m4a, flac | No |
| `systemMonitor` | `apps.systemMonitor` | `fas fa-chart-pie` | `#9AB973` | — | No |
| `hermes` | `apps.hermes` | `fas fa-square-h` | `#00916E` | — | No |

---

## Hermes AI Actions

Hermes can trigger OS actions by appending structured tags to its response:

```
<!--caios:action {"type": "<action>", "payload": { ... }} -->
```

| Action type | Payload | Description |
|---|---|---|
| `open_app` | `{"app": "terminal"\|"files"\|"firefox"\|"photos"\|"documents"\|"musics"\|"settings"\|"systemMonitor"\|"about"}` | Opens an installed application |
| `close_app` | `{"app": "<app_id>"}` | Closes all instances of an app |
| `close_all_apps` | `{}` | Closes all open windows and applications |
| `focus_app` | `{"app": "<app_id>"}` | Brings a running application to the foreground |
| `minimize_all` | `{}` | Minimizes all open windows to show the desktop |
| `open_file` | `{"name": "filename.ext", "url": "/data/root/…"}` | Opens a file with its associated handler |
| `browser_open_url` | `{"url": "https://…"}` | Opens the Firefox browser at the specified URL |
| `browser_search` | `{"query": "search query"}` | Performs a Google search in the browser |
| `set_theme` | `{"dark": true\|false}` | Sets dark or light mode |
| `toggle_theme` | `{}` | Toggles current theme |
| `set_wallpaper` | `{"path": "/wallpapers/desktop/sunset.webp"\|"/wallpapers/desktop/nebula.webp"\|"/wallpapers/desktop/default.webp"}` | Changes the wallpaper |
| `set_dock_size` | `{"size": 28..64}` | Sets dock icon size |
| `set_desktop_size` | `{"size": 32..80}` | Sets desktop icon size |
| `toggle_sounds` | `{}` | Enables/disables system sounds |
| `play_sound` | `{"sound": "bell"\|"click"\|"startup"\|"office"}` | Plays a system sound |
| `show_notification` | `{"title": "…", "message": "…", "icon?": "fas fa-…"}` | Shows a system notification |
| `toggle_notification_panel` | `{}` | Opens/closes the notification panel |
| `clear_notifications` | `{}` | Clears notification history |
| `set_language` | `{"lang": "pt"\|"en"}` | Changes the system language |
| `toggle_auto_hide_dock` | `{}` | Toggles dock auto-hide |
| `toggle_tips` | `{}` | Enables/disables system tips |
| `show_system_tip` | `{}` | Triggers a system tip notification |
| `toggle_agent_mode` | `{}` | Enables/disables Agent Mode |
| `toggle_voice_feedback` | `{}` | Enables/disables Hermes spoken voice replies |
| `music_play_pause` | `{}` | Play/pause the current track |
| `music_next` | `{}` | Skip to next track |
| `music_prev` | `{}` | Go to previous track |
| `music_stop` | `{}` | Stop playback |
| `music_play_track` | `{"query": "song name or artist"}` | Search and play a track by name |
| `music_set_volume` | `{"volume": 0..100}` | Sets music playback volume |
| `music_toggle_mute` | `{}` | Mutes or unmutes the music player |
| `music_seek` | `{"time": 30}` | Seeks to a specific timestamp in the track |
| `photos_open_photo` | `{"query": "photo name"}` | Search and open a photo by name |
| `docs_open_document` | `{"query": "document name"}` | Search and open a document by name |

---

## Terminal Commands

All commands are registered in [`src/app/core/services/terminal-commands.ts`](src/app/core/services/terminal-commands.ts):

| Command | Description |
|---|---|
| `help` | Display the command list |
| `ls` | List files in the current directory |
| `cd <path>` | Change the working directory (supports `.`, `..`, `/`, `~`, absolute and relative paths) |
| `open <file>` | Open a file with its associated application |
| `date` | Display current date and time (locale-aware) |
| `theme` | Toggle between light and dark mode |
| `clear` | Clear the terminal screen |
| `about` | Display Cai_OS version and kernel info |
| `neofetch` | Display ASCII logo with system information |
| `whoami` | Display developer information (Caio Souza Silva) |

Tab autocomplete works for both commands and file names.

---

## Installation

### Prerequisites
- Node.js ≥ 20
- npm ≥ 11.7.0
- Angular CLI 22: `npm install -g @angular/cli@22`

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/CaioSSilva/portfolio.git
cd portfolio

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Create src/.env with:
#   geminiApiKey=YOUR_GOOGLE_AI_KEY
#   geminiApiKey2=YOUR_FALLBACK_KEY  (optional)

# 4. Start the development server
npm start
# This runs: node -r dotenv/config mynode.js && ng serve
# mynode.js generates src/environments/environment.ts from src/.env

# 5. Open http://localhost:4200
```

---

## Environment Variables

Environment variables are read from `src/.env` by `mynode.js` and written to `src/environments/environment.ts`.

| Variable | Type | Purpose |
|---|---|---|
| `geminiApiKey` | `string` | Primary Google Generative AI API key used by Hermes |
| `geminiApiKey2` | `string` | Fallback API key — used when the primary returns 404 or 429 |

Both `environment.ts` and `environment.development.ts` are git-ignored. Never commit either file. Use `src/.env` as the source of truth for local keys.

---

## NPM Scripts

| Script | Command | Description |
|---|---|---|
| `start` | `node -r dotenv/config mynode.js && ng serve` | Generates environment files then starts the dev server |
| `build` | `ng build` | Production build |
| `watch` | `ng build --watch --configuration development` | Incremental development build |
| `test` | `ng test` | Run test suite (Vitest) |
| `ng` | `ng` | Angular CLI passthrough |

---

## Testing

**Framework:** [Vitest](https://vitest.dev/) `^4.0.18` with `jsdom` `^28.0.0`.

```bash
npm test
```

> Run `npm test` for the current test count. Test files are not listed in this document to avoid staleness.

---

## Customization

### Adding a new application

1. Create a component in `src/app/features/my-app/` that extends [`Base`](src/app/core/models/base.ts)
2. Add an entry to [`getInstalledApps()`](src/app/core/models/apps.ts) in `src/app/core/models/apps.ts`
3. Add the ID to [`AppRegistry`](src/app/core/models/apps.ts) interface
4. Add a title key to both `en.ts` and `pt.ts` under `apps`
5. To lazy-load the component, provide `loadComponent` instead of `component` in the definition

### Adding wallpapers

- Static: drop `.webp` files into `public/wallpapers/desktop/` or `public/wallpapers/mobile/`
- Animated: drop `.mp4` or `.webm` files into `public/videos/wallpapers/desktop/`
- Register paths in the `wallpapers`, `wallpapersAnimated`, or `wallpapersMobile` arrays in [`src/app/features/settings/settings.ts`](src/app/features/settings/settings.ts)

### Adding system sounds

Drop `.ogg` files into `public/sounds/`. Play them via `inject(Sound).play('soundName')` (without extension).

### Adding i18n keys

See the [i18n section](#i18n) above. Both `en.ts` and `pt.ts` must be updated simultaneously; TypeScript will error on mismatches.

### Adding files to the virtual file system

Edit `public/data/fs.json` to add nodes to the tree. Files referenced by `url` must exist under `public/`.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `src/environments/environment.ts` not found | Run `npm start` (not `ng serve` directly) — `mynode.js` generates this file |
| Hermes returns no response | Verify `geminiApiKey` in `src/.env`; check browser console for 400/403 errors |
| Hermes model error notification | The saved model may be deprecated; open the Hermes app, click the model name above the input field, and select a new model — or clear `localStorage` key `geminiModel` |
| Agent Mode toggle disabled in Settings | Browser does not support the Web Speech API (Firefox), or the page is served over HTTP — HTTPS is required. Use Chrome/Chromium on a secure origin |
| Agent Mode enabled but not responding | Microphone permission was denied; click the lock icon in the browser address bar and allow microphone access, then re-enable Agent Mode |
| File system not loading | Check that `public/data/fs.json` is present and valid JSON |
| Sounds not playing | Sounds require a user interaction first (browser AudioContext policy). Click anywhere to unlock |
| Videos not playing as wallpaper | Some browsers block autoplay; try a static wallpaper as fallback |

---

## Contributing

### Branch convention
- `main` — production
- `feat/description` — new features
- `fix/description` — bug fixes

### PR checklist
- [ ] No new `console.log` or debug code
- [ ] All signals and effects cleaned up on destroy where applicable
- [ ] New translation keys added to both `en.ts` and `pt.ts`
- [ ] `npm test` passes
- [ ] `npm run build` produces no errors

---

## Author & Contact

**Caio Souza Silva**
- Portfolio: [caiossilva.com](https://caiossilva.com)
- GitHub: [github.com/CaioSSilva](https://github.com/CaioSSilva)
- Email: caiosouzasilva13650@gmail.com

---

## License

This project is private (`"private": true` in `package.json`). All rights reserved.

---

## Project Stats

| Metric | Value |
|---|---|
| Version | 3.1.0 |
| Angular version | 22.2.1 |
| TypeScript version | 6.0.3 |
| Applications | 10 |
| Layout components | 9 |
| Shared UI components | 4 |
| Core services | 30 |
| Data models | 14 files |
| Languages supported | 2 (PT, EN) |
| Platforms | Desktop, Mobile |
| Test runner | Vitest 4.0.18 |
| Deployment | Vercel |
