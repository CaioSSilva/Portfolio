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

  private readonly commandMap: Record<string, CommandHandler> = {
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

  async execute(rawCommand: string, currentPath: string): Promise<CommandResult> {
    const [cmd, ...args] = rawCommand.trim().split(/\s+/);
    const handler = this.commandMap[cmd.toLowerCase()];

    if (!handler) return { output: `${this.lang.t().terminal.notFound} "${cmd}"`, action: 'NONE' };

    if (!this.fs.isLoaded()) await this.fs.ensureLoaded();

    const result = handler(args, currentPath);
    return result instanceof Promise ? await result : result;
  }

  resolvePath(pathStr: string, currentPath: string): string | null {
    if (pathStr === '/') return 'root';
    if (pathStr === '~') return 'home';

    const segments = pathStr.split('/').filter((s) => s.length > 0);
    let targetId = pathStr.startsWith('/') ? 'root' : currentPath;

    for (const segment of segments) {
      if (segment === '.') continue;
      if (segment === '..') {
        targetId = this.findParentId(targetId);
        continue;
      }
      const found = this.findChildInDir(targetId, segment);
      if (!found || found.type !== 'folder') return null;
      targetId = found.id;
    }
    return targetId;
  }

  private findChildInDir(dirId: string, name: string) {
    return this.fs
      .getChildren(dirId)
      .find(
        (f) =>
          f.id.toLowerCase() === name.toLowerCase() || f.name.toLowerCase() === name.toLowerCase(),
      );
  }

  private findParentId(currentId: string): string {
    if (['home', 'root'].includes(currentId)) return 'root';

    // Usamos a nova lógica do FileSystem para encontrar o pai de forma mais eficiente
    const tree = this.fs.tree();
    if (!tree) return 'root';

    const findParentRecursive = (node: any, target: string): string | null => {
      for (const child of node.children || []) {
        if (child.id === target) return node.id;
        const found = findParentRecursive(child, target);
        if (found) return found;
      }
      return null;
    };

    return findParentRecursive(tree, currentId) || 'root';
  }

  private handleLs(path: string): CommandResult {
    const files = this.fs.getChildren(path);
    if (files.length === 0) return { output: '', action: 'NONE' };

    const trans = this.lang.t().files as Record<string, string>;
    const output = files
      .map((f) => {
        const prefix = f.type === 'folder' ? '[DIR] ' : '      ';
        return `${prefix}${trans[f.id.toLowerCase()] || f.name}`;
      })
      .join('\n');

    return { output, action: 'NONE' };
  }

  private handleCd(args: string[], currentPath: string): CommandResult {
    const pathArg = args.join(' ');
    if (!pathArg || pathArg === '~') return { output: '', newPath: 'home', action: 'NONE' };

    const targetId = this.resolvePath(pathArg, currentPath);
    return targetId
      ? { output: '', newPath: targetId, action: 'NONE' }
      : { output: `${this.lang.t().terminal.cdNotFound} ${pathArg}`, action: 'NONE' };
  }

  private handleOpen(args: string[], currentPath: string): CommandResult {
    const t = this.lang.t().terminal;
    if (!args.length) return { output: t.openMissingArg, action: 'NONE' };

    const { dir, file } = this.parsePath(args.join(' '));
    const targetDir = dir ? this.resolvePath(dir, currentPath) : currentPath;

    if (!targetDir) return { output: `${t.openNotFound} ${args.join(' ')}`, action: 'NONE' };

    const node = this.findChildInDir(targetDir, file);
    if (!node || node.type === 'folder') {
      return {
        output: node ? `${t.openIsDirectory} ${node.name}` : `${t.openNotFound} ${file}`,
        action: 'NONE',
      };
    }

    this.processManager.openFile(node);
    return { output: `${t.opening} ${node.name}...`, action: 'NONE' };
  }

  private parsePath(fullPath: string) {
    const parts = fullPath.split('/');
    const file = parts.pop() || '';
    return { dir: parts.join('/'), file };
  }

  private handleHelp(): CommandResult {
    const t = this.lang.t().terminal;
    const output = Object.entries(t.commands)
      .map(([n, d]) => `${n.padEnd(12)} - ${d}`)
      .join('\n');
    return { output, action: 'NONE' };
  }

  private handleTheme(): CommandResult {
    this.theme.toggle();
    const modeKey = this.theme.isDarkMode() ? 'dark' : 'light';
    return { output: `Theme: ${this.lang.t().settings.appearance[modeKey]}`, action: 'NONE' };
  }

  private handleClear(): CommandResult {
    return { action: 'CLEAR_ACTION' };
  }

  private handleDate(): CommandResult {
    const locale = this.lang.currentLang() === 'pt' ? 'pt-BR' : 'en-US';
    return { output: new Date().toLocaleString(locale), action: 'NONE' };
  }

  private handleWhoAmI(): CommandResult {
    const t = this.lang.t().terminal.whoami;
    const output = [
      `┌──────────────────────────────────────────`,
      `│  ${t.name}: Caio Souza Silva`,
      `│  ${t.role}: Frontend Developer`,
      `│  ${t.stack}: Angular`,
      `│  ${t.location}: ${this.lang.t().terminal.location}`,
    ].join('\n');
    return { output, action: 'NONE' };
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
    const output = logo.map((line, i) => `${line.padEnd(16)} ${info[i] || ''}`).join('\n');
    return { output, action: 'NONE' };
  }

  private handleAbout(): CommandResult {
    return { output: `Cai_OS v1.0.0\nKernel: Web Engine`, action: 'NONE' };
  }
}
