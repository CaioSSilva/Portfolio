# Complete Documentation — Cai_OS 2.3.0

## 📋 Table of Contents

1. [Overview](#-overview)
2. [What's New in 2.3.0](#-whats-new-in-230)
3. [System Architecture](#️-system-architecture)
4. [Technologies Used](#️-technologies-used)
5. [Project Structure](#-project-structure)
6. [Main Components](#-main-components)
7. [Services](#️-services)
8. [Data Models](#-data-models)
9. [System Features](#-system-features)
10. [Applications](#-applications)
11. [Installation and Configuration](#-installation-and-configuration)
12. [Available Commands](#-available-commands)
13. [Customization](#-customization)
14. [Troubleshooting](#-troubleshooting)
15. [Additional Resources](#-additional-resources)
16. [Contributing](#-contributing)
17. [License](#-license)
18. [Author](#-author)
19. [Acknowledgments](#-acknowledgments)
20. [Project Statistics](#-project-statistics)
21. [Support](#-support)

---

## 🌟 Overview

**Cai_OS** is an interactive web operating system built with Angular 22, inspired by the GNOME desktop environment. The project simulates a complete operating system experience directly in the browser, including window management, applications, terminal, virtual file system, and AI integration — fully responsive for both desktop and mobile devices.

### Project Goal

Cai_OS was developed as an interactive portfolio that demonstrates:

- Advanced mastery of Angular and TypeScript
- Scalable software architecture
- Interface design inspired by modern operating systems
- Integration with external APIs (Google Gemini)
- Complex state management with Angular Signals
- Responsive UX/UI across desktop and mobile

### Key Features

- **Modern Desktop Interface**: GNOME-inspired with dock, top bar, and app grid
- **Full Mobile Support**: Native mobile navigation bar, overview screen, touch gestures
- **Window Management**: Drag, resize, maximize, minimize, snap (desktop); always full-screen (mobile)
- **Virtual File System**: Hierarchical structure of folders and files
- **Interactive Terminal**: Unix-like commands for navigation and system control
- **Integrated Applications**: Browser, image viewer, music player, document viewer
- **Integrated AI**: Virtual assistant "Hermes" using Google Gemini
- **Themes**: Light and dark mode
- **Multilingual**: Portuguese and English
- **Notification System**: Notification center with pull-down gesture on mobile
- **Sound Effects**: System sounds for mouse interactions (desktop only)
- **Lazy Loading**: Heavy bundles (PDF viewer) loaded on demand

---

## 🆕 What's New in 2.3.0

### Music Player — Animated CD

| Feature | Description |
|---|---|
| **CD reacts to playback state** | The disc icon spins slowly while playing, spins fast forward while scrubbing forward, spins fast in reverse while scrubbing backward, and stops when paused |
| **Consistent across all surfaces** | The same animation applies in the full player, the top bar widget, and the notification center mini-player |

### Music Player — Smooth seek bar

| Fix | Description |
|---|---|
| **No more flickering while dragging** | The progress bar now shows a local preview while dragging and only commits the position on release — the disc and time display update smoothly without jumping |

### Notification Center — Mini-player polish

| Fix | Description |
|---|---|
| **Rounded corners match the panel** | The mini-player card corners now align correctly with the notification panel's rounded border on both mobile and desktop |

### Test Suite

- **51 test files · 548 tests · 0 failures**

### What's New in 2.2.1 (anterior)

### Document Viewer — Markdown Support

| Feature | Description |
|---|---|
| **`.md` rendering** | Markdown files are now rendered with full formatting via `MarkdownPipe` — same pipe used by Hermes |
| **`.md` icon** | `fab fa-markdown` icon in purple (`#7c5cd8`) in both the file grid and the viewer header |
| **`prose-gnome` styles** | `::ng-deep` scoped styles for headings, code blocks, inline code, lists, blockquotes, links and `<hr>` — aligned with the Hermes visual language but using the system blue palette |

### Document Viewer — Swipe Navigation

| Feature | Description |
|---|---|
| **Swipe left/right** | Horizontal swipe (> 40 px, dominant axis) navigates between documents on mobile |
| **Blocked when zoomed** | Swipe is ignored when `zoom() > 1` to avoid accidental navigation during pinch zoom |
| **Touch structure aligned** | `onTouchStart` / `onTouchMove` / `onTouchEnd` structure now matches the ImageViewer exactly — pinch (2 fingers) handled first, single touch second |

### ProcessManager — Data update on re-open

| Fix | Description |
|---|---|
| **File clicked while viewer open** | `ProcessManager.open` now updates `data` on the existing process before focusing it — the document viewer's `effect` reacts and loads the new file |

### MarkdownPipe — Regex fixes

| Fix | Description |
|---|---|
| **`*em*` false positives** | Negative lookahead/lookbehind `(?<!\*)\*(?!\*)` prevents single `*` from matching inside `**bold**` markers |
| **`` `code` `` false positives** | Updated regex excludes `` ``` `` fences (already processed as placeholders) and prevents cross-line matches |

### Settings — Desktop tab dock controls

| Fix | Description |
|---|---|
| **`isTouchDevice` → `isMobile`** | Dock controls (auto-hide + icon size) now use `screen.isMobile()` — `isTouchDevice` was returning `true` on touch-enabled laptops/monitors, hiding the controls on desktop |

### Test Suite

- **50 test files · 541 tests · 0 failures**

### What's New in 2.2.0 (previous)

### Settings — Mobile & Layout Fixes

| Fix | Description |
|---|---|
| **Dock hidden on mobile** | "Auto-hide dock" and dock icon size controls are now hidden on touch devices (`isTouchDevice`), not based on window width — so a desktop user with a small window still sees all dock controls |
| **System info removed from System tab** | RAM, display resolution and system name were being shown in the System tab; they now only appear in the About tab |
| **System tab toggle style** | Fixed `divide-y` / `pb-4` classes that were left over from when the section had multiple items; now matches the Sound tab pattern |
| **Toggle button overflow** | Added `shrink-0` and `gap-4` to prevent long labels from compressing the toggle and making the white dot overflow the pill |

### Reactive Effect Fixes

| Fix | Description |
|---|---|
| **About app re-opening on language change** | `AppRegistry.registry` is a `computed` that depends on `LanguageService` — changing language caused the boot `effect` in `App` to re-run and open the About app again. Fixed with `untracked()` around the `appsRegistry` read |
| **Musics — duplicate sidebar effect** | Removed a redundant `effect` that duplicated the `ResizeObserver` callback logic for closing the sidebar on narrow desktop windows |

### Error Handling — Notifications Instead of Console

| Before | After |
|---|---|
| `console.error` in `DocumentViewer` (4 sites) | `NotificationService.show()` with translated message |
| `console.error` in `ImageViewer` (2 sites) | `NotificationService.show()` with translated message |
| `console.error` in `HermesActionService.execute` | Duplicate removed — notification already shown |
| `console.warn` in `HermesActionService.parseActions` | Silent `catch` (malformed model JSON — not user-facing) |
| `console.warn` in `LanguageService` (2 sites) | Silent `catch` (localStorage unavailable) |
| `console.warn` in `AudioPlayer` (2 sites) | Silent `catch` (autoplay policy — `hasError` signal handles UI) |
| `console.warn` in `Theme` | Silent `catch` (localStorage unavailable) |
| `console.warn` in `Sound` | Silent `catch` (AudioContext unavailable) |
| `.catch(console.error)` in `Files` constructor | Removed — `FileSystem.ensureLoaded` already notifies internally |

New i18n keys added: `failedToLoadFiles`, `failedToLoadDocument`, `failedToProcessDocument`, `failedToLoadImages` (PT + EN).

### Test Suite

- **50 test files · 541 tests · 0 failures**

### What's New in 2.1.1 (previous)

#### Mobile App Grid — Context Menu Fixes

| Fix | Description |
|---|---|
| **Menu actions work** | Replaced `(document:touchstart)` listener with an inert overlay (`z-[19999]`) behind the menu — touch on a menu item no longer closes the menu before the action fires |
| **App not opened on menu dismiss** | Grid uses `[class.pointer-events-none]` while menu is open; `onAppTouchStart` guards against touch-through |
| **Click outside only closes menu** | Overlay intercepts `touchstart`/`click` with `stopPropagation` + `preventDefault`, so the backdrop never receives the event and the grid stays open |
| **Menu centered on icon** | `openContextMenuAt` now receives the anchor `HTMLElement` and uses `getBoundingClientRect()` to center the menu on the icon; clamped to viewport with 8 px margin |
| **No text wrapping** | Menu width bumped to `w-[260px]` to fit the longest translated string ("Remover da área de trabalho") |
| **All actions close menu** | `closeActiveApp` and desktop pin/unpin now call `contextMenu.close()` |

#### Hermes — Model Error Notification

| Feature | Description |
|---|---|
| **404 detection** | `catch` block in `handleSendMessage` inspects the error message for `404`/`NOT_FOUND` |
| **Specific notification** | Shows `errors.modelUnavailable` ("The selected model is not available…") with `fa-robot` icon and 10 s duration |
| **Generic fallback** | Any other error still shows the generic `seviceUnavailable` notification |

#### Version Constant

| Change | Description |
|---|---|
| **`src/app/core/version.ts`** | Single `APP_VERSION` constant used by Boot screen, Settings about page, and Terminal (`neofetch` + `about` commands) |

### What's New in 2.1.0 (previous)

#### Hermes AI — Model Selection

| Feature | Description |
|---|---|
| **Model picker** | Dropdown in the Hermes chat to select any available Gemini model |
| **Dynamic listing** | Models fetched live from the Gemini REST API (`GET /v1beta/models`), filtered to `generateContent`-capable only |
| **Persisted choice** | Selected model saved to `localStorage` via `Settings.geminiModel` (default: `gemini-2.0-flash`) |
| **API key fallback** | If `geminiApiKey` fails, automatically retries with `geminiApiKey2`; throws (notifies user) only if both fail |

#### Documents — Mobile UX

| Feature | Description |
|---|---|
| **Responsive header** | Download button shows icon-only on narrow windows; filename truncates naturally |
| **Floating zoom bar** | Pill-shaped control bar at the bottom (matches image-viewer style), visible when window width < 500 px |
| **Pinch-to-zoom** | Two-finger pinch gesture on mobile (via `ScreenService.isMobile`) scales the PDF |
| **Reset button** | While `isPinchZoomed`, the zoom % button becomes a compress icon to reset to 1× |
| **Container-aware narrow** | `isNarrow` driven by `ResizeObserver` on the app window, not `window.innerWidth` |

#### Performance

| | v1.2.1 | v2.0.0 | v2.1.x |
|---|---|---|---|
| Initial bundle | 995 kB | **492 kB** | **492 kB** |
| Lazy chunks | — | `document-viewer` 507 kB | `document-viewer` 507 kB |
| Budget warning | ⚠ yes | **✓ none** | **✓ none** |

#### Screen Breakpoints

| Range | Mode |
|---|---|
| `< 768 px` | Mobile — `MobileNavBar` + `MobileOverview` |
| `768–1023 px` | Tablet (compact) — mobile layout |
| `≥ 1024 px` | Desktop — `Dock` + `WindowSwitcher` |

#### Test Suite

- **48 test files · 480+ tests · 0 failures**
- Coverage includes: `Gemini.listModels`, `Gemini` key-fallback, `Settings.geminiModel`, `DocumentViewer` pinch/reset/isNarrow, `Hermes` model picker

---

## 🏗️ System Architecture

### Architecture Overview

Cai_OS follows a modular architecture based on Angular components, with clear separation between:

```
┌─────────────────────────────────────────┐
│        Presentation Layer               │
│  (Components, Templates, Styles)        │
├─────────────────────────────────────────┤
│          Services Layer                 │
│  (Business Logic, State Management)     │
├─────────────────────────────────────────┤
│          Models Layer                   │
│  (Data Models, Interfaces, Types)       │
├─────────────────────────────────────────┤
│       Infrastructure Layer              │
│  (APIs, Storage, External Services)     │
└─────────────────────────────────────────┘
```

### Design Patterns Used

1. **Singleton**: Services with `providedIn: 'root'`
2. **Observer**: Angular Signals for reactive state management
3. **Strategy**: Terminal command system
4. **Factory**: Dynamic creation of application components via `*ngComponentOutlet`
5. **Dependency Injection**: Angular native injection
6. **Lazy Loading**: On-demand chunk loading for heavy features

### Data Flow

```
User Interaction (mouse / touch)
            ↓
        Component
            ↓
         Service
            ↓
   State Update (Signal)
            ↓
       UI Re-render
```

---

## 🛠️ Technologies Used

### Core

- **Angular 22.2**: Component framework with Signals-based reactivity
- **TypeScript 6.0.3**: Typed superset of JavaScript

### Styling

- **Tailwind CSS 4.1.18**: Utility-first CSS framework
- **SCSS**: CSS preprocessor
- **PostCSS 8.5.6**: CSS processing
- **Font Awesome 7.1.0**: Icon library

### External Libraries

- **@google/generative-ai 0.24.1**: Google Gemini integration
- **ng2-pdf-viewer 10.4.0**: PDF viewing (lazy-loaded)
- **@vercel/analytics 1.6.1**: Analytics
- **@vercel/speed-insights 1.3.1**: Performance metrics

### Development Tools

- **Angular CLI 22.0.4**: Angular CLI
- **Vitest 4.0.18**: Testing framework
- **jsdom 28.0.0**: DOM environment for testing
- **Prettier**: Code formatting

---

## 📁 Project Structure

```
Portfolio/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── language/            # i18n (en, pt)
│   │   │   ├── models/              # Data models
│   │   │   │   ├── apps.ts          # App registry definition (lazy loadComponent)
│   │   │   │   ├── base.ts
│   │   │   │   ├── dock.ts          # AppDefinition + loadComponent
│   │   │   │   ├── file.ts
│   │   │   │   ├── process.ts
│   │   │   │   └── ...
│   │   │   ├── pipes/
│   │   │   │   └── markdown-pipe.ts
│   │   │   └── services/
│   │   │       ├── apps.ts
│   │   │       ├── app-launcher.ts
│   │   │       ├── app-registry.ts
│   │   │       ├── context-menu.ts
│   │   │       ├── desktop-icons.ts
│   │   │       ├── dock.ts
│   │   │       ├── file-system.ts
│   │   │       ├── gemini.ts
│   │   │       ├── language.ts
│   │   │       ├── mobile-nav.ts    # Mobile navigation state
│   │   │       ├── notification.ts
│   │   │       ├── process-manager.ts
│   │   │       ├── screen.ts        # Breakpoint detection
│   │   │       ├── settings.ts
│   │   │       ├── sound.ts
│   │   │       ├── system-tips.ts
│   │   │       ├── terminal-comands.ts
│   │   │       ├── theme.ts
│   │   │       └── window.ts
│   │   ├── features/
│   │   │   ├── about-project/
│   │   │   ├── browser/
│   │   │   ├── document-viewer/     # Lazy-loaded (pdfjs)
│   │   │   ├── files/
│   │   │   │   └── components/      # breadcrumbs, grid, list, sidebar
│   │   │   ├── hermes/
│   │   │   ├── image-viewer/
│   │   │   ├── musics/
│   │   │   │   └── player/
│   │   │   ├── settings/
│   │   │   ├── system-monitor/
│   │   │   └── terminal/
│   │   ├── layout/
│   │   │   ├── apps-grid/
│   │   │   ├── dock/                # Desktop only
│   │   │   ├── mobile-nav-bar/      # Mobile only
│   │   │   ├── mobile-overview/     # Mobile only
│   │   │   ├── notification-center/
│   │   │   ├── top-bar/
│   │   │   └── window-switcher/     # Desktop only
│   │   └── shared/ui/
│   │       ├── boot/
│   │       ├── context-menu/
│   │       ├── shutdown/
│   │       └── window/
│   ├── index.html
│   ├── main.ts
│   ├── styles.scss
│   └── test-setup.ts
├── public/
│   ├── sounds/
│   ├── wallpapers/
│   │   ├── desktop/
│   │   └── mobile/
│   └── videos/wallpapers/
│       └── desktop/
├── angular.json
├── package.json
└── tsconfig.json
```

---

## 🧩 Main Components

### 1. App (Root)

**File**: `src/app/app.ts`

Root component that manages global system state. On `systemReady`, opens the **About** app after 1 s and optionally starts system tips — works on both desktop and mobile.

```typescript
effect(() => {
  if (!this.systemReady()) return;
  if (this.settingsService.tipsEnabled()) this.tipsService.startRandomTips();
  const aboutApp = this.apps.appsRegistry().about;
  if (aboutApp) setTimeout(() => this.apps.openApp(aboutApp), 1000);
});
```

### 2. Window

**File**: `src/app/shared/ui/window/window.ts`

Application window with full management for desktop; auto-maximized on mobile.

| Feature | Desktop | Mobile |
|---|---|---|
| Drag | ✓ | blocked |
| Resize | ✓ | blocked |
| Maximize | ✓ | forced on |
| Snap to edges | ✓ | — |
| Title bar | ✓ | hidden |

### 3. Dock

**File**: `src/app/layout/dock/dock.ts`

Desktop taskbar (hidden on mobile). Supports pinning, drag-and-drop reorder, long-press context menu.

### 4. MobileNavBar *(new)*

**File**: `src/app/layout/mobile-nav-bar/mobile-nav-bar.ts`

Bottom navigation bar — visible only on mobile (`< 768 px`).

| Button | Action |
|---|---|
| Square icon | Toggle Overview (recent apps) |
| Pill | Go Home (minimize all) |
| Grid icon | Toggle App Drawer |

### 5. MobileOverview *(new)*

**File**: `src/app/layout/mobile-overview/mobile-overview.ts`

Full-screen card carousel of open processes.

- **Swipe up** a card → closes the process (animated fly-off)
- **Tap** a card → focuses the app and closes overview
- **Swipe horizontally** → browse between cards
- **Close button** on card → individual close
- **Clear all** button → closes all processes

### 6. TopBar

**File**: `src/app/layout/top-bar/top-bar.ts`

- **Desktop**: click to open notification center
- **Mobile**: swipe down (≥ 30 px) to open notification center; rubber-band pull feedback

### 7. AppsGrid

**File**: `src/app/layout/apps-grid/apps-grid.ts`

App launcher overlay with search. On mobile, apps open via `touchend` (no 300 ms delay). Long-press (500 ms) opens the context menu.

---

## ⚙️ Services

### ScreenService *(new)*

**File**: `src/app/core/services/screen.ts`

Breakpoint detection using Angular Signals, updated on `window.resize`.

```typescript
readonly isMobile  = computed(() => this.width() < 768);
readonly isTablet  = computed(() => this.width() >= 768 && this.width() < 1024);
readonly isDesktop = computed(() => this.width() >= 1024);
readonly isCompact = computed(() => this.width() < 1024);
```

### MobileNavService *(new)*

**File**: `src/app/core/services/mobile-nav.ts`

Central state for mobile navigation.

| Method | Description |
|---|---|
| `toggleOverview()` | Toggle overview screen |
| `openOverview()` | Open overview |
| `closeOverview()` | Close overview |
| `goHome()` | Minimize all processes, close drawers |
| `toggleAppDrawer()` | Toggle apps grid |
| `openAppAndCloseDrawer(app)` | Open app and close overview |

### ProcessManager

**File**: `src/app/core/services/process-manager.ts`

Manages all running processes. `spawn()` is now `async` — it resolves `loadComponent()` before creating the process, enabling lazy-loaded app components.

```typescript
private async spawn(app, data?): Promise<void> {
  const component = app.loadComponent
    ? await app.loadComponent()
    : app.component;
  // create and register process
}
```

### WindowService

**File**: `src/app/core/services/window.ts`

Per-window service (non-root). Key constants:

```typescript
export const TOP_BAR_HEIGHT = 32;        // px
export const MOBILE_NAV_BAR_HEIGHT = 48; // px
```

An `effect()` listens to `ScreenService.isMobile()` — switching to mobile forces maximization; switching back to desktop restores the saved `normalRect`.

### Other Services

| Service | File | Responsibility |
|---|---|---|
| `Apps` | `services/apps.ts` | App grid state, search, context menu coords |
| `AppLauncher` | `services/app-launcher.ts` | Launch orchestration |
| `AppRegistry` | `services/app-registry.ts` | App catalog, extension handler lookup |
| `DockService` | `services/dock.ts` | Pinned apps, dock items, click handling |
| `FileSystem` | `services/file-system.ts` | Virtual hierarchical file system |
| `Settings` | `services/settings.ts` | Persisted settings (`dockSize`, `wallpaper`, `geminiModel`, …) |
| `NotificationService` | `services/notification.ts` | Notification queue and panel |
| `Sound` | `services/sound.ts` | AudioContext-based sound playback |
| `Theme` | `services/theme.ts` | Light/dark theme toggle |
| `LanguageService` | `services/language.ts` | i18n (pt / en) |
| `GeminiService` | `services/gemini.ts` | Google Gemini API — streaming, key fallback, model listing |
| `TerminalCommands` | `services/terminal-comands.ts` | Unix-like command processing |
| `SystemTips` | `services/system-tips.ts` | Periodic tips via notifications |
| `DesktopIconsService` | `services/desktop-icons.ts` | Desktop shortcut management |
| `ContextMenuService` | `services/context-menu.ts` | Context menu state and positioning |

---

## 📊 Data Models

### Process

```typescript
interface Process extends AppBase {
  id: string;
  appId: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  cascadeIndex: number;
  data?: ProcessData;
}
```

### AppDefinition

```typescript
interface AppDefinition extends AppBase {
  data?: ProcessData;
  handle?: string[];                              // file extensions
  loadComponent?: () => Promise<Type<Base>>;      // lazy load
}
```

### FileItem

```typescript
interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  icon: string;
  url?: string;
  children?: FileItem[];
}
```

### Notification

```typescript
interface NotificationItem {
  id: string;
  title: string;
  message: string;
  icon?: string;
  timestamp: Date;
}
```

---

## 🚀 System Features

### Window Management (Desktop)

- **Snap zones**: left half, right half, top-left/right quarter, bottom-left/right quarter, full maximize (drag to top edge)
- **Resize**: drag the bottom-right handle; minimum 320 × 240 px
- **Cascade**: new windows open with a 28 px offset from the previous one
- **Maximize restore**: double-click title bar or click the maximize button; restores to pre-maximize size

### Mobile Navigation

- **Home** (pill button): minimizes all open processes, closes overview and app drawer
- **Overview** (square button): shows all open processes as swipeable cards
- **Apps** (grid button): opens the app drawer

### Virtual File System

```
/home/
  ├── documents/    (PDFs)
  ├── photos/       (images)
  ├── music/        (audio)
  └── certificates/ (PDFs)
```

### Notification Center

- Pull-down gesture on mobile (top bar swipe ≥ 30 px)
- Click on top bar (desktop)
- Per-notification dismiss or clear all

### App Switcher — Ctrl+` (Desktop)

Keyboard-driven window switcher. Tab to cycle, Enter/click to focus.

### Context Menu

- **Desktop**: right-click on dock icon or app grid item
- **Mobile**: 500 ms long-press on dock icon or app grid item

**Actions**: Open · New instance · Close · Remove from dock · Add to desktop

### Drag and Drop (Desktop)

Drag apps from the grid to the dock to pin them at a specific position.

---

## 📱 Applications

| App | ID | File extensions |
|---|---|---|
| Files | `files` | — |
| Firefox | `firefox` | — |
| Terminal | `terminal` | — |
| Settings | `settings` | — |
| About | `about` | — |
| Photos | `photos` | jpg, jpeg, png, gif, webp, svg |
| Documents | `documents` | pdf, txt, md *(lazy-loaded)* |
| Musics | `musics` | mp3, wav, ogg |
| System Monitor | `systemMonitor` | — |
| Hermes (AI) | `hermes` | — |

### Documents — Lazy Loading & Mobile UX

The PDF viewer (`ng2-pdf-viewer` + `pdfjs-dist`) is only loaded when the Documents app is first opened, reducing the initial bundle by ~503 kB.

On narrow windows (< 500 px, measured via `ResizeObserver` on the app container), the Documents viewer switches to a mobile-optimised layout:
- Floating zoom pill at the bottom (identical to the image-viewer toolbar)
- Header shows only the download icon (no label text)
- Pinch-to-zoom gesture enabled on mobile devices; pinch icon replaces the zoom % for a one-tap reset

---

## 🔧 Installation and Configuration

### Prerequisites

- Node.js 18+ and npm 11+
- Angular CLI 22+

### Installation

```bash
git clone <repository-url>
cd Portfolio
npm install
npm start
```

### Environment Configuration

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  geminiApiKeys: [
    'YOUR_API_KEY_HERE',
    'YOUR_BACKUP_API_KEY',
  ],
};
```

Get a Gemini key at [Google AI Studio](https://makersuite.google.com/app/apikey).

---

## 📜 Available Commands

### NPM Scripts

```bash
npm start        # Development server
npm run build    # Production build
npm run watch    # Build with watch
npm test         # Run test suite (Vitest)
```

### Terminal Commands (inside the app)

| Command | Description |
|---|---|
| `help` | List all commands |
| `ls` | List current directory |
| `cd <dir>` | Change directory |
| `open <file>` | Open file with associated app |
| `date` | Show current date/time |
| `theme` | Toggle light/dark theme |
| `clear` | Clear terminal |
| `neofetch` | System info (ASCII art) |
| `whoami` | Developer info |
| `about` | System version (Cai_OS v2.0.0) |

---

## 🎨 Customization

### Wallpapers

Add images to `public/wallpapers/desktop/` (desktop) or `public/wallpapers/mobile/` (mobile) and configure in Settings.

### Sounds

Add audio files to `public/sounds/` and register in `SoundService`.

### Adding a New App

1. Create component in `src/app/features/<app-name>/`
2. Register in `src/app/core/models/apps.ts`:

```typescript
myApp: {
  id: 'myApp',
  title: lang.t().apps.myApp,
  icon: 'fas fa-star',
  color: '#ff0000',
  component: MyAppComponent,
  // or lazy:
  component: null as never,
  loadComponent: () => import('../features/my-app/my-app').then(m => m.MyApp),
}
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---|---|
| App doesn't open | Check registration in `apps.ts` and `AppRegistry` |
| Theme doesn't persist | `localStorage.clear()` in the browser console |
| Hermes doesn't respond | Check Gemini API key in `environment.ts` and quota in Google Cloud Console |
| Files don't appear | Check for errors in the browser console (FileSystem HTTP request) |
| About doesn't open on mobile | Ensure `systemReady` fires; logic is in `App.effect()`, not `Dock` |
| PDF doesn't load | The `document-viewer` chunk loads lazily; check network tab for the chunk request |

---

## 📚 Additional Resources

- [Angular](https://angular.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)
- [Google Gemini](https://ai.google.dev)
- [GNOME Design](https://www.gnome.org)

---

## 🤝 Contributing

1. Fork the project
2. Create a branch: `git checkout -b feature/MyFeature`
3. Commit: `git commit -m 'Add MyFeature'`
4. Push: `git push origin feature/MyFeature`
5. Open a Pull Request

**Guidelines**: follow existing code style · add tests · update this README · use descriptive commits.

---

## 📄 License

Personal portfolio project. All rights reserved.

---

## 👤 Author

**Caio Souza Silva**  
caiosouzasilva13650@gmail.com  
[caiossiva.com](https://caiossiva.com) · [github.com/CaioSSilva](https://github.com/CaioSSilva/)

---

## 🙏 Acknowledgments

Angular Team · GNOME Design Team · Open Source Community · Google Gemini Team · Font Awesome · Tailwind CSS Team

---

## 📊 Project Statistics

| Metric | Value |
|---|---|
| Version | **2.3.0** |
| Test files | **51** |
| Tests passing | **548 / 548** |
| Initial bundle | **492 kB** (−50% vs 1.x) |
| Components | 29+ |
| Services | 17 |
| Applications | 10 |
| Languages | 2 (pt / en) |
| Platforms | Desktop + Mobile |

---

## 📞 Support

- **Issues**: Open an issue on GitHub
- **Discussions**: Use the Discussions tab on GitHub

---

**Developed with ❤️ using Angular 22 — Last Update: October 2026 · v2.3.0**
