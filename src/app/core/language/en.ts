export const en = {
  common: {
    clearAll: 'Clear All',
    notifications: 'Notifications',
    noNotifications: 'No Notifications',
    settings: 'Settings',
    search: 'Search...',
    download: 'Download',
    openFiles: 'Open files',
    openApp: 'Open application',
    newInstance: 'New instance',
    closeApp: 'Close application',
    removeFromDock: 'Remove from dock',
  },

  window: {
    close: 'Close',
    maximize: 'Maximize',
    minimize: 'Minimize',
    restore: 'Restore',
  },

  boot: {
    poweredBy: 'Powered by',
    systemKernel: 'System Kernel',
    pressToStart: 'Press to Start',
    mobileAlert: {
      title: 'Unsupported Device',
      description:
        'Cai_OS was designed for larger screens. Click the button below to access a version compatible with your device.',
      action: 'OK',
    },
  },

  apps: {
    files: 'Files',
    about: 'About the project',
    terminal: 'Terminal',
    settings: 'Settings',
    firefox: 'Firefox',
    photos: 'Photos',
    documents: 'Documents',
    musics: 'Musics',
    systemMonitor: 'System monitor',
    hermes: 'Hermes',
  },

  notifications: {
    title: 'Notifications',
    clearAll: 'Clear all',
    noNotifications: 'No notifications',

    timmings: {
      justNow: 'Just now',
      minutesAgo: 'minutes ago',
      hoursAgo: 'hours ago',
      daysAgo: 'days ago',
    },
  },

  aboutProj: {
    title: 'Why Cai_OS?',
    intro:
      'Cai_OS was developed to show the world how i perceive an operating system experience. To me, an OS is not just a tool, but an extension of our creativity. This project reflects how my journey as a developer allows me to transform abstract concepts into functional and fluid interfaces.',
    quote:
      'We can discover a lot about a person by observing how they interact with their computer.',
    features: 'System features',
    applications: 'Applications',
    featureList: {
      snaps: {
        tag: 'Workspace',
        title: 'Snaps',
        description:
          'Intelligent window management. By dragging an application to the edges or corners of the screen, the system automatically suggests and adjusts resizing, allowing you to organize your workflow into perfect 50% or 25% screen fractions.',
      },
      appSwitcher: {
        tag: 'Multitasking',
        title: 'App Switcher',
        desc_part1: 'Quick navigation between processes. Using the',
        desc_part2:
          'shortcut, you access a quick toggle interface that overlays the system, allowing you to switch focus between active windows with speed and fluidity.',
      },
      notifications: {
        tag: 'System',
        title: 'Notifications',
        description:
          'Stay informed without losing focus. The central notification system organizes app alerts and kernel events in a dedicated center, offering immediate visual feedback and a history of recent interactions.',
      },
      contextMenu: {
        tag: 'Efficiency',
        title: 'Context Menus',
        description:
          'Quick actions at your fingertips. Access essential application controls like pinning to dock, opening new instances, or closing processes directly through a streamlined right-click interface designed for speed.',
      },
      dockDrag: {
        tag: 'Interface',
        title: 'Drag and drop',
        description:
          'Customize your taskbar with total freedom. Drag new applications directly from the menu to the Dock to pin them. The system calculates the position in real-time, visually creating space for intuitive and fluid organization.',
      },
    },
    apps: {
      files: {
        name: 'Files',
        desc: 'Where I keep my results: feedbacks, certifications, and memories.',
      },
      terminal: {
        name: 'Terminal',
        desc: 'The heart of the system. Interact directly with the kernel and discover secrets.',
      },
      settings: {
        name: 'Settings',
        desc: 'Proof that aesthetics are personal. Adapt the systemc on your own way.',
      },
      browser: {
        name: 'Firefox',
        desc: 'Where the web comes to life and ideas connect. Fluid navigation to explore references and the world.',
      },
      photos: {
        name: 'Photos',
        desc: 'Career records and moments. Gallery of technical feedbacks and memories with my best friend.',
      },
      music: {
        name: 'Music',
        desc: 'Synchrony between rhythm and productivity. Where logic finds its frequency.',
      },
      docs: {
        name: 'Documents',
        desc: 'Information architecture and technical foundations. Where ideas take written form.',
      },
      sysMonitor: {
        name: 'System Monitor',
        desc: 'Real-time resources and processes.',
      },
      hermes: {
        name: 'Hermes',
        desc: 'Your AI agent, made for Cai_OS',
      },
    },
  },

  settings: {
    title: 'Settings',

    appearance: {
      title: 'Appearance',
      colorScheme: 'Color Scheme',
      light: 'Light',
      dark: 'Dark',
      wallpaper: 'Wallpaper',
    },

    desktop: {
      title: 'Desktop',
      autoHideDock: 'Auto-hide Dock',
      autoHideDockDesc: 'Hide the dock when windows are over it',
      iconSize: 'Icon Size',
      iconSizeDesc: 'Adjust the dock and elements size',
    },

    sound: {
      title: 'Sound',
      systemSounds: 'System Sounds',
      systemSoundsDesc: 'Enable or disable interaction sounds',
    },

    system: {
      title: 'System',
      systemTips: 'System tips',
      systemTipsDesc: 'Enable or disable system tips notifications',
    },

    language: {
      title: 'Language',
      languageRegion: 'Language & Region',
      portuguese: 'Portuguese',
      brazil: 'Brazil',
      english: 'English',
      unitedStates: 'United States',
      languageChangeNote: 'Language changes are applied instantly across the entire system.',
    },

    about: {
      title: 'About the system',
      systemName: 'System Name',
      interface: 'Interface',
      virtualEngine: 'Virtual Web Engine',
      vweUI: 'VWE UI',
      version: 'Version',
      description:
        'A web operating system built with Angular 21, inspired by the elegance of the GNOME Desktop Environment.',
      hardwareInfo: 'Hardware Information',
      cpu: 'Processor',
      cores: 'Cores',
      gpu: 'Graphic Processor',
      ram: 'RAM',
      display: 'Display',
      privacyWarning: 'The browser may limit real hardware display for privacy reasons.',
    },
  },

  systemMonitor: {
    network: {
      networkTitle: 'Network data',
      type: 'Type',
      latency: 'Latency',
      capacity: 'Capacity',
      unknown: 'Unknown',
      simulated: 'Simulated',
      estimatedFlux: 'ESTIMATED DATA FLUX',
      note: '*Note: The browser limits access to actual traffic data (bytes/s) for security reasons. The values ​​above represent the nominal capacity of your network interface.',
    },
    name: 'Name',
    processes: 'Processes',
    action: 'Action',
    app: 'Application',
  },

  documents: {
    selectSubtitle: 'Select a file to open',
    openButton: 'Open document',
    noDocsFound: 'No documents found in the system',
    errorTitle: 'Loading Error',
    errorDescription: 'Could not open the selected document.',
    noDocumentTitle: 'No document open',
    noDocumentDescription: 'Select a file from the list or use the file manager.',
  },

  files: {
    locations: 'Locations',
    item: 'item',
    items: 'items',
    searchPlaceholder: 'Search...',
    noResults: 'No results found',
    back: 'Back',
    gridView: 'Grid View',
    listView: 'List View',
    totalSize: 'Total Size',
    size: 'Size',
    name: 'Name',

    home: 'Home',
    documents: 'Documents',
    photos: 'Photos',
    certificates: 'Certificates',
    musics: 'Musics',
    feedbacks: 'Feedbacks',
  },

  browser: {
    connectionFailed: 'Connection failed',
    embedWarning: 'The site refused the connection because it does not allow embedded viewing.',
    notExistsWarning: 'Or maybe it just does not exist at all.',
    tryToSearch: 'Try search for a URL',
    urlDisclaimer: 'Some URLs will not open, for a privacy question',
    tryAgain: 'Try again',
    openExternal: 'Open externally',
    back: 'Back',
    refresh: 'Refresh',
    placeholder: 'Write a URL here! (Like: wikipedia.com)',
  },

  imageViewer: {
    selectSubtitle: 'Select a image to view',
    openButton: 'Open Image',
    noPhoto: 'No photos found on the system',
    errorTitle: 'Image Error',
    errorDescription: 'Could not load the selected image.',
    backToList: 'Back to list',
  },

  shutdown: {
    title: 'Power Off',
    description: 'The system will shut down automatically.',
    cancel: 'Cancel',
    restart: 'Restart',
    powerOff: 'Power Off',
  },

  units: {
    bytes: 'Bytes',
    kb: 'KB',
    mb: 'MB',
    gb: 'GB',
  },

  terminal: {
    welcome: 'Welcome to Cai_OS Terminal',
    location: 'Brazil',
    helpMsg: "Type 'help' to see available commands.",
    placeholder: 'Type a command...',
    notFound: 'Command not found:',
    cdMissingArg: 'cd: missing argument',
    cdNotFound: 'cd: no such file or directory:',
    cdNotDirectory: 'cd: not a directory:',
    openMissingArg: 'open: missing file operand',
    openNotFound: 'open: no such file or directory:',
    openIsDirectory: "open: is a directory. Use 'cd' to enter.",
    opening: 'Opening',
    commands: {
      help: 'Display this help list',
      ls: 'List files in current directory',
      cd: 'Change the working directory',
      open: 'Open a file or application',
      date: 'Display current date and time',
      theme: 'Toggle light and dark mode',
      clear: 'Clear the terminal screen',
      about: 'About the system',
      neofetch: 'Display system info with logo',
      whoami: 'Display information about the developer',
    },
    whoami: {
      name: 'Name',
      role: 'Role',
      stack: 'Stack',
      location: 'Location',
    },
  },

  systemTips: {
    title: 'System Tip',
    descriptions: {
      altTab: 'Use CNTRL + Q to quickly switch between open windows.',
      terminal: 'Open the Terminal to interact directly with the Cai_OS kernel.',
      fullscreen: 'Press F11 to toggle fullscreen mode for a better experience.',
      theme: 'You can toggle the system theme using the "theme" command in Terminal.',
      explorer: 'Double click on folders in the Files to navigate.',
    },
  },

  audioPlayer: {
    title: 'Music',
    noAudio: 'No music selected',
    selectDescription: 'Select a song from your library or use the File Manager.',
    appSubtitle: 'User library',
    errorTitle: 'Error loading audio',
    errorDescription: 'The file might be corrupted or the format is not supported.',
    backButton: 'Back to library',
    library: 'My Library',
    unknownArtist: 'Unknown Artist',
  },

  hermes: {
    welcome: 'Welcome to Hermes!',
    desc: 'Type something to start!',
    ask: 'Ask something...',
  },

  errors: {
    systemError: 'System error',
    noFileHandler: 'The system doesnt hava an app capable to open that file!',
    enableToLoadFs: 'Unable to load the file system!',
    seviceUnavailable: 'Service unavailable at this time!',
  },
};
