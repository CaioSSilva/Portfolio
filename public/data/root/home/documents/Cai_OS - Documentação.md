# Cai_OS — Documentação

**Versão:** 2.5.1 · **Plataforma:** Web (Angular 22) · **Autor:** Caio Souza Silva

---

## Índice

1. [O que é o Cai_OS?](#o-que-é-o-caios)
2. [Como iniciar](#como-iniciar)
3. [Arquitetura do sistema](#arquitetura-do-sistema)
4. [Aplicativos instalados](#aplicativos-instalados)
5. [Gerenciamento de janelas](#gerenciamento-de-janelas)
6. [Terminal](#terminal)
7. [Hermes — Assistente IA](#hermes--assistente-ia)
8. [Ações do Hermes](#ações-do-hermes)
9. [Sistema de arquivos virtual](#sistema-de-arquivos-virtual)
10. [Configurações](#configurações)
11. [Notificações e dicas](#notificações-e-dicas)
12. [Navegação mobile](#navegação-mobile)
13. [Modelos de dados](#modelos-de-dados)
14. [Serviços principais](#serviços-principais)
15. [Internacionalização (i18n)](#internacionalização-i18n)
16. [Variáveis de ambiente](#variáveis-de-ambiente)
17. [Informações técnicas](#informações-técnicas)

---

## O que é o Cai_OS?

O **Cai_OS** é um sistema operacional simulado que roda inteiramente no navegador. É um portfólio interativo construído como um ambiente de desktop inspirado no GNOME, usando Angular 22 com reatividade baseada em Signals.

Em vez de uma página de portfólio tradicional, o visitante interage com aplicativos reais em janelas, um terminal Unix-like, um sistema de arquivos virtual, um assistente de inteligência artificial (Hermes) e configurações completas do sistema — tudo dentro do browser.

**Destaques técnicos:**
- Aplicação Angular 22 standalone, sem roteamento — o OS é a aplicação
- Reatividade 100% baseada em Signals (`signal`, `computed`, `effect`)
- Gerenciamento completo de janelas: arrastar, redimensionar, snap, maximizar, minimizar, cascata
- Layout responsivo: desktop completo e layout mobile dedicado com gestos de toque
- Assistente Hermes alimentado por `@google/generative-ai`, capaz de controlar o sistema via tags de ação estruturadas
- Sistema de arquivos virtual carregado de um manifesto JSON estático (`/data/fs.json`)
- Letras sincronizadas para o player de música via API pública LRCLIB
- Deploy no Vercel com Analytics e Speed Insights integrados

---

## Como iniciar

Ao acessar o sistema pela primeira vez, você verá a **tela de boot** com uma barra de progresso simulada. Clique em "Pressione para Iniciar" quando ela aparecer. O som de inicialização será tocado e o sistema estará pronto.

Após o boot, o aplicativo **Sobre o projeto** abre automaticamente com informações do desenvolvedor.

---

## Arquitetura do sistema

```
┌─────────────────────────────────────────────────────────┐
│                     Navegador / Vercel                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Aplicação Angular (SPA)             │   │
│  │                                                  │   │
│  │  ┌─────────────┐  ┌──────────────────────────┐  │   │
│  │  │  Layout     │  │   UI Compartilhada        │  │   │
│  │  │  TopBar     │  │   Janela (por processo)   │  │   │
│  │  │  Dock       │  │   Boot / Shutdown         │  │   │
│  │  │  AppsGrid   │  │   Menu de Contexto        │  │   │
│  │  │  NavMobile  │  └──────────────────────────┘  │   │
│  │  └─────────────┘                                │   │
│  │                                                  │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │           Aplicativos (Features)           │  │   │
│  │  │  Arquivos  Terminal  Browser  Hermes       │  │   │
│  │  │  Fotos  Documentos  Ajustes  Monitor       │  │   │
│  │  │  Músicas  SobreOProjeto  ÍconesDesktop     │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  │                                                  │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │               Serviços Core                │  │   │
│  │  │  ProcessManager  WindowService  FileSystem │  │   │
│  │  │  Settings  Theme  Language  Notification   │  │   │
│  │  │  DockService  AppRegistry  AppLauncher     │  │   │
│  │  │  Gemini  HermesChat  HermesAction          │  │   │
│  │  │  AudioPlayer  LyricsService  Sound         │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  Assets estáticos: /data/fs.json  /sounds/*.ogg         │
│                    /wallpapers/   /videos/wallpapers/    │
└─────────────────────────────────────────────────────────┘
```

**Fluxo de dados:**

```
Interação do usuário
  → Componente (mutação de signal)
    → Serviço (atualização de signal / effect)
      → Outros serviços (derivação por computed)
        → Re-renderização do template (leitura de signal)
```

**Padrões de design:**
- **Service-per-concern**: cada domínio (processo, arquivo, áudio, IA) é um serviço isolado `providedIn: 'root'`
- **Signals em todo lugar**: `signal()`, `computed()`, `effect()` — sem assinaturas diretas em templates
- **Herança de classe base**: todos os aplicativos feature estendem `Base<T>`, que fornece `data` e `handle`
- **Modelo de processo**: cada janela aberta é um objeto `Process` gerenciado pelo `ProcessManager`; `WindowService` é fornecido por instância de janela
- **Pipeline de ações Hermes**: texto bruto da IA → parse regex `<!--caios:action {...} -->` → dispatch tipado → execução

---

## Aplicativos instalados

| ID | Nome | Ícone | Cor | Extensões suportadas | Lazy-load |
|---|---|---|---|---|---|
| `files` | Arquivos | `fas fa-folder` | `#3584e4` | — | Não |
| `firefox` | Firefox | `fab fa-firefox-browser` | `#ff7139` | — | Não |
| `terminal` | Terminal | `fas fa-terminal` | `#77767b` | — | Não |
| `settings` | Ajustes | `fas fa-cog` | `#FE6F5E` | — | Não |
| `about` | Sobre o projeto | `fas fa-user` | `#6f42c1` | — | Não |
| `photos` | Fotos | `fas fa-image` | `#4a90e2` | jpg, jpeg, png, svg, webp, gif | Não |
| `documents` | Documentos | `fas fa-file` | `#e01b24` | txt, log, md, json, ts, js, css, scss, pdf, text | **Sim** |
| `musics` | Músicas | `fas fa-music` | `#0077b6` | mp3, wav, ogg, m4a, flac | Não |
| `systemMonitor` | Monitor do sistema | `fas fa-chart-pie` | `#9AB973` | — | Não |
| `hermes` | Hermes | `fas fa-square-h` | `#00916E` | — | Não |

### Descrição de cada aplicativo

**Arquivos (`files`)**
Gerenciador de arquivos com sidebar recolhível, modos de visualização em grade e lista, barra de pesquisa e sidebar redimensionável (desktop). Ao clicar em um arquivo, o sistema detecta a extensão e abre o aplicativo correspondente automaticamente.

**Firefox (`firefox`)**
Navegador embutido com iframe. Suporta qualquer URL, histórico de navegação e botão de voltar. Algumas URLs não abrem por política de embedding (X-Frame-Options).

**Terminal (`terminal`)**
Emulador de terminal Unix-like com histórico de comandos (teclas ↑/↓), autocomplete por Tab, navegação no sistema de arquivos virtual e comandos embutidos. Veja a seção [Terminal](#terminal) para a lista completa.

**Ajustes (`settings`)**
Painel de configurações com seções: Aparência (tema, papel de parede), Desktop (dock, tamanho de ícones), Som, Idioma, Sistema (informações de hardware) e Hermes (modelo de IA).

**Sobre o projeto (`about`)**
Página de apresentação do projeto com galeria dos aplicativos, funcionalidades do sistema e download do currículo.

**Fotos (`photos`)**
Galeria de imagens com visualizador. Suporte a zoom (scroll / pinch), rotação, pan, navegação por teclado (← →), swipe horizontal no mobile.

**Documentos (`documents`)**
Visualizador de PDF, Markdown e texto simples. Suporte a zoom, scroll para âncoras em Markdown, navegação por teclado e swipe horizontal no mobile. Lazy-loaded para separar o bundle do `ng2-pdf-viewer`.

**Músicas (`musics`)**
Player de música com biblioteca, controles de reprodução, seek, volume, mudo e letras sincronizadas (LRC) via LRCLIB. A letra ativa rola automaticamente.

**Monitor do sistema (`systemMonitor`)**
Gráficos de CPU e RAM (simulados), estatísticas de rede (real ou simulado), lista de processos ativos com opção de encerrar.

**Hermes (`hermes`)**
Chat com IA usando Google Gemini. Suporta anexo de imagem, streaming de resposta, seletor de modelo e controle completo do sistema via tags de ação.

**Ícones do desktop (`desktop-icons`)**
Atalhos de aplicativos fixados diretamente no papel de parede do desktop. Clique com botão direito para adicionar/remover.

---

## Gerenciamento de janelas

### Desktop

Cada janela aberta corresponde a um `Process` gerenciado pelo `ProcessManager`. As janelas suportam:

- **Arrastar**: segure a barra de título e arraste
- **Redimensionar**: arraste o canto inferior direito (mínimo: 320×240 px)
- **Maximizar**: clique no botão de maximizar ou dê duplo clique na barra de título
- **Minimizar**: clique no botão de minimizar; a janela some e pode ser restaurada pelo Dock
- **Fechar**: clique no botão de fechar (X)
- **Snap**: arraste a janela até as bordas/cantos da tela para encaixar em metades ou quadrantes
  - Borda esquerda/direita → 50% da tela
  - Borda superior (centro) → tela cheia
  - Canto superior → quadrante 25% (canto superior)
  - Borda inferior → metade inferior da tela
- **Cascata**: novas janelas abrem com deslocamento automático para não se sobrepor

### App Switcher (desktop)

Pressione `Ctrl + \`` (backtick) para abrir o seletor de janelas. Pressione novamente para ciclar. Solte o `Ctrl` para confirmar.

### Mobile

No mobile, todas as janelas são automaticamente maximizadas em tela cheia. Drag e resize estão desabilitados.

---

## Terminal

O terminal emula um shell Unix navegando pelo sistema de arquivos virtual.

**Prompt:** `user@caios:pasta$`

### Comandos disponíveis

| Comando | Descrição |
|---|---|
| `help` | Exibe a lista de comandos |
| `ls` | Lista os arquivos e pastas do diretório atual |
| `cd <caminho>` | Muda o diretório de trabalho (suporta `.`, `..`, `/`, `~`, caminhos absolutos e relativos) |
| `open <arquivo>` | Abre um arquivo com o aplicativo correspondente |
| `date` | Exibe data e hora atuais (sensível ao idioma) |
| `theme` | Alterna entre os modos claro e escuro |
| `clear` | Limpa a tela do terminal |
| `about` | Exibe versão e informações do Cai_OS |
| `neofetch` | Exibe o logo ASCII com informações do sistema |
| `whoami` | Exibe informações sobre o desenvolvedor |

**Autocomplete:** pressione `Tab` para completar nomes de comandos e arquivos.

**Histórico:** use ↑ e ↓ para navegar pelos comandos anteriores.

---

## Hermes — Assistente IA

O Hermes é o assistente inteligente integrado ao Cai_OS, alimentado pelo Google Gemini. Ele responde usando formatação Markdown e pode controlar o sistema em tempo real.

**Funcionalidades:**
- Respostas em streaming (efeito de digitação ao vivo)
- Suporte a anexo de imagem
- Seletor de modelo Gemini (abra o Hermes e clique no ícone de engrenagem)
- Histórico de conversa (mantém as últimas 6 mensagens como contexto)
- Fallback automático para chave API secundária em caso de erro 404/429

**Como usar:**
1. Abra o aplicativo **Hermes** pelo dock ou pela grade de apps
2. Digite uma mensagem ou faça uma pergunta
3. Opcionalmente, anexe uma imagem clicando no ícone de clipe

---

## Ações do Hermes

O Hermes pode executar ações no sistema. Quando ele decide acionar uma ação, insere uma tag especial na resposta:

```
<!--caios:action {"type": "<ação>", "payload": { ... }} -->
```

Essa tag é invisível para você — o sistema a processa automaticamente. Você pode pedir ao Hermes para executar qualquer uma das ações abaixo:

| Ação | Payload | O que faz |
|---|---|---|
| `open_app` | `{"app": "terminal"\|"files"\|"firefox"\|"photos"\|"documents"\|"musics"\|"settings"\|"systemMonitor"\|"about"}` | Abre um aplicativo |
| `close_app` | `{"app": "<id_do_app>"}` | Fecha todas as instâncias de um app |
| `open_file` | `{"name": "arquivo.ext", "url": "/data/root/…"}` | Abre um arquivo com o handler correspondente |
| `set_theme` | `{"dark": true\|false}` | Define o modo escuro ou claro |
| `toggle_theme` | `{}` | Alterna o tema atual |
| `set_wallpaper` | `{"path": "/wallpapers/desktop/sunset.webp"\|"…/nebula.webp"\|"…/default.webp"}` | Muda o papel de parede |
| `set_dock_size` | `{"size": 32..64}` | Define o tamanho dos ícones do dock |
| `set_desktop_size` | `{"size": 32..56}` | Define o tamanho dos ícones do desktop |
| `toggle_sounds` | `{}` | Ativa/desativa sons do sistema |
| `play_sound` | `{"sound": "bell"\|"click"\|"startup"\|"office"}` | Toca um som do sistema |
| `show_notification` | `{"title": "…", "message": "…"}` | Exibe uma notificação |
| `toggle_notification_panel` | `{}` | Abre/fecha o painel de notificações |
| `set_language` | `{"lang": "pt"\|"en"}` | Muda o idioma do sistema |
| `toggle_auto_hide_dock` | `{}` | Ativa/desativa o auto-ocultamento do dock |
| `toggle_tips` | `{}` | Ativa/desativa as dicas do sistema |

**Exemplos de pedidos ao Hermes:**
- "Abra o terminal"
- "Mude para o modo escuro"
- "Troque o papel de parede para o pôr do sol"
- "Mostre uma notificação com a mensagem 'Olá!'"
- "Mude o idioma para inglês"

---

## Sistema de arquivos virtual

O sistema de arquivos é carregado de `/data/fs.json` na primeira vez que um aplicativo precisar dele. O arquivo descreve uma árvore hierárquica de pastas e arquivos (`FileItem`).

**Estrutura de um nó:**

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

**Extensões reconhecidas:**

| Tipo | Extensões |
|---|---|
| Imagens | jpg, jpeg, png, svg, webp, gif |
| Áudio | mp3, wav, ogg, m4a, flac |
| Documentos | txt, log, md, json, ts, js, css, scss, pdf, text |

Ao clicar em um arquivo no gerenciador de arquivos ou no terminal (comando `open`), o `ProcessManager` consulta o `AppRegistry` para encontrar o aplicativo que suporta a extensão e o abre automaticamente.

---

## Configurações

O aplicativo **Ajustes** possui as seguintes seções:

### Aparência
- **Esquema de cores**: Claro / Escuro
- **Papel de parede**: Selecione entre papéis de parede estáticos (`.webp`) ou animados (`.mp4`) para desktop; papel de parede separado para mobile

### Desktop
- **Auto-ocultar Dock**: oculta o dock automaticamente quando janelas estão sobre ele
- **Tamanho do ícone do Dock**: ajusta o tamanho dos ícones (padrão: 48)
- **Tamanho dos itens do desktop**: ajusta o tamanho dos ícones fixados no desktop (padrão: 40)

### Som
- **Sons do sistema**: ativa/desativa os sons de interação (mouse, boot, notificações)

### Idioma
- **Idioma & Região**: Português (Brasil) ou English (United States). A mudança é aplicada instantaneamente.

### Sistema
- **Dicas do sistema**: ativa/desativa as notificações de dicas

### Hermes
- **Modelo de IA**: seleciona qual modelo Gemini o Hermes utilizará. Clique em "Tentar novamente" se os modelos não carregarem (verifique a chave de API).

**Persistência:** todas as configurações são salvas no `localStorage` do navegador e restauradas automaticamente no próximo acesso.

---

## Notificações e dicas

### Centro de Notificações

Clique no ícone de sino na barra superior (ou faça swipe down no mobile) para abrir o painel de notificações. O painel exibe:
- Notificações ativas (auto-descartadas após ~6 segundos por padrão)
- Histórico completo de notificações da sessão
- Widget do player de música (se uma música estiver tocando)

### Dicas do Sistema

O sistema exibe dicas periódicas como notificações:
- Primeira dica: 15 segundos após o boot
- Dicas subsequentes: a cada 7–10 minutos
- Pools separados para desktop e mobile (sem repetição até esgotar o ciclo)
- Podem ser desativadas em Ajustes → Sistema

---

## Navegação mobile

Em dispositivos com tela menor que 768 px, o Cai_OS usa um layout mobile dedicado:

### Barra de navegação inferior

| Botão | Ação |
|---|---|
| Ícone quadrado | Abre/fecha a tela de Overview (apps recentes) |
| Pílula central | Home — minimiza todos os processos e fecha os drawers |
| Ícone de grade | Abre/fecha o App Drawer |

### Overview (apps recentes)

- **Swipe para cima** em um card → fecha o processo com animação
- **Toque** em um card → retoma o app e fecha o overview
- **Botão de fechar** individual por card
- **Fechar tudo** → encerra todos os processos

### Gestos nos aplicativos

| App | Gesto | Ação |
|---|---|---|
| Fotos | Swipe horizontal | Navegar entre imagens |
| Fotos | Pinch | Zoom |
| Documentos | Swipe horizontal | Navegar entre documentos |
| Documentos | Pinch | Zoom |
| TopBar | Swipe down | Abre o painel de notificações |
| Dock | Long-press (500 ms) | Abre menu de contexto do app |

---

## Modelos de dados

Interfaces TypeScript copiadas literalmente do código-fonte:

```typescript
// Dados de um processo aberto
interface Process extends AppBase {
  id: string;
  appId: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  cascadeIndex: number;
  data?: ProcessData;
}

// Definição de um aplicativo instalado
interface AppDefinition extends AppBase {
  data?: ProcessData;
  handle?: string[];                              // extensões de arquivo suportadas
  loadComponent?: () => Promise<Type<Base>>;      // lazy loading
}

// Item da dock (app + estado de execução)
interface DockItem extends AppDefinition {
  pinned: boolean;
  isOpen: boolean;
  isActive: boolean;
  count: number;
  pids: string[];
}

// Nó do sistema de arquivos virtual
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

// Notificação
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

// Estado do player de música
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

// Mensagem do Hermes
interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
}

// Ação do Hermes
interface HermesAction {
  type: HermesActionType;
  payload?: Record<string, JsonValue>;
}

// Documento carregado
interface LoadedDoc {
  fileType: 'pdf' | 'text' | 'markdown' | 'unsupported';
  fileName: string;
  textContent: string;
}
```

---

## Serviços principais

| Serviço | Responsabilidade |
|---|---|
| `ProcessManager` | Ciclo de vida de janelas/processos (abrir, fechar, focar, minimizar) |
| `WindowService` | Drag, resize, snap por instância de janela (fornecido localmente) |
| `ScreenService` | Largura/altura do viewport, sinais `isMobile` e `isDesktop` |
| `AppRegistry` | Catálogo reativo de apps, busca por ID e extensão de arquivo |
| `AppLauncher` | Orquestração de abertura de aplicativos |
| `DockService` | Itens da dock, pin/unpin, persistência em `localStorage` |
| `FileSystem` | Sistema de arquivos virtual (HTTP → JSON → maps de nodes) |
| `Settings` | Preferências persistidas (wallpaper, dockSize, geminiModel, …) |
| `Theme` | Modo escuro/claro, sincroniza com `prefers-color-scheme` |
| `LanguageService` | Troca de idioma (pt/en), persistência em `localStorage` |
| `NotificationService` | Fila de notificações ativas e histórico |
| `Sound` | Player de sons via `AudioContext`, cache de buffers |
| `Gemini` | Wrapper da API Google Generative AI com fallback de chave |
| `HermesChatService` | Estado do chat, histórico, envio com streaming |
| `HermesActionService` | Parse e dispatch de tags `<!--caios:action -->` |
| `AudioPlayer` | Wrapper do `<audio>` HTML com seek, playlist e estado |
| `LyricsService` | Busca de letras no LRCLIB, parse LRC, linha ativa |
| `TerminalCommands` | Implementação dos comandos do terminal |
| `DesktopIconsService` | Atalhos fixados no desktop, persistência em `localStorage` |
| `DocumentLoaderService` | Carregamento e detecção de tipo de documentos |
| `SystemTips` | Agendamento de dicas periódicas |

---

## Internacionalização (i18n)

**Idiomas suportados:** Português (`pt`) e Inglês (`en`).

O idioma ativo é determinado na ordem:
1. Chave `lang` no `localStorage`
2. Prefixo do `navigator.language` (`pt` ou `en`)
3. Padrão: `pt`

Para mudar o idioma: Ajustes → Idioma, ou peça ao Hermes: *"Mude o idioma para inglês"*.

O `LanguageService` expõe `currentLang` (signal) e `t` (computed com todas as traduções). Toda string visível ao usuário vem de `lang.t().secao.chave`.

---

## Variáveis de ambiente

As variáveis de ambiente são lidas de `src/.env` pelo script `mynode.js` e escritas em `src/environments/environment.ts` (git-ignorado).

| Variável | Tipo | Uso |
|---|---|---|
| `geminiApiKey` | `string` | Chave primária da API Google Generative AI (usada pelo Hermes) |
| `geminiApiKey2` | `string` | Chave de fallback — usada quando a primária retorna 404 ou 429 |

---

## Informações técnicas

### Stack

| Tecnologia | Versão |
|---|---|
| Angular | 22.2.1 |
| TypeScript | 6.0.3 |
| Tailwind CSS | 4.1.18 |
| `@google/generative-ai` | 0.24.1 |
| `ng2-pdf-viewer` | 10.4.0 |
| Vitest | 4.0.18 |
| Node.js (build) | ≥ 20 |

### Scripts npm

| Script | Descrição |
|---|---|
| `npm start` | Gera `environment.ts` e inicia o servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm test` | Executa a suíte de testes (Vitest) |
| `npm run watch` | Build incremental de desenvolvimento |

### Persistência no localStorage

| Chave | Valor padrão | Descrição |
|---|---|---|
| `lang` | `pt` | Idioma atual |
| `theme` | — (sistema) | `dark` ou `light` |
| `wallpaper` | `/wallpapers/desktop/default.webp` | Papel de parede desktop |
| `mobileWallpaper` | `/wallpapers/mobile/default.webp` | Papel de parede mobile |
| `dockSize` | `48` | Tamanho dos ícones do dock |
| `desktopSize` | `40` | Tamanho dos ícones do desktop |
| `soundMuted` | `false` | Sons do sistema mutados |
| `autoHideDock` | `true` | Auto-ocultar dock |
| `tipsEnabled` | `true` | Dicas do sistema ativas |
| `geminiModel` | `gemini-flash-lite-latest` | Modelo Gemini selecionado |
| `pinnedAppIds` | `['firefox','files','terminal']` | Apps fixados no dock |
| `desktopIcons` | `[]` | Apps fixados no desktop |

---

## Contato

**Caio Souza Silva**
- Portfolio: [caiossilva.com](https://caiossilva.com)
- GitHub: [github.com/CaioSSilva](https://github.com/CaioSSilva)
- Email: caiosouzasilva13650@gmail.com
