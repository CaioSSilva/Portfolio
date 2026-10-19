# Cai_OS

[🇧🇷 Português (Brasil)](https://github.com/CaioSSilva/Portfolio/blob/main/README.pt-BR.md) | [🇺🇸 English](https://github.com/CaioSSilva/Portfolio/blob/main/README.md)

![Versão](https://img.shields.io/badge/version-3.3.0-blue)
![Angular](https://img.shields.io/badge/Angular-22-red)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue)
![Vitest](https://img.shields.io/badge/tests-Vitest-brightgreen)
![Deploy](https://img.shields.io/badge/deploy-Vercel-black)

**Versão:** 3.3.0 · **Plataforma:** Web (Angular 22) · **Autor:** Caio Souza Silva

---

> **Demonstração:** [https://caiossilva.com](https://caiossilva.com)

## Destaques da versão 3.3.0

- **Snap de janelas configurável**: layouts Clássico, Metades ou Terços, sensibilidade das bordas ajustável, pré-visualização ao arrastar e recálculo responsivo
- **Seleção de janela adjacente no estilo Pop!_OS**: escolha uma janela aberta para preencher a metade oposta; janelas minimizadas podem ser selecionadas e restauradas
- **Atalhos de teclado consistentes**: `Alt` + setas para laterais e zonas inferiores, `Alt` + `Shift` + esquerda/direita para cantos superiores, `Alt` + `Ctrl` + esquerda/direita para cantos inferiores no modo Clássico e `Alt` + `↑` para maximizar/restaurar
- **Controles de snap exclusivos para desktop**: configurações e atalhos ficam ocultos no mobile, onde as janelas permanecem em tela cheia
- **Controles de interface compartilhados**: dropdown acessível e seletor dedicado de janela adjacente
- **Testes**: 861 testes aprovados em 69 arquivos (`ng test`)

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
- **Modo Agente** — ativação por voz com palavra-chave ("Oi Hermes" / "Hello Hermes"), via Web Speech API
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
│  │  ┌─────────────┐  ┌──────────────────────────┐   │   │
│  │  │  Layout     │  │   UI Compartilhada       │   │   │
│  │  │  TopBar     │  │   Janela (por processo)  │   │   │
│  │  │  Dock       │  │   Boot / Shutdown        │   │   │
│  │  │  AppsGrid   │  │   Menu de Contexto       │   │   │
│  │  │  NavMobile  │  │   Avisos / Alternador    │   │   │
│  │  └─────────────┘  │   Mobile / Snap          │   │   │
│  │                   │   Widgets de música      │   │   │
│  │                   └──────────────────────────┘   │   │
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
│  │  │  ProcessManager  WindowService  WindowSnap │  │   │
│  │  │  Screen  FileSystem  DocumentLoader        │  │   │
│  │  │  Apps  AppRegistry  AppLauncher Dock       │  │   │
│  │  │  ContextMenu  MobileNav  DesktopIcons      │  │   │
│  │  │  Settings  Theme  Language  Notifications  │  │   │
│  │  │  SystemInfo  SystemTips                    │  │   │
│  │  │  Gemini  HermesChat  HermesAction          │  │   │
│  │  │  HermesApp/Info/Media/SystemActions        │  │   │
│  │  │  AgentMode  SpeechRecognition  WakeWord    │  │   │
│  │  │  SpeechSynthesis  AudioPlayer  Lyrics Sound│  │   │
│  │  │  TerminalCommands  Autocomplete  History   │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  Integrações: Gemini API / LRCLIB                       │
│  Métricas: Vercel Analytics / Speed Insights            │
│  APIs do navegador: Web Speech / localStorage           │
│  Assets: /data/fs.json /sounds/*.ogg                    │
│          /wallpapers/ /videos/wallpapers/               │
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
Emulador de terminal Unix-like com histórico de comandos (teclas ↑/↓), autocomplete por Tab, navegação no sistema de arquivos virtual, comandos embutidos e modo para toque (chips de sugestão, barra de teclas, painel de histórico e saída do `ls` clicável). Veja a seção [Terminal](#terminal) para a lista completa.

**Ajustes (`settings`)**
Painel de configurações com seções: Aparência (tema, papel de parede), Desktop (dock, tamanho de ícones), Som, Idioma e Sistema (informações de hardware).

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
- **Snap**: arraste a janela até as bordas para usar o layout Clássico, Metades ou Terços selecionado
  - Clássico: metades esquerda/direita, quadrantes nos cantos superiores/inferiores, metade inferior e maximizar
  - Metades: metades esquerda/direita, metade inferior e maximizar
  - Terços: terços esquerdo/central/direito e maximizar
  - A sensibilidade das bordas é configurável em Configurações → Desktop
- **Encaixe de janelas adjacentes**: nos layouts Clássico ou Metades, escolha opcionalmente uma janela aberta para preencher a metade oposta. Janelas minimizadas podem ser escolhidas e são restauradas ao selecionar.
- **Atalhos**: `Alt` + `←` / `→` encaixa nas laterais; `Alt` + `↑` maximiza/restaura; `Alt` + `↓` encaixa na zona inferior e alterna de volta ao tamanho anterior. No Clássico, `Alt` + `Shift` + `←` / `→` encaixa nos cantos superiores e `Alt` + `Ctrl` + `←` / `→` nos inferiores.
- **Cascata**: novas janelas abrem com deslocamento automático para não se sobrepor

### App Switcher (desktop)

Pressione `Ctrl + \`` (backtick) para abrir o seletor de janelas. Pressione novamente para ciclar. Solte o `Ctrl` para confirmar.

### Mobile

No mobile, todas as janelas são automaticamente maximizadas em tela cheia. Arrastar, redimensionar, layouts de snap, configurações de snap e atalhos ficam desabilitados.

---

## Terminal

O terminal emula um shell Unix navegando pelo sistema de arquivos virtual.

**Prompt:** `user@caios:~$` na pasta inicial, `user@caios:~/Fotos$` dentro de uma pasta (os nomes das pastas seguem o idioma ativo)

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

**Nomes localizados:** pastas e arquivos aparecem no idioma ativo (ex.: `Fotos` em PT, `Photos` em EN) no prompt, no `ls` e no autocomplete. `cd` e `open` aceitam tanto o nome traduzido quanto o original.

### Dispositivos de toque

- **Chips de sugestão:** ao digitar, chips acima do input completam comandos e caminhos.
- **Barra de teclas:** com o input focado e sem sugestões, uma barra oferece `Tab`, `↑`, `↓`, `Ctrl+C`, `/`, `~` e `-`.
- **Painel de histórico:** o botão `↕` abre um painel com os comandos anteriores; tocar em um deles o executa.
- **`ls` clicável:** pastas executam `cd` e arquivos executam `open` ao serem tocados.
- **Teclado:** `open` fecha o teclado virtual para que o app aberto fique visível.

---

## Hermes — Assistente IA

O Hermes é o assistente inteligente integrado ao Cai_OS, alimentado pelo Google Gemini. Ele responde usando formatação Markdown e pode controlar o sistema em tempo real.

**Funcionalidades:**
- Respostas em streaming (efeito de digitação ao vivo)
- Suporte a anexo de imagem
- Seletor de modelo Gemini (clique no nome do modelo exibido acima do campo de texto para abrir o seletor)
- Histórico de conversa (mantém as últimas 6 mensagens como contexto)
- Fallback automático para chave API secundária em caso de erro 404/429
- **Modo Agente** — ativação por voz com palavra-chave (veja abaixo)

**Como usar:**
1. Abra o aplicativo **Hermes** pelo dock ou pela grade de apps
2. Digite uma mensagem ou faça uma pergunta
3. Opcionalmente, anexe uma imagem clicando no ícone de imagem à esquerda do campo de texto

### Modo Agente

O Modo Agente permite que o Hermes escute passivamente e seja ativado por voz a qualquer momento — sem precisar abrir a janela do Hermes.

**Como ativar:**
Ajustes → Hermes → Ativar Modo Agente (requer permissão de microfone).

**Frases de ativação:** "Oi Hermes", "Hello Hermes", "Hey Hermes"

**Comandos inline:** diga a frase de ativação seguida do comando, ex.: *"Oi Hermes, abre o terminal"* — sem precisar aguardar uma segunda fala.

**Respostas em voz (opt-in):** ative Ajustes → Hermes → Respostas em voz para que o Hermes leia suas respostas em voz alta.

**Desativar:** diga *"para de ouvir"* ou *"stop listening"* a qualquer momento, ou clique no ícone de microfone na barra superior.

**Ícone na barra superior (direita):**

| Estado | Ícone | Visual |
|---|---|---|
| Ouvindo | Microfone | Fundo azul discreto |
| Acordado (aguardando comando) | Microfone | Azul sólido, pulsando |
| Processando | Círculo girando | Azul sólido |
| Falando | Alto-falante | Azul sólido |

Clicar no ícone desativa o Modo Agente.

**Privacidade:** o Modo Agente usa a Web Speech API do navegador. No Chrome, o áudio é enviado para os servidores do Google — e não apenas o áudio após a palavra-chave. Ative somente em redes confiáveis. A funcionalidade é opt-in e desativada por padrão.

**Suporte:** Chrome/Chromium no desktop (completo). Firefox (não suportado). Dispositivos móveis (não suportado — o reconhecimento contínuo é instável no mobile; o botão é desativado automaticamente com uma mensagem clara).

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
| `close_all_apps` | `{}` | Fecha todas as janelas e aplicativos abertos |
| `focus_app` | `{"app": "<id_do_app>"}` | Traz o aplicativo em execução para o primeiro plano |
| `minimize_all` | `{}` | Minimiza todas as janelas abertas exibindo a área de trabalho |
| `open_file` | `{"name": "arquivo.ext", "url": "/data/root/…"}` | Abre um arquivo com o handler correspondente |
| `browser_open_url` | `{"url": "https://…"}` | Abre o navegador Firefox no endereço especificado |
| `browser_search` | `{"query": "termo de busca"}` | Realiza uma pesquisa no Google pelo navegador |
| `set_theme` | `{"dark": true\|false}` | Define o modo escuro ou claro |
| `toggle_theme` | `{}` | Alterna o tema atual |
| `set_wallpaper` | `{"path": "/wallpapers/desktop/sunset.webp"\|"…/nebula.webp"\|"…/default.webp"}` | Muda o papel de parede |
| `set_dock_size` | `{"size": 28..64}` | Define o tamanho dos ícones do dock |
| `set_desktop_size` | `{"size": 32..80}` | Define o tamanho dos ícones do desktop |
| `toggle_sounds` | `{}` | Ativa/desativa sons do sistema |
| `play_sound` | `{"sound": "bell"\|"click"\|"startup"\|"office"}` | Toca um som do sistema |
| `show_notification` | `{"title": "…", "message": "…"}` | Exibe uma notificação |
| `toggle_notification_panel` | `{}` | Abre/fecha o painel de notificações |
| `clear_notifications` | `{}` | Limpa o histórico de notificações |
| `set_language` | `{"lang": "pt"\|"en"}` | Muda o idioma do sistema |
| `toggle_auto_hide_dock` | `{}` | Ativa/desativa o auto-ocultamento do dock |
| `toggle_tips` | `{}` | Ativa/desativa as dicas do sistema |
| `show_system_tip` | `{}` | Dispara a exibição de uma dica do sistema |
| `toggle_agent_mode` | `{}` | Ativa/desativa o Modo Agente |
| `toggle_voice_feedback` | `{}` | Ativa/desativa respostas em voz do Hermes |
| `music_play_pause` | `{}` | Pausar/retomar a música atual |
| `music_next` | `{}` | Próxima faixa |
| `music_prev` | `{}` | Faixa anterior |
| `music_stop` | `{}` | Parar a reprodução |
| `music_play_track` | `{"query": "nome da música ou artista"}` | Buscar e tocar uma faixa pelo nome |
| `music_set_volume` | `{"volume": 0..100}` | Ajusta o volume da música |
| `music_toggle_mute` | `{}` | Muta ou desmuta o reprodutor musical |
| `music_seek` | `{"time": 30}` | Avança ou move para o segundo especificado da faixa |
| `photos_open_photo` | `{"query": "nome da foto"}` | Buscar e abrir uma foto pelo nome |
| `docs_open_document` | `{"query": "nome do documento"}` | Buscar e abrir um documento pelo nome |

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
- **Tamanho do ícone do Dock**: ajusta o tamanho dos ícones (padrão: 48, intervalo 28–64)
- **Tamanho dos itens do desktop**: ajusta o tamanho dos ícones fixados no desktop (padrão: 40, intervalo 32–80)
- **Layout de snap**: selecione Clássico, Metades ou Terços e ajuste a distância de ativação das bordas (16–64 px)
- **Encaixar janela adjacente**: nos layouts Clássico e Metades, escolha uma janela para preencher a metade oposta; janelas minimizadas são restauradas ao selecionar
- Os controles e a ajuda dos atalhos de snap aparecem apenas no desktop

### Som
- **Sons do sistema**: ativa/desativa os sons de interação (mouse, boot, notificações)

### Idioma
- **Idioma & Região**: Português (Brasil) ou English (United States). A mudança é aplicada instantaneamente.

### Hermes
- **Modelo de IA**: selecione o modelo Gemini que o Hermes utiliza
- **Modo Agente**: ativa ativação por voz (requer permissão de microfone)
- **Respostas em voz**: o Hermes lê suas respostas em voz alta (opt-in)
- **Frases de ativação**: "Oi Hermes", "Hello Hermes", "Hey Hermes"

### Sistema
- **Dicas do sistema**: ativa/desativa as notificações de dicas

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
| `WindowService` | Arrastar, redimensionar e aplicar layouts de snap por janela (fornecido localmente) |
| `WindowSnapService` | Calcular zonas de snap e resolver atalhos do teclado |
| `ScreenService` | Largura/altura do viewport, sinais `isMobile`, `isDesktop` e `hasCoarsePointer` |
| `Apps` | Estado da grade de aplicativos, pesquisa e abertura via launcher |
| `AppRegistry` | Catálogo reativo de apps, busca por ID e extensão de arquivo |
| `AppLauncher` | Orquestração de abertura de aplicativos |
| `DockService` | Itens da dock, pin/unpin, persistência em `localStorage` |
| `MobileNavService` | Navegação e estado da barra de navegação mobile |
| `ContextMenuService` | Abertura, posicionamento e fechamento do menu de contexto |
| `FileSystem` | Sistema de arquivos virtual (HTTP → JSON → maps de nodes) |
| `Settings` | Preferências persistidas (wallpaper, dockSize, geminiModel, …) |
| `Theme` | Modo escuro/claro, sincroniza com `prefers-color-scheme` |
| `LanguageService` | Troca de idioma (pt/en), persistência em `localStorage` |
| `NotificationService` | Fila de notificações ativas e histórico |
| `Sound` | Player de sons via `AudioContext`, cache de buffers |
| `Gemini` | Wrapper da API Google Generative AI com fallback de chave |
| `HermesChatService` | Estado do chat, histórico, envio com streaming |
| `HermesActionService` | Parse e dispatch de tags `<!--caios:action -->` |
| `HermesAppActionsService` | Ações do Hermes para abrir e controlar aplicativos |
| `HermesInfoActionsService` | Ações do Hermes para consultar informações do sistema |
| `HermesMediaActionsService` | Ações do Hermes para controlar reprodução de mídia |
| `HermesSystemActionsService` | Ações do Hermes para alterar configurações do sistema |
| `AgentModeService` | Máquina de estados do Modo Agente: ouvindo → acordado → processando → falando |
| `SpeechRecognitionService` | Wrapper da Web Speech API com reinício automático e backoff |
| `SpeechSynthesisService` | Wrapper de TTS do navegador com remoção de Markdown |
| `WakeWordService` | Detecção de palavra-chave com correspondência fuzzy (Levenshtein ≤ 1) |
| `AudioPlayer` | Wrapper do `<audio>` HTML com seek, playlist e estado |
| `LyricsService` | Busca de letras no LRCLIB, parse LRC, linha ativa |
| `TerminalCommands` | Implementação dos comandos do terminal |
| `TerminalAutocomplete` | Sugestões localizadas de comandos e caminhos para o terminal |
| `TerminalHistoryService` | Navegação no histórico de comandos por terminal (provider no componente) |
| `DesktopIconsService` | Atalhos fixados no desktop, persistência em `localStorage` |
| `DocumentLoaderService` | Carregamento e detecção de tipo de documentos |
| `SystemInfoService` | Coleta de informações de hardware e ambiente do navegador |
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
| Executor de testes | Unit-test builder do Angular (`ng test`), Vitest `^4.0.18` |
| Node.js (build) | ≥ 20 |

### Estrutura do projeto

```text
src/app/
├── core/       # Modelos, serviços, idiomas, pipes e utilitários
├── layout/     # Barra superior, dock, navegação mobile e janelas
├── shared/ui/  # Componentes compartilhados da interface
└── features/   # Aplicativos: arquivos, terminal, Hermes, fotos, etc.
public/
├── data/       # Manifesto do sistema de arquivos e arquivos públicos
├── sounds/     # Sons do sistema
├── wallpapers/ # Papéis de parede estáticos
└── videos/    # Papéis de parede animados
```

### Componentes principais

- **Layout:** TopBar, Dock, AppsGrid, MobileNavBar, MobileOverview, NotificationCenter, WindowSwitcher, MusicWidget e NowPlayingWidget.
- **Interface compartilhada:** Window, Boot, Shutdown e ContextMenu.
- **Aplicativos:** AboutProject, Browser, Terminal, Files, ImageViewer, DocumentViewer, Musics, Settings, SystemMonitor, Hermes e DesktopIcons.

### Scripts npm

| Script | Descrição |
|---|---|
| `npm start` | Gera `environment.ts` e inicia o servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm test` | Executa `ng test` pelo unit-test builder do Angular |
| `npm run watch` | Build incremental de desenvolvimento |

**Última validação:** 861 testes passaram em 69 arquivos de teste.

### Instalação e execução local

Pré-requisitos: Node.js ≥ 20, npm ≥ 11.7.0 e Angular CLI 22 (`npm install -g @angular/cli@22`).

```bash
git clone https://github.com/CaioSSilva/portfolio.git
cd portfolio
npm install
```

Crie `src/.env` com sua chave da API do Google Gemini:

```dotenv
geminiApiKey=SUA_CHAVE_GOOGLE_AI
geminiApiKey2=SUA_CHAVE_RESERVA
```

A chave de reserva é opcional. Inicie o servidor com `npm start` e abra `http://localhost:4200`. Esse comando gera os arquivos de ambiente antes de iniciar o servidor; não use `ng serve` diretamente.

### Personalização

- **Novo aplicativo:** crie um componente em `src/app/features/`, registre-o em `getInstalledApps()` e adicione as chaves de tradução em `en.ts` e `pt.ts`.
- **Papéis de parede:** adicione imagens em `public/wallpapers/desktop/` ou `public/wallpapers/mobile/`; vídeos vão em `public/videos/wallpapers/desktop/`. Registre os caminhos nas listas em `src/app/features/settings/settings.ts`.
- **Sons:** adicione arquivos `.ogg` em `public/sounds/`.
- **Traduções:** atualize `src/app/core/language/pt.ts` e `en.ts`.
- **Sistema de arquivos virtual:** edite `public/data/fs.json`; os arquivos referenciados devem existir em `public/`.

### Solução de problemas

| Problema | Solução |
|---|---|
| `src/environments/environment.ts` não encontrado | Execute `npm start`, que gera o arquivo por meio do `mynode.js` |
| Hermes não responde | Verifique `geminiApiKey` em `src/.env` e o console do navegador |
| Erro de modelo do Hermes | Selecione outro modelo no aplicativo Hermes ou remova a chave `geminiModel` do `localStorage` |
| Modo Agente indisponível | Use Chrome/Chromium em uma origem HTTPS e conceda permissão de microfone |
| Sistema de arquivos não carrega | Confira se `public/data/fs.json` existe e contém JSON válido |
| Sons não tocam | Interaja com a página para liberar o `AudioContext` do navegador |
| Vídeos não reproduzem como papel de parede | Alguns navegadores bloqueiam reprodução automática; tente uma imagem estática |

### Contribuição

Convenção de branches: `main` para produção, `feat/descricao` para funcionalidades e `fix/descricao` para correções.

Antes de abrir um pull request, confirme que não há logs de depuração, que efeitos e signals têm o ciclo de vida apropriado, que novas traduções existem em `en.ts` e `pt.ts`, e que `npm test` e `npm run build` passam.

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
| `agentModeEnabled` | `false` | Modo Agente ativo |
| `agentSpeakReplies` | `false` | Respostas em voz ativas |
| `pinnedAppIds` | `['firefox','files','terminal']` | Apps fixados no dock |
| `desktopIcons` | `[]` | Apps fixados no desktop |

---

## Contato

**Caio Souza Silva**
- Portfolio: [caiossilva.com](https://caiossilva.com)
- GitHub: [github.com/CaioSSilva](https://github.com/CaioSSilva)
- Email: caiosouzasilva13650@gmail.com

---

## Licença

Este projeto é público e toda colaboração é bem-vinda. Fique à vontade para abrir uma issue ou enviar um pull request.

## Estatísticas do projeto

| Métrica | Valor |
|---|---|
| Versão | 3.3.0 |
| Angular | 22.2.1 |
| TypeScript | 6.0.3 |
| Aplicativos | 10 |
| Componentes de layout | 9 |
| Componentes de UI compartilhados | 4 |
| Serviços core | 32 |
| Idiomas | 2 (PT, EN) |
| Plataformas | Desktop, mobile |
| Testes | Vitest via Angular CLI |
| Deploy | Vercel |
