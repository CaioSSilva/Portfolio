export const pt = {
  common: {
    clearAll: 'Limpar Tudo',
    notifications: 'Notificações',
    noNotifications: 'Nenhuma Notificação',
    settings: 'Configurações',
    search: 'Pesquisar...',
    download: 'Baixar',
    openFiles: 'Abrir arquivos',
    openApp: 'Abrir aplicativo',
    newInstance: 'Nova instância',
    closeApp: 'Fechar aplicativo',
    removeFromDock: 'Remover da dock',
  },

  window: {
    close: 'Fechar',
    maximize: 'Maximizar',
    minimize: 'Minimizar',
    restore: 'Restaurar',
  },

  boot: {
    poweredBy: 'Construido com',
    systemKernel: 'Kernel do Sistema',
    pressToStart: 'Pressione para Iniciar',
    mobileAlert: {
      title: 'Dispositivo não suportado',
      description:
        'O Cai_OS foi projetado para telas maiores. Clique no botão abaixo para acessar uma versão compatível com seu dispositivo.',
      action: 'OK',
    },
  },

  apps: {
    files: 'Arquivos',
    about: 'Sobre o projeto',
    terminal: 'Terminal',
    settings: 'Ajustes',
    firefox: 'Firefox',
    photos: 'Fotos',
    documents: 'Documentos',
    musics: 'Musicas',
  },

  notifications: {
    title: 'Notificações',
    clearAll: 'Limpar tudo',
    noNotifications: 'Nenhuma notificação',

    timmings: {
      justNow: 'Agora mesmo',
      minutesAgo: 'minutos atrás',
      hoursAgo: 'horas atrás',
      daysAgo: 'dias atrás',
    },
  },

  aboutProj: {
    title: 'Porque Cai_OS?',
    intro:
      'O Cai_OS foi desenvolvido para mostrar ao mundo como eu enxergo uma experiência de sistema operacional. Para mim, um SO não é apenas uma ferramenta, mas uma extensão da nossa criatividade. Este projeto reflete como minha jornada como desenvolvedor me permite transformar conceitos abstratos em interfaces funcionais e fluidas.',
    quote:
      'Podemos descobrir muito sobre uma pessoa observando como ela interage com seu computador.',
    features: 'Funcionalidades do sistema',
    applications: 'Aplicativos',
    featureList: {
      snaps: {
        tag: 'Workspace',
        title: 'Snaps',
        description:
          'Gerenciamento inteligente de janelas. Ao arrastar uma aplicação para as bordas ou cantos da tela, o sistema sugere e ajusta automaticamente o redimensionamento, permitindo organizar seu fluxo de trabalho em frações perfeitas de 50% ou 25% da tela.',
      },
      appSwitcher: {
        tag: 'Multitasking',
        title: 'App Switcher',
        desc_part1: 'Navegação rápida entre processos. Utilizando o atalho',
        desc_part2:
          'você acessa uma interface de troca rápida que sobrepõe o sistema, permitindo alternar o foco entre janelas ativas com agilidade e fluidez.',
      },
      notifications: {
        tag: 'Sistema',
        title: 'Notificações',
        description:
          'Mantenha-se informado sem perder o foco. O sistema central de notificações organiza alertas de aplicativos e eventos do kernel em um centro dedicado, oferecendo feedback visual imediato e histórico de interações recentes.',
      },
      contextMenu: {
        tag: 'Eficiência',
        title: 'Menu de Contexto',
        description:
          'Ações rápidas ao seu alcance. Acesse controles essenciais de aplicativos, como fixar na barra de tarefas, abrir novas instâncias ou encerrar processos diretamente através de uma interface de clique direito otimizada para agilidade.',
      },
      dockDrag: {
        tag: 'Interface',
        title: 'Arrastar e soltar',
        description:
          'Personalize sua barra de tarefas com total liberdade. Arraste novos aplicativos diretamente do menu para a Dock para fixá-los. O sistema calcula a posição em tempo real, abrindo espaço visualmente para uma organização intuitiva e fluida.',
      },
    },
    apps: {
      files: {
        name: 'Arquivos',
        desc: 'Onde guardo meus resultados: feedbacks, certificações e memórias.',
      },
      terminal: {
        name: 'Terminal',
        desc: 'O coração do sistema. Interaja diretamente com o kernel e descubra segredos.',
      },
      settings: {
        name: 'Ajustes',
        desc: 'A prova de que a estética é pessoal. Adapte o sistema do seu jeito.',
      },
      browser: {
        name: 'Firefox',
        desc: 'Onde a web ganha vida e as ideias se conectam. Navegação fluida para explorar referências e o mundo.',
      },
      photos: {
        name: 'Fotos',
        desc: 'Registros de trajetória e momentos. Galeria de feedbacks técnicos e memórias com meu melhor amigo.',
      },
      music: {
        name: 'Músicas',
        desc: 'Sincronia entre ritmo e produtividade. Onde a lógica encontra sua frequência.',
      },
      docs: {
        name: 'Documentos',
        desc: 'Arquitetura de informação e base técnica. Onde as ideias tomam forma escrita.',
      },
    },
  },

  settings: {
    title: 'Ajustes',

    appearance: {
      title: 'Aparência',
      colorScheme: 'Esquema de Cores',
      light: 'Claro',
      dark: 'Escuro',
      wallpaper: 'Papel de Parede',
    },

    desktop: {
      title: 'Desktop',
      autoHideDock: 'Ocultar Dock automaticamente',
      autoHideDockDesc: 'Esconde a dock quando janelas estiverem sobre ela',
      iconSize: 'Tamanho dos ícones',
      iconSizeDesc: 'Ajusta a dimensão da dock e seus elementos',
    },

    sound: {
      title: 'Som',
      systemSounds: 'Sons do Sistema',
      systemSoundsDesc: 'Ativa ou desativa os sons de interação',
    },

    system: {
      title: 'Sistema',
      systemTips: 'Dicas de sistema',
      systemTipsDesc: 'Ativa ou desativa as notificações com dicas do sistema',
    },

    language: {
      title: 'Idioma',
      languageRegion: 'Linguagem e Região',
      portuguese: 'Português',
      brazil: 'Brasil',
      english: 'Inglês',
      unitedStates: 'Estados Unidos',
      languageChangeNote:
        'As alterações de idioma são aplicadas instantaneamente em todo o sistema.',
    },

    about: {
      title: 'Sobre o sistema',
      systemName: 'Nome do Sistema',
      interface: 'Interface',
      virtualEngine: 'Virtual Web Engine',
      vweUI: 'VWE UI',
      version: 'Versão',
      description:
        'Um sistema operacional web construído com Angular 21, inspirado na elegância do GNOME Desktop Environment.',

      hardwareInfo: 'Informações de Hardware',
      cpu: 'Processador',
      cores: 'Núcleos',
      gpu: 'Processador Grafico',
      ram: 'Memória RAM',
      display: 'Tela',
      privacyWarning: 'O navegador pode limitar a exibição do hardware real por privacidade.',
    },
  },

  documents: {
    selectSubtitle: 'Selecione um arquivo para abrir',
    openButton: 'Abrir documento',
    noDocsFound: 'Nenhum documento encontrado no sistema',
    errorTitle: 'Erro ao carregar',
    errorDescription: 'Não foi possível abrir o documento selecionado.',
    noDocumentTitle: 'Nenhum documento aberto',
    noDocumentDescription: 'Selecione um arquivo na lista ou use o gerenciador de arquivos.',
  },

  files: {
    locations: 'Locais',
    item: 'item',
    items: 'itens',
    searchPlaceholder: 'Pesquisar...',
    noResults: 'Nenhum resultado encontrado',
    back: 'Voltar',
    gridView: 'Visualização em Grade',
    listView: 'Visualização em Lista',
    totalSize: 'Tamanho Total',
    size: 'Tamanho',
    name: 'Nome',

    home: 'Início',
    documents: 'Documentos',
    photos: 'Fotos',
    certificates: 'Certificados',
    musics: 'Musicas',
    feedbacks: 'Avaliações',
  },

  browser: {
    connectionFailed: 'Falha na conexão',
    embedWarning: 'O site recusou a conexão porque não permite visualização incorporada.',
    notExistsWarning: 'Ou talvez ele só não exista mesmo.',
    tryToSearch: 'Experiemente pesquisar por uma URL',
    urlDisclaimer: 'Algumas URLs não serão acessiveis por questão de privacidade',
    tryAgain: 'Tentar de novo',
    openExternal: 'Abrir fora',
    back: 'Voltar',
    refresh: 'Atualizar',
    placeholder: 'Escreva uma URL aqui! (Ex: wikipedia.com)',
  },

  imageViewer: {
    selectSubtitle: 'Selecione uma imagem para visualizar',
    openButton: 'Abrir Imagem',
    noPhoto: 'Nenhuma foto encontrada no sistema',
    errorTitle: 'Erro na Imagem',
    errorDescription: 'Não foi possível carregar a imagem selecionada.',
    backToList: 'Voltar para a lista',
  },

  shutdown: {
    title: 'Desligar',
    description: 'O sistema será desligado automaticamente.',
    cancel: 'Cancelar',
    restart: 'Reiniciar',
    powerOff: 'Desligar',
  },

  units: {
    bytes: 'Bytes',
    kb: 'KB',
    mb: 'MB',
    gb: 'GB',
  },

  terminal: {
    welcome: 'Bem-vindo ao Cai_OS Terminal',
    location: 'Brasil',
    helpMsg: "Digite 'help' para ver os comandos disponíveis.",
    placeholder: 'Digite um comando...',
    notFound: 'Comando não encontrado:',
    cdMissingArg: 'cd: argumento ausente',
    cdNotFound: 'cd: arquivo ou diretório não encontrado:',
    cdNotDirectory: 'cd: não é um diretório:',
    openMissingArg: 'open: operando de arquivo ausente',
    openNotFound: 'open: arquivo ou diretório não encontrado:',
    openIsDirectory: "open: é um diretório. Use 'cd' para entrar.",
    opening: 'Abrindo',
    commands: {
      help: 'Exibe esta lista de ajuda',
      ls: 'Lista os arquivos do diretório atual',
      cd: 'Altera o diretório de trabalho',
      open: 'Abre um arquivoo',
      date: 'Exibe a data e hora atual',
      theme: 'Alterna entre modo claro e escuro',
      clear: 'Limpa a tela do terminal',
      about: 'Sobre o sistema',
      neofetch: 'Exibe informações do sistema',
      whoami: 'Exibe informações sobre o desenvolvedor',
    },
    whoami: {
      name: 'Nome',
      role: 'Cargo',
      stack: 'Tecnologias',
      location: 'Localização',
    },
  },

  systemTips: {
    title: 'Dica do Sistema',
    descriptions: {
      altTab: 'Use CNTRL + Q para alternar rapidamente entre as janelas abertas.',
      terminal: 'Abra o Terminal para interagir diretamente com o kernel do Cai_OS.',
      fullscreen:
        'Pressione F11 para alternar para o modo de tela cheia para uma melhor experiência.',
      theme: 'Você pode alternar o tema do sistema usando o comando "theme" no Terminal.',
      explorer: 'Dê um duplo clique nas pastas do Explorador de Arquivos para navegar.',
    },
  },

  audioPlayer: {
    title: 'Músicas',
    noAudio: 'Nenhuma música selecionada',
    selectDescription: 'Selecione uma música da sua biblioteca ou use o Gerenciador de Arquivos.',
    appSubtitle: 'Biblioteca do usuário',
    errorTitle: 'Erro ao carregar áudio',
    errorDescription: 'O arquivo pode estar corrompido ou o formato não é suportado.',
    backButton: 'Voltar para a biblioteca',
    library: 'Minha Biblioteca',
    unknownArtist: 'Artista Desconhecido',
  },

  errors: {
    systemError: 'Erro de sistema',
    noFileHandler: 'O sistema não possui um aplicativo capaz de abrir este arquivo!',
    enableToLoadFs: 'Erro ao carregar sistema de arquivos!',
  },
};
