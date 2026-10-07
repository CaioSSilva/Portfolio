# Documentação Completa - Cai_OS

## 📋 Sumário

1. [Visão Geral](#-visão-geral)
2. [Arquitetura do Sistema](#️-arquitetura-do-sistema)
3. [Tecnologias Utilizadas](#️-tecnologias-utilizadas)
4. [Estrutura do Projeto](#-estrutura-do-projeto)
5. [Componentes Principais](#-componentes-principais)
6. [Serviços](#️-serviços)
7. [Modelos de Dados](#-modelos-de-dados)
8. [Funcionalidades do Sistema](#-funcionalidades-do-sistema)
9. [Aplicativos](#-aplicativos)
10. [Instalação e Configuração](#-instalação-e-configuração)
11. [Comandos Disponíveis](#-comandos-disponíveis)
12. [Personalização](#-personalização)
13. [Troubleshooting](#-troubleshooting)
14. [Recursos Adicionais](#-recursos-adicionais)
15. [Contribuindo](#-contribuindo)
16. [Licença](#-licença)
17. [Autor](#-autor)
18. [Agradecimentos](#-agradecimentos)
19. [Estatísticas do Projeto](#-estatísticas-do-projeto)
20. [Suporte](#-suporte)

---

## 🌟 Visão Geral

**Cai_OS** é um sistema operacional web interativo construído com Angular 22, inspirado no ambiente de desktop GNOME. O projeto simula uma experiência completa de sistema operacional diretamente no navegador, incluindo gerenciamento de janelas, aplicativos, terminal, sistema de arquivos virtual e integração com IA.

### Objetivo do Projeto

O Cai_OS foi desenvolvido como um portfólio interativo que demonstra:
- Domínio avançado de Angular e TypeScript
- Arquitetura de software escalável
- Design de interface inspirado em sistemas operacionais modernos
- Integração com APIs externas (Google Gemini)
- Gerenciamento de estado complexo
- Experiência do usuário (UX/UI) profissional

### Características Principais

- **Interface de Desktop Moderna**: Inspirada no GNOME com dock, barra superior e grid de aplicativos
- **Gerenciamento de Janelas**: Suporte a arrastar, redimensionar, maximizar, minimizar e snap
- **Sistema de Arquivos Virtual**: Estrutura hierárquica de pastas e arquivos
- **Terminal Interativo**: Comandos Unix-like para navegação e controle do sistema
- **Aplicativos Integrados**: Navegador, visualizador de imagens, player de música, editor de documentos
- **IA Integrada**: Assistente virtual "Hermes" usando Google Gemini
- **Temas**: Suporte a modo claro e escuro
- **Multilíngue**: Português e Inglês
- **Sistema de Notificações**: Centro de notificações com histórico
- **Efeitos Sonoros**: Sons do sistema para interações

---

## 🏗️ Arquitetura do Sistema

### Visão Geral da Arquitetura

O Cai_OS segue uma arquitetura modular baseada em componentes Angular, com separação clara entre:

```
┌─────────────────────────────────────────┐
│           Camada de Apresentação        │
│  (Components, Templates, Styles)        │
├─────────────────────────────────────────┤
│          Camada de Serviços             │
│  (Business Logic, State Management)     │
├─────────────────────────────────────────┤
│           Camada de Modelos             │
│  (Data Models, Interfaces, Types)       │
├─────────────────────────────────────────┤
│         Camada de Infraestrutura        │
│  (APIs, Storage, External Services)     │
└─────────────────────────────────────────┘
```

### Padrões de Projeto Utilizados

1. **Singleton**: Services com `providedIn: 'root'`
2. **Observer**: RxJS Signals para gerenciamento de estado reativo
3. **Strategy**: Sistema de comandos do terminal
4. **Factory**: Criação dinâmica de componentes de aplicativos
5. **Dependency Injection**: Injeção nativa do Angular

### Fluxo de Dados

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

## 🛠️ Tecnologias Utilizadas

### Estilização

- **Tailwind CSS 4.1.18**: Framework CSS utilitário
- **SCSS**: Pré-processador CSS
- **PostCSS 8.5.6**: Processamento de CSS
- **Font Awesome 7.1.0**: Biblioteca de ícones

### Bibliotecas Externas

- **@google/generative-ai 0.24.1**: Integração com Google Gemini
- **ng2-pdf-viewer 10.4.0**: Visualização de PDFs
- **@vercel/analytics 1.6.1**: Analytics
- **@vercel/speed-insights 1.3.1**: Métricas de performance

### Ferramentas de Desenvolvimento

- **Angular CLI 22.0.4**: CLI do Angular
- **TypeScript 6.0.3**: Superset tipado de JavaScript
- **Vitest 4.0.18**: Framework de testes
- **jsdom 28.0.0**: Ambiente DOM para testes
- **Prettier**: Formatação de código

---

## 📁 Estrutura do Projeto

```
Portfolio-main/
├── src/
│   ├── app/
│   │   ├── core/                    # Núcleo do sistema
│   │   │   ├── language/            # Internacionalização
│   │   │   │   ├── en.ts
│   │   │   │   ├── pt.ts
│   │   │   │   └── i18n.types.ts
│   │   │   ├── models/              # Modelos de dados
│   │   │   │   ├── apps.ts
│   │   │   │   ├── base.ts
│   │   │   │   ├── dock.ts
│   │   │   │   ├── file.ts
│   │   │   │   ├── hermes.ts
│   │   │   │   ├── notification.ts
│   │   │   │   ├── process.ts
│   │   │   │   ├── setting.ts
│   │   │   │   └── terminal.ts
│   │   │   ├── pipes/               # Pipes customizados
│   │   │   │   └── markdown-pipe.ts
│   │   │   └── services/            # Serviços do sistema
│   │   │       ├── app-launcher.ts
│   │   │       ├── app-registry.ts
│   │   │       ├── apps.ts
│   │   │       ├── context-menu.ts
│   │   │       ├── desktop-icons.ts
│   │   │       ├── dock.ts
│   │   │       ├── file-system.ts
│   │   │       ├── gemini.ts
│   │   │       ├── language.ts
│   │   │       ├── notification.ts
│   │   │       ├── process-manager.ts
│   │   │       ├── settings.ts
│   │   │       ├── sound.ts
│   │   │       ├── system-tips.ts
│   │   │       ├── terminal-comands.ts
│   │   │       ├── theme.ts
│   │   │       └── window.ts
│   │   ├── features/                # Aplicativos do sistema
│   │   │   ├── about-project/       # Sobre o projeto
│   │   │   ├── browser/             # Navegador web
│   │   │   ├── document-viewer/     # Visualizador de PDFs
│   │   │   ├── files/               # Gerenciador de arquivos
│   │   │   │   └── components/
│   │   │   │       ├── breadcrumbs/
│   │   │   │       ├── grid/
│   │   │   │       ├── list/
│   │   │   │       └── sidebar/
│   │   │   ├── hermes/              # Assistente IA
│   │   │   ├── image-viewer/        # Visualizador de imagens
│   │   │   ├── musics/              # Player de música
│   │   │   │   └── player/
│   │   │   ├── settings/            # Configurações do sistema
│   │   │   ├── system-monitor/      # Monitor do sistema
│   │   │   └── terminal/            # Terminal
│   │   ├── layout/                  # Componentes de layout
│   │   │   ├── apps-grid/           # Grid de aplicativos
│   │   │   ├── dock/                # Barra de tarefas
│   │   │   ├── notification-center/ # Centro de notificações
│   │   │   ├── top-bar/             # Barra superior
│   │   │   └── window-switcher/     # Alternador de janelas
│   │   ├── shared/                  # Componentes compartilhados
│   │   │   └── ui/
│   │   │       ├── boot/            # Tela de boot
│   │   │       ├── shutdown/        # Tela de desligamento
│   │   │       ├── context-menu/    # Menu de contexto
│   │   │       └── window/          # Componente de janela
│   │   ├── app.config.ts
│   │   ├── app.html
│   │   ├── app.routes.ts
│   │   ├── app.scss
│   │   └── app.ts
│   ├── environments/                # Configurações de ambiente
│   │   ├── environment.ts
│   │   └── environment.development.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── public/                          # Assets públicos
├── angular.json                     # Configuração do Angular
├── package.json                     # Dependências
├── tsconfig.json                    # Configuração TypeScript
└── README.md
```

---

## 🧩 Componentes Principais

### 1. App Component (Root)

**Arquivo**: `src/app/app.ts`

Componente raiz da aplicação que gerencia o estado global do sistema.

**Responsabilidades**:
- Inicialização do sistema
- Gerenciamento de sons de interação
- Controle de boot e shutdown
- Coordenação entre serviços principais

**Código Principal**:
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

**Arquivo**: `src/app/shared/ui/window/window.ts`

Componente que representa uma janela de aplicativo com funcionalidades completas de gerenciamento.

**Funcionalidades**:
- Arrastar (drag)
- Redimensionar (resize)
- Maximizar/Restaurar
- Minimizar
- Snap automático nas bordas
- Animações de transição
- Foco e z-index dinâmico

**Principais Métodos**:
- `startDrag()`: Inicia o arrasto da janela
- `startResize()`: Inicia o redimensionamento
- `maximize()`: Maximiza a janela
- `minimize()`: Minimiza a janela
- `close()`: Fecha a janela

### 3. Dock Component

**Arquivo**: `src/app/layout/dock/dock.ts`

Barra de tarefas inferior que exibe aplicativos fixados e em execução.

**Funcionalidades**:
- Exibição de apps fixados
- Indicadores de apps em execução
- Menu de contexto (clique direito)
- Drag and drop para adicionar apps
- Efeito de hover animado
- Auto-hide opcional

### 4. TopBar Component

**Arquivo**: `src/app/layout/top-bar/top-bar.ts`

Barra superior do sistema com relógio, menu de aplicativos e botão de energia.

**Funcionalidades**:
- Relógio em tempo real
- Acesso ao grid de aplicativos
- Centro de notificações
- Menu de energia (desligar/reiniciar)
- Exibição de título da janela ativa

### 5. Apps Grid Component

**Arquivo**: `src/app/layout/apps-grid/apps-grid.ts`

Grid de aplicativos com pesquisa e categorização.

**Funcionalidades**:
- Exibição de todos os apps instalados
- Busca por nome
- Arrastar para a dock
- Abertura rápida de apps

### 6. Window Switcher Component

**Arquivo**: `src/app/layout/window-switcher/window-switcher.ts`

Alternador de janelas ativado por `Ctrl+Q`.

**Funcionalidades**:
- Listagem de janelas abertas
- Navegação por teclado
- Preview visual das janelas
- Foco rápido

### 7. ContextMenu Component

**Arquivo**: `src/app/shared/ui/context-menu/context-menu.ts`

Menu de contexto visual que aparece ao clicar com botão direito.

**Funcionalidades**:
- Abrir aplicativo
- Nova instância
- Fechar aplicativo
- Fixar/Remover da dock
- Fixar/Remover da área de trabalho
- Posicionamento dinâmico baseado no cursor

**Integração**:
- Funciona com ícones da Dock
- Funciona com ícones da área de trabalho
- Integrado com ContextMenuService

---

## ⚙️ Serviços

### 1. ProcessManager Service

**Arquivo**: `src/app/core/services/process-manager.ts`

Gerencia todos os processos (aplicativos) em execução.

**Responsabilidades**:
- Criar novos processos
- Fechar processos
- Gerenciar foco (z-index)
- Minimizar/Maximizar janelas
- Manter lista de processos ativos

**Principais Métodos**:
```typescript
start(app: AppDefinition, args?: any[]): void
kill(processId: string): void
focus(processId: string): void
minimize(processId: string): void
toggleMaximize(processId: string): void
```

### 2. FileSystem Service

**Arquivo**: `src/app/core/services/file-system.ts`

Sistema de arquivos virtual hierárquico.

**Estrutura**:
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

**Principais Métodos**:
- `getNodeByPath()`: Busca arquivo/pasta por caminho
- `listDirectory()`: Lista conteúdo de diretório
- `createFile()`: Cria novo arquivo
- `deleteNode()`: Remove arquivo/pasta
- `moveNode()`: Move arquivo/pasta

### 3. Settings Service

**Arquivo**: `src/app/core/services/settings.ts`

Gerencia as configurações do sistema.

**Configurações Disponíveis**:
- Tema (claro/escuro)
- Papel de parede
- Tamanho dos ícones da dock
- Auto-hide da dock
- Sons do sistema
- Dicas do sistema
- Idioma

**Persistência**: Usa `localStorage` para salvar preferências.

### 4. LanguageService

**Arquivo**: `src/app/core/services/language.ts`

Sistema de internacionalização (i18n).

**Idiomas Suportados**:
- Português (pt)
- Inglês (en)

**Uso**:
```typescript
lang.t().apps.files // Retorna tradução
lang.setLanguage('pt') // Altera idioma
```

### 5. NotificationService

**Arquivo**: `src/app/core/services/notification.ts`

Gerencia notificações do sistema.

**Tipos de Notificação**:
- Info
- Success
- Warning
- Error

**Principais Métodos**:
```typescript
show(title: string, message: string, type: NotificationType): void
clear(id: string): void
clearAll(): void
```

### 6. Sound Service

**Arquivo**: `src/app/core/services/sound.ts`

Reproduz efeitos sonoros do sistema.

**Sons Disponíveis**:
- `mouse_down`: Clique do mouse
- `mouse_up`: Soltar o mouse
- `notification`: Som de notificação
- `error`: Som de erro

### 7. Theme Service

**Arquivo**: `src/app/core/services/theme.ts`

Gerencia o tema visual do sistema.

**Temas**:
- `light`: Tema claro
- `dark`: Tema escuro

**Método Principal**:
```typescript
setTheme(theme: 'light' | 'dark'): void
toggleTheme(): void
```

### 8. Gemini Service

**Arquivo**: `src/app/core/services/gemini.ts`

Integração com Google Gemini AI.

**Funcionalidades**:
- Geração de texto
- Análise de imagens
- Rotação de API keys
- Tratamento de quota

**Método Principal**:
```typescript
async generateResponse(
  prompt: string, 
  fileData?: { mimeType: string; b64: string }
): Promise<string>
```

### 9. TerminalCommands Service

**Arquivo**: `src/app/core/services/terminal-comands.ts`

Implementa comandos Unix-like para o terminal.

**Comandos Disponíveis**:
- `ls`: Lista arquivos
- `cd`: Navega entre diretórios
- `open`: Abre arquivos
- `date`: Exibe data/hora
- `theme`: Alterna tema
- `clear`: Limpa terminal
- `help`: Exibe ajuda
- `neofetch`: Info do sistema
- `whoami`: Info do desenvolvedor
- `about`: Versão do sistema

### 10. SystemTips Service

**Arquivo**: `src/app/core/services/system-tips.ts`

Exibe dicas do sistema periodicamente.

**Dicas Incluídas**:
- Atalho Alt+Tab
- Uso do terminal
- Modo fullscreen
- Alternância de tema
- Navegação no explorer

#### 11. DesktopIcons Service

**Arquivo**: `src/app/core/services/desktop-icons.ts`

Gerencia os ícones fixados diretamente na área de trabalho.

**Responsabilidades**: Fixar/remover apps do desktop e gerenciar a lista reativa de atalhos.
**Principais Métodos**: `pinApp()`, `unPinActiveApp()`.

#### 12. AppLauncher Service

**Arquivo**: `src/app/core/services/app-launcher.ts`

Orquestrador responsável por disparar a abertura de aplicativos e gerenciar o estado da interface.

**Responsabilidades**: Fechar menus de contexto e disparar processos via `ProcessManager`.
**Principais Métodos**: `launch()`, `launchAndCloseContext()`.

#### 13. AppRegistry Service

**Arquivo**: `src/app/core/services/app-registry.ts`

Central de registro e busca de todos os aplicativos instalados no sistema.

**Responsabilidades**: Gerenciar a lista reativa de apps, busca por nome/ID e associar extensões de arquivos.

**Principais Métodos**: `getAppById()`, `findHandlerForExtension()`, `searchApps()`.

---

## 📊 Modelos de Dados

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
  handle?: string[]; // Extensões de arquivo que o app pode abrir
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
interface SystemSettings {
  theme: 'light' | 'dark';
  wallpaper: string;
  dockIconSize: number;
  autoHideDock: boolean;
  soundEnabled: boolean;
  tipsEnabled: boolean;
  language: 'pt' | 'en';
}
```

### 6. DesktopItem Model

```typescript
interface pinnedDesktopItem {
  id: string;
  name: string;
  color: string;
  icon: string;
  action: () => any;
}
```

**Uso**: Representa um ícone de aplicativo fixado na área de trabalho.

---

## 🚀 Funcionalidades do Sistema

### 1. Gerenciamento de Janelas

#### Snap (Encaixe Automático)

O sistema oferece encaixe automático de janelas nas bordas e cantos da tela:

- **Borda Esquerda**: 50% da tela à esquerda
- **Borda Direita**: 50% da tela à direita
- **Canto Superior Esquerdo**: 25% (1/4 superior esquerdo)
- **Canto Superior Direito**: 25% (1/4 superior direito)
- **Canto Inferior Esquerdo**: 25% (1/4 inferior esquerdo)
- **Canto Inferior Direito**: 25% (1/4 inferior direito)

**Implementação**: Ao arrastar uma janela próximo às bordas (15px), um "ghost" visual mostra a área de encaixe.

#### Redimensionamento

As janelas podem ser redimensionadas em 8 direções:
- Norte (N)
- Sul (S)
- Leste (E)
- Oeste (W)
- Nordeste (NE)
- Noroeste (NW)
- Sudeste (SE)
- Sudoeste (SW)

**Limites**: Largura mínima de 320px e altura mínima de 240px.

#### Maximizar/Restaurar

Duplo clique na barra de título maximiza/restaura a janela.

#### Minimizar

Minimiza a janela para a dock, mantendo o processo ativo.

### 2. Sistema de Arquivos Virtual

Estrutura hierárquica completa com pastas e arquivos:

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

**Operações Suportadas**:
- Navegação (cd)
- Listagem (ls)
- Abertura de arquivos (open)
- Busca

### 3. Terminal Interativo

Terminal funcional com comandos Unix-like.

**Recursos**:
- Histórico de comandos (↑/↓)
- Autocomplete
- Colorização de output
- Path atual

**Exemplos de Uso**:
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

### 4. Centro de Notificações

Sistema centralizado de notificações com:
- Timestamp relativo (agora, há 5min, etc)
- Marcação de lidas
- Limpeza individual ou em massa
- Tipos visuais (info, success, warning, error)

### 5. App Switcher (Ctrl+Q)

Navegação rápida entre janelas abertas:
- Ativado por `Ctrl+Q`
- Preview visual de cada janela
- Navegação por teclado (Tab)
- Foco instantâneo

### 6. Menu de Contexto

Clique direito em ícones da dock:
- Abrir aplicativo
- Nova instância
- Fechar aplicativo
- Remover da dock

### 7. Drag and Drop

Arrastar aplicativos do grid para a dock para fixá-los.

---

## 📱 Aplicativos

### 1. Files (Gerenciador de Arquivos)

**Funcionalidades**:
- Navegação por pastas
- Visualização em grade ou lista
- Breadcrumbs
- Sidebar com locais favoritos
- Busca em tempo real
- Abertura de arquivos com apps associados
- Informações de tamanho

**Componentes**:
- `FilesComponent`: Componente principal
- `BreadcrumbsComponent`: Navegação de caminho
- `SidebarComponent`: Sidebar de locais
- `GridComponent`: Visualização em grade
- `ListComponent`: Visualização em lista

### 2. Firefox (Navegador Web)

**Funcionalidades**:
- Navegação por URL
- Iframe para sites externos
- Tratamento de erros (CORS)
- Botões voltar/atualizar
- Indicador de carregamento

**Limitações**: Alguns sites bloqueiam iframe por política CORS.

### 3. Terminal

**Funcionalidades**:
- Comandos Unix-like
- Histórico de comandos
- Path dinâmico
- Integração com FileSystem
- Abertura de arquivos
- Mudança de tema
- Info do sistema

### 4. Photos (Visualizador de Imagens)

**Funcionalidades**:
- Galeria de imagens
- Visualização em tela cheia
- Navegação entre imagens (anterior/próxima)
- Zoom
- Suporte a JPG, PNG, GIF, WebP

### 5. Documents (Visualizador de PDFs)

**Funcionalidades**:
- Renderização de PDFs
- Navegação entre páginas
- Zoom
- Download
- Lista de documentos disponíveis

**Biblioteca**: Usa `ng2-pdf-viewer`.

### 6. Musics (Player de Música)

**Funcionalidades**:
- Biblioteca de músicas
- Player com controles
- Progress bar
- Volume
- Play/Pause
- Anterior/Próxima
- Metadados (se disponíveis)

**Formatos Suportados**: MP3, WAV, OGG.

### 7. Settings (Configurações)

**Seções**:

#### Aparência
- Esquema de cores (claro/escuro)
- Papel de parede

#### Desktop
- Ocultar dock automaticamente
- Tamanho dos ícones

#### Som
- Sons do sistema (on/off)

#### Sistema
- Dicas do sistema (on/off)

#### Idioma
- Português/Inglês

#### Sobre
- Nome do sistema
- Versão
- Informações de hardware
- Engine

### 8. System Monitor (Monitor do Sistema)

**Funcionalidades**:
- Lista de processos ativos
- Ações (fechar processo)
- Informações de rede
- Latência
- Tipo de conexão

**Nota**: Dados de CPU/RAM são simulados por limitações do navegador.

### 9. Hermes (Assistente IA)

**Funcionalidades**:
- Chat com IA (Google Gemini)
- Análise de imagens
- Respostas contextualizadas
- Suporte multilíngue
- Interface de chat moderna

**Configuração**: Requer API key do Google Gemini em `environment.ts`.

### 10. About Project (Sobre o Projeto)

**Conteúdo**:
- Visão do desenvolvedor
- Funcionalidades do sistema
- Descrição dos aplicativos
- Motivação do projeto
- Tecnologias utilizadas

---

## 🔧 Instalação e Configuração

### Pré-requisitos

- Node.js 18+ e npm 11+
- Angular CLI 21+

### Instalação

```bash
# Clonar o repositório
git clone <repository-url>
cd Portfolio-main

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start
```

### Configuração de Ambiente

Edite `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  geminiApiKeys: [
    'SUA_API_KEY_AQUI',
    'SUA_API_KEY_BACKUP' // Opcional
  ]
};
```

**Obter API Key do Gemini**:
1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova API key
3. Cole no arquivo de environment

### Ambiente de Produção

Edite `src/environments/environment.ts` para produção:

```typescript
export const environment = {
  production: true,
  geminiApiKeys: ['API_KEY_PRODUCAO']
};
```

---

## 📜 Comandos Disponíveis

### NPM Scripts

```bash
# Iniciar servidor de desenvolvimento
npm start
# ou
npm run start

# Build de produção
npm run build

# Build com watch
npm run watch

# Executar testes
npm test

# Gerar componente
ng generate component nome-componente

# Gerar serviço
ng generate service nome-servico
```

### Comandos do Terminal (dentro do app)

| Comando    | Descrição                    | Exemplo               |
|------------|------------------------------|-----------------------|
| `help`     | Exibe lista de comandos      | `help`                |
| `ls`       | Lista arquivos do diretório  | `ls`                  |
| `cd`       | Navega entre diretórios      | `cd documents`        |
| `open`     | Abre um arquivo              | `open curriculum.pdf` |
| `date`     | Exibe data/hora atual        | `date`                |
| `theme`    | Alterna tema claro/escuro    | `theme`               |
| `clear`    | Limpa tela do terminal       | `clear`               |
| `neofetch` | Info do sistema              | `neofetch`            |
| `whoami`   | Info do desenvolvedor        | `whoami`              |
| `about`    | Exibe versão do sistema      | `about`               |

---

## 🎨 Personalização

### Mudando Cores do Tema

Edite `src/styles.scss`:

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

### Mudando Papel de Parede

Adicione imagens em `public/wallpapers/` e configure em Settings.

### Mudando Sons

Adicione arquivos de áudio em `public/sounds/` e configure no `SoundService`.

---

## 🐛 Troubleshooting

### Problema: Aplicativo não abre

**Solução**: Verifique se o app está registrado em `apps.ts` e se o componente está importado corretamente.

### Problema: Tema não muda

**Solução**: Limpe o localStorage do navegador:
```javascript
localStorage.clear()
```

### Problema: Hermes não responde

**Solução**:
1. Verifique se a API key do Gemini está configurada
2. Verifique quota da API no Google Cloud Console
3. Veja erros no console do navegador

### Problema: Arquivos não aparecem

**Solução**: O FileSystem é inicializado no `file-system.service.ts`. Verifique se há erros no console.

### Problema: Terminal não executa comandos

**Solução**: Verifique se o comando existe em `terminal-comands.ts` e se a sintaxe está correta.

---

## 📚 Recursos Adicionais

### Documentação

- [Angular](https://angular.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)
- [Google Gemini](https://ai.google.dev)

### Inspiração de Design

- [GNOME Desktop](https://www.gnome.org)
- [Elementary OS](https://elementary.io)
- [Ubuntu](https://ubuntu.com)

---

## 🤝 Contribuindo

### Como Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Guidelines

- Siga o estilo de código existente
- Adicione testes para novas funcionalidades
- Atualize a documentação
- Use commits descritivos

---

## 📄 Licença

Este projeto é um portfólio pessoal. Todos os direitos reservados.

---

## 👤 Autor

**Desenvolvedor**: Caio Souza Silva  
**Contato**: caiosouzasilva13650@gmail.com  
**Portfolio**: [caiossiva.com](https://caiossiva.com)  
**GitHub**: [github.com/CaioSSilva](https://github.com/CaioSSilva/)

---

## 🙏 Agradecimentos

- Angular Team
- GNOME Design Team
- Comunidade Open Source
- Google Gemini Team
- Font Awesome
- Tailwind CSS Team

---

## 📊 Estatísticas do Projeto

- **Linhas de Código**: ~15.000+
- **Componentes**: 25+
- **Serviços**: 15+
- **Aplicativos**: 10
- **Idiomas**: 2
- **Arquivos de Teste**: 44
- **Testes**: 391 (100% passando)
- **Performance Score**: 90+

---

## 📞 Suporte

Para dúvidas, sugestões ou reportar bugs:

- **Issues**: Abra uma issue no GitHub
- **Discussões**: Use a aba Discussions no GitHub

---

**Desenvolvido com ❤️ usando Angular 22**

**Última Atualização**: Outubro 2026
