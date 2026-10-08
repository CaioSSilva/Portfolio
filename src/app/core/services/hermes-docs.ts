export const HERMES_DOCS: Record<string, string> = {
  pt: `
# Cai_OS - Resumo do Sistema

Cai_OS é um sistema operacional web interativo construído com Angular 21, inspirado no GNOME. É o portfólio de Caio Souza Silva.

## Aplicativos
- **Files**: Gerenciador de arquivos com visualização em grade/lista, breadcrumbs, sidebar e busca.
- **Firefox**: Navegador web via iframe.
- **Terminal**: Comandos Unix-like (ls, cd, open, date, theme, clear, help, neofetch, whoami).
- **Photos**: Visualizador de imagens (JPG, PNG, GIF, WebP) com galeria, zoom e navegação.
- **Documents**: Visualizador de PDFs com navegação entre páginas e zoom.
- **Musics**: Player de música (MP3, WAV, OGG) com controles, volume e seek slider interativo.
- **Settings**: Configurações de tema, wallpaper, dock, sons, dicas e idioma.
- **System Monitor**: Lista de processos ativos e informações de rede.
- **Hermes**: Você! Assistente IA integrado usando Google Gemini.
- **About Project**: Informações sobre o projeto e o desenvolvedor.

## Funcionalidades do Sistema
- **Janelas**: Arrastar, redimensionar (8 direções, mín. 320x240), maximizar (duplo clique), minimizar, snap nas bordas/cantos.
- **Dock**: Barra de tarefas com apps fixados, indicadores de execução, menu de contexto e drag-and-drop.
- **Top Bar**: Relógio, grid de apps, centro de notificações, menu de energia. Widget "Tocando agora" aparece na barra quando uma música está sendo reproduzida — no desktop fica à esquerda e abre o painel de notificações ao clicar; no mobile fica centralizado e abre o player. Ao abrir as notificações, o widget migra para dentro do painel com controles completos (prev/play/next, seek slider interativo).
- **App Switcher**: Ctrl+\` (crase) para alternar janelas.
- **Sistema de Arquivos Virtual**: Estrutura hierárquica em /home/ com documents, photos, music, certificates.
- **Temas**: Claro e escuro.
- **Idiomas**: Português e Inglês.
- **Notificações**: Info, success, warning, error com timestamp relativo.
- **Sons do sistema**: Cliques, notificações, erros.

## Sobre o Autor
- **Nome**: Caio Souza Silva
- **Email**: caiosouzasilva13650@gmail.com
- **Portfolio**: caiossiva.com
- **GitHub**: github.com/CaioSSilva

## Tecnologias
Angular 21, TypeScript, Tailwind CSS 4, SCSS, Google Gemini AI, Font Awesome 7, Vitest.

## Estatísticas
~16.000+ linhas de código, 30+ componentes, 15+ serviços, 10 aplicativos, 487 testes automatizados.
`,

  en: `
# Cai_OS - System Summary

Cai_OS is an interactive web operating system built with Angular 21, inspired by GNOME. It is Caio Souza Silva's portfolio.

## Applications
- **Files**: File manager with grid/list view, breadcrumbs, sidebar and search.
- **Firefox**: Web browser via iframe.
- **Terminal**: Unix-like commands (ls, cd, open, date, theme, clear, help, neofetch, whoami).
- **Photos**: Image viewer (JPG, PNG, GIF, WebP) with gallery, zoom and navigation.
- **Documents**: PDF viewer with page navigation and zoom.
- **Musics**: Music player (MP3, WAV, OGG) with controls, volume and interactive seek slider.
- **Settings**: Theme, wallpaper, dock, sounds, tips and language settings.
- **System Monitor**: Active process list and network info.
- **Hermes**: You! Integrated AI assistant using Google Gemini.
- **About Project**: Information about the project and developer.

## System Features
- **Windows**: Drag, resize (8 directions, min 320x240), maximize (double-click), minimize, edge/corner snap.
- **Dock**: Taskbar with pinned apps, running indicators, context menu and drag-and-drop.
- **Top Bar**: Clock, app grid, notification center, power menu. A "Now Playing" widget appears while a song plays — on desktop it sits on the left and opens the notification panel on click; on mobile it is centred and opens the player. When the panel is open, the widget moves inside it with full controls (prev/play/next, interactive seek slider).
- **App Switcher**: Ctrl+\` (backtick) to switch windows.
- **Virtual File System**: Hierarchical structure at /home/ with documents, photos, music, certificates.
- **Themes**: Light and dark.
- **Languages**: Portuguese and English.
- **Notifications**: Info, success, warning, error with relative timestamps.
- **System sounds**: Clicks, notifications, errors.

## About the Author
- **Name**: Caio Souza Silva
- **Email**: caiosouzasilva13650@gmail.com
- **Portfolio**: caiossiva.com
- **GitHub**: github.com/CaioSSilva

## Technologies
Angular 21, TypeScript, Tailwind CSS 4, SCSS, Google Gemini AI, Font Awesome 7, Vitest.

## Statistics
~16,000+ lines of code, 30+ components, 15+ services, 10 applications, 487 automated tests.
`,
};
