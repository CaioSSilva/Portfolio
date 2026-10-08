# Complete Documentation — Cai_OS 2.3.1

## 📋 Table of Contents

1. [Overview](#-overview)
2. [What's New in 2.0.0](#-whats-new-in-200--mobile-adaptation)
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

## 🆕 What's New in 2.0.0 — Mobile Adaptation

A versão 2.0.0 marcou a migração completa do Cai_OS para suporte mobile nativo. Até então, o sistema assumia sempre um ambiente desktop com mouse e teclado. Esta versão introduziu uma camada de navegação mobile completa, detecção de breakpoints reativa, gestos de toque em todos os apps e re-arquitetura do sistema de janelas para funcionar em tela cheia no mobile.

### ScreenService — Detecção de Breakpoints Reativa

Novo serviço centralizado que expõe sinais Angular atualizados em `window.resize`:

```typescript
readonly isMobile  = computed(() => this.width() < 768);
readonly isTablet  = computed(() => this.width() >= 768 && this.width() < 1024);
readonly isDesktop = computed(() => this.width() >= 1024);
readonly isCompact = computed(() => this.width() < 1024);
```

| Range | Modo |
|---|---|
| `< 768 px` | Mobile — `MobileNavBar` + `MobileOverview` |
| `768–1023 px` | Tablet (compacto) — layout mobile |
| `≥ 1024 px` | Desktop — `Dock` + `WindowSwitcher` |

Todos os componentes passaram a depender de `ScreenService.isMobile()` em vez de `window.innerWidth` direto — garantindo reatividade total sem polling.

### MobileNavBar — Barra de Navegação Inferior

Nova barra fixa na base da tela, visível apenas no mobile (`< 768 px`), substituindo o `Dock` que permanece exclusivo do desktop:

| Botão | Ação |
|---|---|
| Ícone quadrado | Abre/fecha a tela de Overview (apps recentes) |
| Pílula central | Go Home — minimiza todos os processos e fecha os drawers |
| Ícone de grade | Abre/fecha o App Drawer |

### MobileOverview — Carrossel de Processos

Tela completa de gestão de apps abertos, inspirada no recents do Android/iOS:

- **Swipe up** num card → fecha o processo com animação de saída
- **Tap** num card → foca o app e fecha o overview
- **Swipe horizontal** → navega entre os cards
- **Botão de fechar** individual por card
- **Clear all** → fecha todos os processos de uma vez

### MobileNavService — Estado Central de Navegação Mobile

Novo serviço que centraliza toda a lógica de navegação mobile, evitando comunicação direta entre componentes:

| Método | Descrição |
|---|---|
| `toggleOverview()` | Alterna a tela de overview |
| `goHome()` | Minimiza todos os processos, fecha drawers |
| `toggleAppDrawer()` | Alterna o App Drawer |
| `openAppAndCloseDrawer(app)` | Abre um app e fecha o overview em sequência |

### Sistema de Janelas — Adaptação Mobile

O `WindowService` passou a reagir ao `ScreenService.isMobile()` via `effect()`:

- **Ao entrar no mobile**: força maximização de todas as janelas abertas
- **Ao voltar ao desktop**: restaura o `normalRect` salvo antes da maximização
- **Title bar ocultada** no mobile (sem necessidade de arrastar/redimensionar)
- **Drag e resize bloqueados** quando `isMobile() === true`

```typescript
// WindowService — efeito automático de adaptação
effect(() => {
  if (screen.isMobile()) {
    this.maximize();
  } else {
    this.restore();
  }
});
```

### TopBar — Gesto de Pull para Notificações

A barra superior ganhou suporte a toque no mobile:

- **Desktop**: clique abre o centro de notificações
- **Mobile**: swipe down (≥ 30 px) abre o centro de notificações com feedback visual de rubber-band durante o arrasto

### AppsGrid — Toque Sem Delay

O App Drawer foi otimizado para mobile:

- Apps abrem via `touchend` — sem o delay de 300 ms do `click` em dispositivos touch
- **Long-press (500 ms)** abre o menu de contexto do app
- Menu de contexto centralizado no ícone usando `getBoundingClientRect()`, com clamp ao viewport

### ProcessManager — Lazy Loading Async

O `ProcessManager.spawn()` tornou-se `async` para suportar componentes lazy-loaded — necessário para separar o bundle do `DocumentViewer` (PDF viewer) do bundle principal:

```typescript
private async spawn(app, data?): Promise<void> {
  const component = app.loadComponent
    ? await app.loadComponent()
    : app.component;
  // cria e registra o processo
}
```

| Bundle | Antes (v1.x) | Depois (v2.0.0) |
|---|---|---|
| Bundle inicial | 995 kB | **492 kB** |
| Lazy chunk | — | `document-viewer` ~507 kB |
| Budget warning | ⚠ sim | **✓ nenhum** |

### Test Suite

- **48 test files · 480+ tests · 0 failures**
- Cobertura inclui: `ScreenService` breakpoints, `MobileNavService` estado, `WindowService` adaptação mobile/desktop, `ProcessManager` spawn assíncrono, gestos de toque no `DocumentViewer` e `ImageViewer`

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
