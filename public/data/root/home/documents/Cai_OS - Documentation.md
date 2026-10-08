# Complete Documentation - Cai_OS 2.3.1

## 📋 Table of Contents
1. [Overview](#-overview)
2. [System Architecture](#️-system-architecture)
3. [Technologies Used](#️-technologies-used)
4. [Project Structure](#-project-structure)
5. [Main Components](#-main-components)
6. [Services](#️-services)
7. [Data Models](#-data-models)
8. [System Features](#-system-features)
9. [Applications](#-applications)
10. [Installation and Configuration](#-installation-and-configuration)
11. [Available Commands](#-available-commands)
12. [Customization](#-customization)
13. [Troubleshooting](#-troubleshooting)
14. [Additional Resources](#-additional-resources)
15. [Contributing](#-contributing)
16. [License](#-license)
17. [Author](#-author)
18. [Acknowledgments](#-acknowledgments)
19. [Project Statistics](#-project-statistics)
20. [Support](#-support)

---

## 🌟 Overview

**Cai_OS** is an interactive web operating system built with Angular 22, inspired by the GNOME desktop environment. The project simulates a complete operating system experience directly in the browser, including window management, applications, terminal, virtual file system, and AI integration.

### Project Goal

Cai_OS was developed as an interactive portfolio that demonstrates:
- Advanced mastery of Angular and TypeScript
- Scalable software architecture
- Interface design inspired by modern operating systems
- Integration with external APIs (Google Gemini)
- Complex state management
- Professional user experience (UX/UI)

### Key Features

- **Modern Desktop Interface**: GNOME-inspired with dock, top bar, and app grid
- **Responsive Mobile Interface**: Native mobile experience with bottom nav bar and app overview
- **Window Management**: Support for dragging, resizing, maximizing, minimizing, and snapping
- **Virtual File System**: Hierarchical structure of folders and files
- **Interactive Terminal**: Unix-like commands for navigation and system control
- **Integrated Applications**: Browser, image viewer, music player, document editor
- **Integrated AI**: Virtual assistant "Hermes" using Google Gemini with model selection and error notifications
- **Themes**: Support for light and dark modes
- **Multilingual**: Portuguese and English
- **Notification System**: Notification center with history and model-unavailable alerts
- **Sound Effects**: System sounds for interactions
- **Version constant**: Single source of truth (`APP_VERSION`) used across Boot, Settings, and Terminal

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
2. **Observer**: RxJS Signals for reactive state management
3. **Strategy**: Terminal command system
4. **Factory**: Dynamic creation of application components
5. **Dependency Injection**: Angular native injection

### Data Flow

```
User Interaction
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

### Styling
- **Tailwind CSS 4.1.18**: Utility-first CSS framework
- **SCSS**: CSS preprocessor
- **PostCSS 8.5.6**: CSS processing
- **Font Awesome 7.1.0**: Icon library

### External Libraries
- **@google/generative-ai 0.24.1**: Google Gemini integration
- **ng2-pdf-viewer 10.4.0**: PDF viewing
- **@vercel/analytics 1.6.1**: Analytics
- **@vercel/speed-insights 1.3.1**: Performance metrics

### Development Tools
- **Angular CLI 22.0.4**: Angular CLI
- **TypeScript 6.0.3**: Type-safe superset of JavaScript
- **Vitest 4.0.18**: Testing framework
- **jsdom 28.0.0**: DOM environment for testing
- **Prettier**: Code formatting

---

## 📁 Project Structure

```
Portfolio-main/
├── src/
│   ├── app/
│   │   ├── core/                    # System core
│   │   │   ├── language/            # Internationalization
│   │   │   │   ├── en.ts
│   │   │   │   ├── pt.ts
│   │   │   │   └── i18n.types.ts
│   │   │   ├── models/              # Data models
│   │   │   │   ├── app-launcher.ts
│   │   │   │   ├── app-registry.ts
│   │   │   │   ├── apps.ts
│   │   │   │   ├── base.ts
│   │   │   │   ├── dock.ts
│   │   │   │   ├── file.ts
│   │   │   │   ├── hermes.ts
│   │   │   │   ├── notification.ts
│   │   │   │   ├── process.ts
│   │   │   │   ├── setting.ts
│   │   │   │   └── terminal.ts
│   │   │   ├── pipes/               # Custom pipes
│   │   │   │   └── markdown-pipe.ts
│   │   │   └── services/            # System services
│   │   │       ├── apps.ts
│   │   │       ├── context-menu.ts
│   │   │       ├── desktop-icons.ts
│   │   │       ├── dock.ts
│   │   │       ├── file-system.ts
│   │   │       ├── gemini.ts
│   │   │       ├── language.ts
│   │   │       ├── mobile-nav.ts
│   │   │       ├── notification.ts
│   │   │       ├── process-manager.ts
│   │   │       ├── screen.ts
│   │   │       ├── settings.ts
│   │   │       ├── sound.ts
│   │   │       ├── system-tips.ts
│   │   │       ├── terminal-comands.ts
│   │   │       ├── theme.ts
│   │   │       └── window.ts
│   │   ├── features/                # System applications
│   │   │   ├── about-project/       # About the project
│   │   │   ├── browser/             # Web browser
│   │   │   ├── document-viewer/     # PDF viewer
│   │   │   ├── files/               # File manager
│   │   │   │   └── components/
│   │   │   │       ├── breadcrumbs/
│   │   │   │       ├── grid/
│   │   │   │       ├── list/
│   │   │   │       └── sidebar/
│   │   │   ├── hermes/              # AI assistant
│   │   │   ├── image-viewer/        # Image viewer
│   │   │   ├── musics/              # Music player
│   │   │   │   └── player/
│   │   │   ├── settings/            # System settings
│   │   │   ├── system-monitor/      # System monitor
│   │   │   └── terminal/            # Terminal
│   │   ├── layout/                  # Layout components
│   │   │   ├── apps-grid/           # Application grid
│   │   │   ├── dock/                # Taskbar
│   │   │   ├── mobile-nav-bar/      # Mobile bottom navigation bar
│   │   │   ├── mobile-overview/     # Mobile open-windows overview
│   │   │   ├── notification-center/ # Notification center
│   │   │   ├── top-bar/             # Top bar
│   │   │   └── window-switcher/     # Window switcher
│   │   ├── shared/                  # Shared components
│   │   │   └── ui/
│   │   │       ├── boot/            # Boot screen
│   │   │       ├── shutdown/        # Shutdown screen
│   │   │       ├── context-menu/    # Context menu
│   │   │       └── window/          # Window component
│   │   ├── app.config.ts
│   │   ├── app.html
│   │   ├── app.routes.ts
│   │   ├── app.scss
│   │   └── app.ts
│   ├── environments/                # Environment settings
│   │   ├── environment.ts
│   │   └── environment.development.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── public/                          # Public assets
├── angular.json                     # Angular configuration
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript configuration
└── README.md
```

---

## 🧩 Main Components

### 1. App Component (Root)

**File**: `src/app/app.ts`

Root component of the application that manages the global system state.

**Responsibilities**:
- System initialization
- Management of interaction sounds
- Boot and shutdown control
- Coordination between main services

**Main Code**:
```typescript
@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [AppsGrid, Dock, WindowSwitcher, Window, TopBar, Boot, Shutdown],
})
export class App {
  processManager = inject(ProcessManager);
  settingsService = inject(Settings);
  sound = inject(Sound);
  lang = inject(LanguageService);
  notifications = inject(NotificationService);
  tipsService = inject(SystemTips);
  systemReady = signal(false);
  shutingDown = signal(false);
}
```

### 2. Window Component

**File**: `src/app/shared/ui/window/window.ts`

Component that represents an application window with full management features.

**Features**:
- Drag
- Resize
- Maximize/Restore
- Minimize
- Auto-snap to edges
- Transition animations
- Dynamic focus and z-index

**Main Methods**:
- `startDrag()`: Starts window dragging
- `startResize()`: Starts resizing
- `maximize()`: Maximizes the window
- `minimize()`: Minimizes the window
- `close()`: Closes the window

### 3. Dock Component

**File**: `src/app/layout/dock/dock.ts`

Bottom taskbar that displays pinned and running applications.

**Features**:
- Display of pinned apps
- Running app indicators
- Context menu (right-click)
- Drag and drop to add apps
- Animated hover effect
- Optional auto-hide

### 4. TopBar Component

**File**: `src/app/layout/top-bar/top-bar.ts`

System top bar with clock, app menu, and power button.

**Features**:
- Real-time clock
- Access to app grid
- Notification center
- Power menu (shutdown/restart)
- Active window title display

### 5. Apps Grid Component

**File**: `src/app/layout/apps-grid/apps-grid.ts`

Application grid with search and categorization.

**Features**:
- Display of all installed apps
- Search by name
- Drag to dock
- Quick app opening

### 6. Window Switcher Component

**File**: `src/app/layout/window-switcher/window-switcher.ts`

Window switcher activated by `Ctrl+\``.

**Features**:
- List of open windows
- Keyboard navigation
- Visual window preview
- Quick focus

### 7. MobileNavBar Component

**File**: `src/app/layout/mobile-nav-bar/mobile-nav-bar.ts`

Bottom navigation bar shown exclusively on mobile devices.

**Features**:
- Home button (minimizes all open windows)
- Overview button (opens the app overview)
- App drawer button (opens the apps grid)
- Running-process indicator badge

### 8. MobileOverview Component

**File**: `src/app/layout/mobile-overview/mobile-overview.ts`

Overlay that displays all open application windows as cards for quick switching on mobile.

**Features**:
- Sorted card list (by z-index)
- Tap to focus and close overview
- Swipe-up gesture to dismiss a process (auto-closes overview when the last process is dismissed)
- "Close all" button
- Tap on backdrop to dismiss

---

## ⚙️ Services

### 1. ProcessManager Service

**File**: `src/app/core/services/process-manager.ts`

Manages all running processes (applications).

**Responsibilities**:
- Create new processes
- Close processes
- Manage focus (z-index)
- Minimize/Maximize windows
- Maintain list of active processes

**Main Methods**:
```typescript
start(app: AppDefinition, args?: any[]): void
kill(processId: string): void
focus(processId: string): void
minimize(processId: string): void
toggleMaximize(processId: string): void
```

### 2. FileSystem Service

**File**: `src/app/core/services/file-system.ts`

Hierarchical virtual file system.

**Structure**:
```typescript
interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  children?: FileNode[];
  size?: number;
  extension?: string;
}
```

**Main Methods**:
- `getNodeByPath()`: Search file/folder by path
- `listDirectory()`: List directory contents
- `createFile()`: Create new file
- `deleteNode()`: Remove file/folder
- `moveNode()`: Move file/folder

### 3. Settings Service

**File**: `src/app/core/services/settings.ts`

Manages system settings.

**Available Settings**:
- Theme (light/dark)
- Wallpaper
- Dock icon size
- Auto-hide dock
- System sounds
- System tips
- Language

**Persistence**: Uses `localStorage` to save preferences.

### 4. LanguageService

**File**: `src/app/core/services/language.ts`

Internationalization system (i18n).

**Supported Languages**:
- Portuguese (pt)
- English (en)

**Usage**:
```typescript
lang.t().apps.files // Returns translation
lang.setLanguage('pt') // Changes language
```

### 5. NotificationService

**File**: `src/app/core/services/notification.ts`

Manages system notifications.

**Notification Types**:
- Info
- Success
- Warning
- Error

**Main Methods**:
```typescript
show(title: string, message: string, type: NotificationType): void
clear(id: string): void
clearAll(): void
```

### 6. Sound Service

**File**: `src/app/core/services/sound.ts`

Plays system sound effects.

**Available Sounds**:
- `mouse_down`: Mouse click
- `mouse_up`: Mouse release
- `notification`: Notification sound
- `error`: Error sound

### 7. Theme Service

**File**: `src/app/core/services/theme.ts`

Manages the visual theme of the system.

**Themes**:
- `light`: Light theme
- `dark`: Dark theme

**Main Method**:
```typescript
setTheme(theme: 'light' | 'dark'): void
toggleTheme(): void
```

### 8. Gemini Service

**File**: `src/app/core/services/gemini.ts`

Google Gemini AI integration.

**Features**:
- Text generation (streaming)
- Image analysis
- Dual API key with automatic fallback (`geminiApiKey` → `geminiApiKey2`)
- Dynamic model listing via REST (`GET /v1beta/models`)
- Active model driven by `Settings.geminiModel` (persisted)

**Main Methods**:
```typescript
async generateResponse(prompt: string, history: string, fileData?: { mimeType: string; b64: string }): Promise<string>
async generateResponseStream(prompt: string, history: string, fileData: ..., onChunk: (text: string) => void): Promise<string>
async listModels(): Promise<GeminiModel[]>
```

### 9. TerminalCommands Service

**File**: `src/app/core/services/terminal-comands.ts`

Implements Unix-like commands for the terminal.

**Available Commands**:
- `ls`: List files
- `cd`: Navigate between directories
- `open`: Open files
- `date`: Display date/time
- `theme`: Toggle theme
- `clear`: Clear terminal
- `help`: Display help
- `neofetch`: System info
- `whoami`: Developer info
- `about`: System version info

### 10. ScreenService

**File**: `src/app/core/services/screen.ts`

Tracks the current viewport size and device type reactively.

**Breakpoints**:
- `isMobile`: width < 768px
- `isTablet`: 768px ≤ width < 1024px
- `isDesktop`: width ≥ 1024px
- `isCompact`: width < 1024px
- `isTouchDevice`: detected by touch events

**Main Signals**: `width`, `height`, `isTouchDevice`, `isMobile`, `isTablet`, `isDesktop`, `isCompact`.

### 11. MobileNavService

**File**: `src/app/core/services/mobile-nav.ts`

Controls the mobile navigation state (overview and app drawer).

**Responsibilities**:
- Toggle/open/close the mobile overview panel
- "Go home" action (minimizes all processes)
- Open app and close the drawer in one step
- Toggle the app drawer

**Main Methods**:
```typescript
toggleOverview(): void
openOverview(): void
closeOverview(): void
goHome(): void
openAppAndCloseDrawer(app: AppDefinition): void
toggleAppDrawer(): void
```

### 12. SystemTips Service

**File**: `src/app/core/services/system-tips.ts`

Displays system tips periodically.

**Included Tips**:
- Alt+Tab shortcut
- Terminal usage
- Fullscreen mode
- Theme toggle
- Explorer navigation

#### 13. DesktopIcons Service

**File**: `src/app/core/services/desktop-icons.ts`

Manages icons pinned directly to the desktop area.

**Responsibilities**: Pin/unpin apps from the desktop and manage the reactive list of shortcuts.

**Main Methods**: `pinApp()`, `unPinActiveApp()`.

#### 14. AppLauncher Service

**File**: `src/app/core/services/app-launcher.ts`

Orchestrator responsible for triggering application launches and managing UI state.

**Responsibilities**: Close context menus and trigger processes via `ProcessManager`.

**Main Methods**: `launch()`, `launchAndCloseContext()`.

#### 15. AppRegistry Service

**File**: `src/app/core/services/app-registry.ts`

Central registry and search hub for all applications installed in the system.

**Responsibilities**: Manage the reactive list of apps, search by name/ID, and associate file extensions.

**Main Methods**: `getAppById()`, `findHandlerForExtension()`, `searchApps()`.

---

## 📊 Data Models

### 1. Process Model
```typescript
interface Process {
  id: string;
  app: AppDefinition;
  args?: any[];
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  createdAt: Date;
}
```

### 2. AppDefinition Model
```typescript
interface AppDefinition {
  id: string;
  title: string;
  icon: string;
  color: string;
  component: Type<any>;
  handle?: string[]; // File extensions the app can open
}
```

### 3. FileNode Model
```typescript
interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  children?: FileNode[];
  size?: number;
  extension?: string;
  mimeType?: string;
}
```

### 4. Notification Model
```typescript
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}
```

### 5. Setting Model
```typescript
// Settings signals (from Settings service)
dockSize: signal<number>           // Dock icon size (px)
desktopSize: signal<number>        // Desktop icon size (px)
systemMuted: signal<boolean>       // System sounds muted
autoHideDock: signal<boolean>      // Auto-hide the dock
tipsEnabled: signal<boolean>       // System tips on/off
wallpaper: computed<string>        // Active wallpaper (desktop or mobile)
```

> **Note**: Wallpaper is now split into `desktopWallpaper` and `mobileWallpaper` internally. `setWallpaper()` automatically writes to the correct signal based on `ScreenService.isMobile()`.

---

## 🚀 System Features

### 1. Window Management

#### Snap (Auto-Docking)
The system offers automatic window snapping to screen edges and corners:
- **Left Edge**: 50% of screen on the left
- **Right Edge**: 50% of screen on the right
- **Top Left Corner**: 25% (1/4 top left)
- **Top Right Corner**: 25% (1/4 top right)
- **Bottom Left Corner**: 25% (1/4 bottom left)
- **Bottom Right Corner**: 25% (1/4 bottom right)

**Implementation**: When dragging a window near edges (15px), a visual "ghost" shows the snap area.

#### Resizing
Windows can be resized in 8 directions:
- North (N)
- South (S)
- East (E)
- West (W)
- Northeast (NE)
- Northwest (NW)
- Southeast (SE)
- Southwest (SW)

**Limits**: Minimum width of 320px and minimum height of 240px.

#### Maximize/Restore
Double-click on the title bar to maximize/restore the window.

#### Minimize
Minimizes the window to the dock, keeping the process active.

### 2. Virtual File System
Complete hierarchical structure with folders and files:
```
/home/
  ├── documents/
  │   ├── curriculum.pdf
  │   └── project-docs.pdf
  ├── photos/
  │   ├── feedback1.png
  │   ├── feedback2.png
  │   └── dog.jpg
  ├── music/
  │   ├── song1.mp3
  │   └── song2.mp3
  └── certificates/
      ├── cert1.pdf
      └── cert2.pdf
```

**Supported Operations**:
- Navigation (cd)
- Listing (ls)
- File opening (open)
- Search

### 3. Interactive Terminal
Functional terminal with Unix-like commands.

**Features**:
- Command history (↑/↓)
- Autocomplete
- Output colorization
- Current path

**Usage Examples**:
```bash
$ ls
documents  photos  music  certificates
$ cd documents
/home/documents
$ open curriculum.pdf
Opening curriculum.pdf...
$ theme
Theme changed to dark
```

### 4. Notification Center
Centralized notification system with:
- Relative timestamp (now, 5min ago, etc)
- Read marking
- Individual or bulk clearing
- Visual types (info, success, warning, error)

### 5. App Switcher (Ctrl+`)
Quick navigation between open windows:
- Activated by `Ctrl+\``
- Visual preview of each window
- Keyboard navigation (Tab)
- Instant focus

### 6. Context Menu
Right-click on dock icons:
- Open application
- New instance
- Close application
- Remove from dock

### 7. Drag and Drop
Drag applications from the grid to the dock to pin them.

### 8. Mobile Navigation (feature/mobile)
On devices with width < 768px the desktop layout is replaced by a mobile-optimised experience:
- **MobileNavBar**: fixed bottom bar with Home, Overview, and App Drawer buttons
- **MobileOverview**: fullscreen card grid of open windows; tap to focus, swipe-up to close; auto-closes when the last process is dismissed
- **Adaptive Wallpapers**: separate wallpaper sets for `public/wallpapers/desktop/` and `public/wallpapers/mobile/`
- **Adaptive Videos**: desktop live-wallpaper videos in `public/videos/wallpapers/desktop/`; no video wallpapers on mobile
- **Touch Gestures**: tap, swipe-up dismiss, and backdrop-tap implemented natively without third-party libraries

---

## 📱 Applications

### 1. Files (File Manager)

**Features**:
- Folder navigation
- Grid or list view
- Breadcrumbs
- Sidebar with favorite locations
- Real-time search
- File opening with associated apps
- Size information

**Components**:
- `FilesComponent`: Main component
- `BreadcrumbsComponent`: Path navigation
- `SidebarComponent`: Location sidebar
- `GridComponent`: Grid view
- `ListComponent`: List view

### 2. Firefox (Web Browser)

**Features**:
- URL navigation
- Iframe for external sites
- Error handling (CORS)
- Back/refresh buttons
- Loading indicator

**Limitations**: Some sites block iframe due to CORS policy.

### 3. Terminal

**Features**:
- Unix-like commands
- Command history
- Dynamic path
- FileSystem integration
- File opening
- Theme change
- System info

### 4. Photos (Image Viewer)

**Features**:
- Image gallery
- Full-screen viewing
- Image navigation (previous/next)
- Zoom
- Support for JPG, PNG, GIF, WebP

### 5. Documents (Document Viewer)

**Features**:
- PDF rendering (lazy-loaded via dynamic import)
- Markdown (`.md`) rendering with full formatting — same engine as Hermes
- Page navigation
- Zoom (header controls on desktop; floating pill bar on narrow windows)
- Pinch-to-zoom on mobile with reset button
- Horizontal swipe to navigate between documents on mobile (blocked when zoom > 1)
- Download
- List of available documents (differentiated icon for `.md` files)
- Container-aware responsive layout (`ResizeObserver`, breakpoint: 500 px)

**Supported Formats**: PDF, TXT, MD and other text files.

**Library**: Uses `ng2-pdf-viewer` for PDFs.

### 6. Musics (Music Player)

**Features**:
- Music library with collapsible sidebar
- Player controls (Play/Pause, Previous/Next)
- Seek bar with click and drag
- Volume control and mute
- **Synchronized lyrics** via [LRCLIB](https://lrclib.net) API
  - Fullscreen overlay with auto-scroll on active line
  - Click any line to jump to that position in the track
  - Fallback to plain (unsynchronized) lyrics
  - Attribution: "Lyrics provided by LRCLIB"
- **Album thumbnails**: `thumb` field in `fs.json`; falls back to animated spinning disc when missing or invalid
- **Music Widget** in the notification bar: thumbnail, controls, and inline progress bar
- **Now Playing Widget** in the top bar: animated disc icon with track name
- Seek debounce (80 ms) to avoid rebuffer glitches when jumping lyrics lines

**Services**:
- `AudioPlayer` (`player/audio-player.ts`): controls native `<audio>` via Angular Signals
- `LyricsService` (`player/lyrics.service.ts`): fetches LRCLIB, parses LRC, active line via binary search

**Covers**: place images in `public/data/root/home/musics/covers/` with the same base name as the audio file (`.jpg`).

**Supported Formats**: MP3, WAV, OGG, M4A, FLAC.

### 7. Settings

**Sections**:
#### Appearance
- Color scheme (light/dark)
- Wallpaper (separate sets for desktop and mobile)

#### Desktop
- Auto-hide dock *(desktop only — hidden on mobile)*
- Dock icon size *(desktop only)*
- Desktop icon size

#### Sound
- System sounds (on/off)

#### System
- System tips (on/off)

#### Language
- Portuguese/English

#### About
- System name
- Version
- Hardware information
- Engine

### 8. System Monitor

**Features**:
- List of active processes
- Actions (close process)
- Network information
- Latency
- Connection type

**Note**: CPU/RAM data is simulated due to browser limitations.

### 9. Hermes (AI Assistant)

**Features**:
- Chat with AI (Google Gemini) — streaming responses
- Image analysis (attach image to message)
- Contextualized responses with conversation history
- Multilingual support
- Model selector dropdown — lists all available Gemini models live from the API
- System actions (open apps, change theme, show notifications, etc.)
- Model-unavailable notification: when the API returns 404/NOT_FOUND, a specific notification guides the user to change the model

**Configuration**: Requires Google Gemini API key (`geminiApiKey` + optional `geminiApiKey2`) in `environment.ts`.

### 10. About Project

**Content**:
- Developer's vision
- System features
- Application descriptions
- Project motivation
- Technologies used

---

## 🔧 Installation and Configuration

### Prerequisites
- Node.js 18+ and npm 11+
- Angular CLI 21+

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd Portfolio-main

# Install dependencies
npm install

# Start development server
npm start
```

### Environment Configuration
Edit `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  geminiApiKeys: [
    'YOUR_API_KEY_HERE',
    'YOUR_BACKUP_API_KEY' // Optional
  ]
};
```

**Get Gemini API Key**:
1. Access [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Paste into environment file

### Production Environment
Edit `src/environments/environment.ts` for production:
```typescript
export const environment = {
  production: true,
  geminiApiKeys: ['PRODUCTION_API_KEY']
};
```

---

## 📜 Available Commands

### NPM Scripts
```bash
# Start development server
npm start
# or
npm run start

# Production build
npm run build

# Build with watch
npm run watch

# Run tests
npm test

# Generate component
ng generate component component-name

# Generate service
ng generate service service-name
```

### Terminal Commands (inside the app)
| Command    | Description                  | Example               |
|------------|------------------------------|-----------------------|
| `help`     | Display command list         | `help`                |
| `ls`       | List directory files         | `ls`                  |
| `cd`       | Navigate between directories | `cd documents`        |
| `open`     | Open a file                  | `open curriculum.pdf` |
| `date`     | Display current date/time    | `date`                |
| `theme`    | Toggle light/dark theme      | `theme`               |
| `clear`    | Clear terminal screen        | `clear`               |
| `neofetch` | System info                  | `neofetch`            |
| `whoami`   | Developer info               | `whoami`              |
| `about`    | Display system version       | `about`               |

---

## 🎨 Customization

### Changing Theme Colors
Edit `src/styles.scss`:
```scss
:root {
  --primary-color: #3584e4;
  --secondary-color: #ff7139;
  --background: #ffffff;
  --text-color: #000000;
}
.dark {
  --background: #1e1e1e;
  --text-color: #ffffff;
}
```

### Changing Wallpaper
Wallpapers are now split by device type:
- **Desktop**: add images to `public/wallpapers/desktop/`
- **Mobile**: add images to `public/wallpapers/mobile/`

The `Settings` service automatically picks the correct set via `ScreenService.isMobile()`.

### Changing Sounds
Add audio files to `public/sounds/` and configure in `SoundService`.

---

## 🐛 Troubleshooting

### Problem: Application doesn't open
**Solution**: Check if the app is registered in `apps.ts` and if the component is imported correctly.

### Problem: Theme doesn't change
**Solution**: Clear browser localStorage:
```javascript
localStorage.clear()
```

### Problem: Hermes doesn't respond
**Solution**:
1. Check if Gemini API key is configured
2. Check API quota in Google Cloud Console
3. See errors in browser console

### Problem: Files don't appear
**Solution**: FileSystem is initialized in `file-system.service.ts`. Check for console errors.

### Problem: Terminal doesn't execute commands
**Solution**: Check if the command exists in `terminal-comands.ts` and if syntax is correct.

---

## 📚 Additional Resources

### Documentation
- [Angular](https://angular.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)
- [Google Gemini](https://ai.google.dev)

### Design Inspiration
- [GNOME Desktop](https://www.gnome.org)
- [Elementary OS](https://elementary.io)
- [Ubuntu](https://ubuntu.com)

---

## 🤝 Contributing

### How to Contribute
1. Fork the project
2. Create a branch for your feature `git checkout -b feature/AmazingFeature`
3. Commit your changes `git commit -m 'Add some AmazingFeature'`
4. Push to the branch `git push origin feature/AmazingFeature`
5. Open a Pull Request

### Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Use descriptive commits

---

## 📄 License

This project is a personal portfolio. All rights reserved.

---

## 👤 Author

**Developer**: Caio Souza Silva  
**Contact**: caiosouzasilva13650@gmail.com  
**Portfolio**: [caiossiva.com](https://caiossiva.com)  
**GitHub**: [github.com/CaioSSilva](https://github.com/CaioSSilva/)

---

## 🙏 Acknowledgments

- Angular Team
- GNOME Design Team
- Open Source Community
- Google Gemini Team
- Font Awesome
- Tailwind CSS Team

---

## 📊 Project Statistics

- **Version**: 2.4.0
- **Lines of Code**: ~19,000+
- **Components**: 29+
- **Services**: 19+
- **Applications**: 10
- **Languages**: 2
- **Test Files**: 52
- **Tests**: 607 (100% passing)
- **Performance Score**: 90+

---

## 📞 Support

For questions, suggestions, or to report bugs:
- **Issues**: Open an issue on GitHub
- **Discussions**: Use the Discussions tab on GitHub

---

**Developed with ❤️ using Angular 22**

**Last Update**: January 2027 · v2.4.0
