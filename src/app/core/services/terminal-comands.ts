import { inject, Injectable } from '@angular/core';
import { LanguageService } from './language';
import { Theme } from './theme';
import { FileSystem } from './file-system';
import { CommandHandler, CommandResult } from '../models/terminal';
import { ProcessManager } from './process-manager';

@Injectable({ providedIn: 'root' })
export class TerminalComands {
  private readonly lang = inject(LanguageService);
  private readonly theme = inject(Theme);
  private readonly fs = inject(FileSystem);
  private readonly processManager = inject(ProcessManager);
  private commandMap: Record<string, CommandHandler>;

  constructor() {
    this.commandMap = this.initializeCommands();
  }

  private initializeCommands(): Record<string, CommandHandler> {
    return {
      help: () => this.handleHelp(),
      ls: (_, path) => this.handleLs(path),
      cd: (args, path) => this.handleCd(args, path),
      open: (args, path) => this.handleOpen(args, path),
      date: () => this.handleDate(),
      theme: () => this.handleTheme(),
      clear: () => this.handleClear(),
      about: () => this.handleAbout(),
      neofetch: () => this.handleNeofetch(),
      whoami: () => this.handleWhoAmI(),
    };
  }

  async execute(rawCommand: string, currentPath: string): Promise<CommandResult> {
    const parts = rawCommand.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    const handler = this.commandMap[cmd];

    if (!handler) {
      return {
        output: `${this.lang.t().terminal.notFound} "${cmd}"`,
        action: 'NONE',
      };
    }

    if (!this.fs.isLoaded()) {
      await this.fs.ensureLoaded();
    }

    const result = handler(args, currentPath);
    return result instanceof Promise ? await result : result;
  }

  getAvailableCommands(): string[] {
    return Object.keys(this.commandMap);
  }

  public resolvePath(pathStr: string, currentPath: string): string | null {
    if (pathStr === '/') return 'root';
    if (pathStr === '~') return 'home';

    const segments = pathStr.split('/').filter((s) => s.length > 0);
    let targetPath = pathStr.startsWith('/') ? 'root' : currentPath;

    for (const segment of segments) {
      if (segment === '.') continue;
      if (segment === '..') {
        targetPath = this.getParentId(targetPath);
        continue;
      }

      const children = this.fs.getChildren(targetPath);
      const found = children.find(
        (f) =>
          f.id.toLowerCase() === segment.toLowerCase() ||
          f.name.toLowerCase() === segment.toLowerCase()
      );

      if (!found || found.type !== 'folder') return null;
      targetPath = found.id;
    }

    return targetPath;
  }

  private getParentId(currentId: string): string {
    if (currentId === 'home' || currentId === 'root') return 'root';

    const tree = this.fs.tree();
    if (!tree) return 'root';

    const findInTree = (node: any, target: string): string | null => {
      for (const child of node.children || []) {
        if (child.id === target) return node.id;
        const found = findInTree(child, target);
        if (found) return found;
      }
      return null;
    };

    return findInTree(tree, currentId) || 'root';
  }

  private handleLs(path: string): CommandResult {
    const files = this.fs.getChildren(path);
    const trans = this.lang.t().files as Record<string, string>;

    if (files.length === 0) return { output: '', action: 'NONE' };

    const output = files
      .map((f) => {
        const prefix = f.type === 'folder' ? '[DIR] ' : '      ';
        const displayName = trans[f.id.toLowerCase()] || f.name;
        return `${prefix}${displayName}`;
      })
      .join('\n');

    return { output, action: 'NONE' };
  }

  private handleCd(args: string[], currentPath: string): CommandResult {
    const t = this.lang.t().terminal;
    if (!args.length || args[0] === '~') return { output: '', newPath: 'home', action: 'NONE' };

    const targetId = this.resolvePath(args.join(' '), currentPath);
    return targetId
      ? { output: '', newPath: targetId, action: 'NONE' }
      : { output: `${t.cdNotFound} ${args.join(' ')}`, action: 'NONE' };
  }

  private handleOpen(args: string[], currentPath: string): CommandResult {
    const t = this.lang.t().terminal;
    if (!args.length) return { output: t.openMissingArg, action: 'NONE' };

    const fullPath = args.join(' ');
    const lastSlashIndex = fullPath.lastIndexOf('/');
    const dirPart = lastSlashIndex !== -1 ? fullPath.substring(0, lastSlashIndex) : '';
    const filePart = lastSlashIndex !== -1 ? fullPath.substring(lastSlashIndex + 1) : fullPath;

    const targetDir = dirPart ? this.resolvePath(dirPart, currentPath) : currentPath;
    if (!targetDir) return { output: `${t.openNotFound} ${fullPath}`, action: 'NONE' };

    const children = this.fs.getChildren(targetDir);
    const node = children.find(
      (f) =>
        f.id.toLowerCase() === filePart.toLowerCase() ||
        f.name.toLowerCase() === filePart.toLowerCase()
    );

    if (!node || node.type === 'folder') {
      return {
        output: node ? `${t.openIsDirectory} ${node.name}` : `${t.openNotFound} ${fullPath}`,
        action: 'NONE',
      };
    }

    this.processManager.openFile(node);
    return { output: `${t.opening} ${node.name}...`, action: 'NONE' };
  }

  private handleTheme(): CommandResult {
    this.theme.toggle();
    const mode = this.theme.isDarkMode()
      ? this.lang.t().settings.appearance.dark
      : this.lang.t().settings.appearance.light;
    return { output: `Theme: ${mode}`, action: 'NONE' };
  }

  private handleClear(): CommandResult {
    return { action: 'CLEAR_ACTION' };
  }

  private handleHelp(): CommandResult {
    const t = this.lang.t().terminal;
    return {
      output: Object.entries(t.commands)
        .map(([n, d]) => `${n.padEnd(12)} - ${d}`)
        .join('\n'),
      action: 'NONE',
    };
  }

  private handleWhoAmI(): CommandResult {
    const t = this.lang.t().terminal.whoami;
    return {
      output: [
        `┌──────────────────────────────────────────`,
        `│  ${t.name}: Caio Souza Silva`,
        `│  ${t.role}: Frontend Developer`,
        `│  ${t.stack}: Angular`,
        `│  ${t.location}: ${this.lang.t().terminal.location}`,
      ].join('\n'),
      action: 'NONE',
    };
  }

  private handleNeofetch(): CommandResult {
    const logo = [
      '   ./ooooo/.',
      '  /ooooooo/',
      ' oooooooooo',
      ' oooooooooo',
      '  \\ooooooo\\',
      '   .\\ooooo\\.',
    ];
    const info = [
      'user@caios',
      '----------',
      'OS: Cai_OS Web',
      'Kernel: 1.0.0',
      'Shell: Terminal',
      'WM: VWE_UI',
    ];
    return {
      output: logo.map((line, i) => `${line.padEnd(16)} ${info[i] || ''}`).join('\n'),
      action: 'NONE',
    };
  }

  private handleDate(): CommandResult {
    const locale = this.lang.currentLang() === 'pt' ? 'pt-BR' : 'en-US';
    return { output: new Date().toLocaleString(locale), action: 'NONE' };
  }

  private handleAbout(): CommandResult {
    return { output: `Cai_OS v1.0.0\nKernel: Web Engine`, action: 'NONE' };
  }
}
