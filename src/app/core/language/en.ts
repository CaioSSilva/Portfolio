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
    removeFromDesktop: 'Remove from desktop',
    addToDock: 'Add to dock',
    addToDesktop: 'Add to desktop',
    or: 'Or',
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
    closePanel: 'Close notifications panel',
    noNotifications: 'No notifications',

    timings: {
      justNow: 'Just now',
      minuteAgo: 'minute ago',
      minutesAgo: 'minutes ago',
      hourAgo: 'hour ago',
      hoursAgo: 'hours ago',
      dayAgo: 'day ago',
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
    downloads: 'Downloads',
    documentation: 'Documentation',
    docDescription: 'Want to know how the things work under the hood? Read the documentation!',
    codeDescription: 'Want to analyze the source code? Download the .zip file.',
    resumeDescription: 'Want to know about the creator? Read here!',
    aboutSO: 'Want to know more about the operational system of the portfolio? Check below!',
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

      desktopIcons: {
        tag: 'Efficiency',
        title: 'Desktop Icons',
        description:
          'Transform your workspace into a command center. Interact with applications through a context-aware interface, allowing you to manage active processes, toggle dock shortcuts, and trigger system actions without leaving your desktop.',
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
        desc: 'Proof that aesthetics are personal. Adapt the system in your own way.',
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

    hermes: {
      title: 'Hermes',
      model: 'AI Model',
      modelDesc: 'Select which Gemini model Hermes will use to respond',
      loadingModels: 'Loading available models...',
      errorModels: 'Could not load models. Check your API key.',
      retryModels: 'Try again',
      currentModel: 'Current model',
      agentMode: 'Agent Mode',
      agentModeDesc: 'Listen for "Hello Hermes" or "Oi Hermes" at any time to wake up the assistant',
      agentSpeakReplies: 'Spoken replies',
      agentSpeakRepliesDesc: 'Hermes will read its responses aloud using the browser speech engine',
      agentUnsupported: 'Your browser does not support the Web Speech API',
      agentInsecureContext: 'Agent Mode requires a secure connection (HTTPS)',
      agentPrivacyNote: 'Agent Mode uses your browser\'s speech recognition. In Chrome, audio is processed by Google\'s servers. Enable only on trusted networks.',
      agentWakePhrases: 'Wake phrases',
      agentPermissionDenied: 'Microphone access was denied. Allow it in your browser settings and try again.',
      agentActive: 'Agent mode active',
      agentListening: 'Listening',
      agentAwake: 'Awake',
      agentProcessing: 'Processing',
      agentSpeaking: 'Speaking',
    },

    appearance: {
      title: 'Appearance',
      colorScheme: 'Color Scheme',
      light: 'Light',
      dark: 'Dark',
      wallpaper: 'Wallpaper',
      static: 'Static',
      animated: 'Animated',
    },

    desktop: {
      title: 'Desktop',
      autoHideDock: 'Auto-hide Dock',
      autoHideDockDesc: 'Hide the dock when windows are over it',
      iconSize: 'Dock Icon Size',
      iconSizeDesc: 'Adjust the dock and elements size',
      desktopItemsSize: 'Desktop items size',
      desktopItemsSizeDesc: 'Adjust the size of items on desktop',
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
    killProcess: 'Kill process',
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
    clearSearch: 'Clear search',
    closeSidebar: 'Close sidebar',
    toggleFolder: 'Toggle folder',
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
    backButton: 'Back to Gallery',
    previousButton: 'Previous (← Arrow Key)',
    nextButton: 'Next (→ Arrow Key)',
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
    desktop: {
      altTab: 'Use Ctrl + ` (backtick) to quickly switch between open windows (App Switcher).',
      snapLeft: 'Drag a window to the left or right edge to snap it to 50% of the screen.',
      snapCorner: 'Drag a window to any corner to snap it into a 25% quadrant.',
      snapTop: 'Drag a window to the top of the screen to maximize it instantly.',
      contextMenu: 'Right-click the Dock or desktop icons to see quick actions.',
      dockDrag: 'Right-click any app in the Dock or app grid to pin or unpin it from the Dock.',
      terminal:
        'In the Terminal, run "neofetch" for system info or "whoami" to learn about the creator.',
      terminalOpen: 'Run "open FileName" in the Terminal to open any file in the system.',
      theme: 'Type "theme" in the Terminal to toggle between light and dark mode instantly.',
      fullscreen: 'Press F11 to enter fullscreen mode for a fully immersive experience.',
      hermes:
        'Ask Hermes to open apps, change the theme, or play sounds. It can control the whole system.',
      hermesWallpaper: 'Ask Hermes to change the wallpaper by describing what you want.',
      desktopIcons:
        'Right-click any app in the Dock or app grid to add or remove its desktop shortcut.',
      windowResize: 'Drag the bottom-right corner of any window to resize it freely.',
      multiWindow:
        'Open multiple windows of the same app using "New instance" in the context menu.',
      notifications: 'Click the bell icon in the top bar to access the notification history.',
      settings: 'In Settings, you can customize icon size, wallpaper, theme, and much more.',
      settingsSound: 'Enable or disable system sounds in Settings → Sound.',
      files: 'In the Files app, switch between grid and list view using the button at the top.',
      browser: 'The built-in Firefox supports any URL. Try visiting wikipedia.com or github.com.',
    },
    mobile: {
      swipeOverview: 'Tap the square button in the bottom navigation bar to see all open apps.',
      swipeClose: 'In the app overview, swipe a card upward to close it quickly.',
      tapResume: 'Tap any card in the overview to resume the app right where you left off.',
      allApps: 'Tap "All Apps" in the bottom bar to access the full app grid.',
      hermes:
        'Ask Hermes to open apps, change the theme, or show notifications. Just type your request.',
      hermesControl:
        'Hermes can control the system. Try saying "switch to dark mode" and watch it happen.',
      notifications: 'Tap the bell icon to see the full notification history of the system.',
      files: 'In the Files app, tap folders to navigate and use the search bar to filter.',
      settings: 'In Settings you can change the wallpaper, language, and toggle sounds.',
      terminal: 'The Terminal is available on mobile. Try running "ls", "cd", or "whoami".',
      music: 'The music player supports synced lyrics. Tap "Lyrics" while a song is playing.',
    },
  },

  audioPlayer: {
    title: 'Music',
    noAudio: 'No music selected',
    selectDescription: 'Select a song from your library or use the File Manager.',
    viewLibrary: 'View library',
    appSubtitle: 'User library',
    errorTitle: 'Error loading audio',
    errorDescription: 'The file might be corrupted or the format is not supported.',
    backButton: 'Back to library',
    library: 'My Library',
    unknownArtist: 'Unknown Artist',
    nowPlaying: 'Now Playing',
    menuLabel: 'Library',
    lyricsLabel: 'Lyrics',
    lyricsLoading: 'Looking for lyrics...',
    lyricsNotFound: 'No lyrics found for this track.',
    lyricsPlainOnly: 'Lyrics without timestamps',
    lyricsDisclaimer: 'Lyrics provided by LRCLIB',
  },

  hermes: {
    welcome: 'Welcome to Hermes!',
    desc: 'Type something to start!',
    ask: 'Ask something...',
    roleUser: 'User',
    roleAssistant: 'Hermes',
  },

  mobileNav: {
    recentApps: 'Recent Applications',
    home: 'Home',
    allApps: 'All Apps',
    noOpenApps: 'No open apps',
    swipeToClose: 'Swipe up to close',
    tapToResume: 'Tap to resume',
    swipeToBrowse: 'Swipe horizontally to browse',
    pullDown: 'Pull down',
  },

  errors: {
    systemError: 'System error',
    noFileHandler: "The system doesn't have an app capable of opening that file!",
    enableToLoadFs: 'Unable to load the file system! Reload the page.',
    serviceUnavailable: 'Service unavailable at this time!',
    actionExecutionFailed: 'Could not execute the action requested by Hermes.',
    modelUnavailable:
      'The selected model is not available. Please change the model in Hermes settings.',
    failedToLoadFiles: 'Failed to load files from the file system.',
    failedToLoadDocument: 'Failed to load the document.',
    failedToProcessDocument: 'Failed to process the document.',
    failedToLoadImages: 'Failed to load images from the file system.',
  },
};
