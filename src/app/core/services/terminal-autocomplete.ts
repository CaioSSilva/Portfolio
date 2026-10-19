import { Injectable, inject } from '@angular/core';
import { LanguageService } from './language';
import { TerminalCommands } from './terminal-commands';
import { FileSystem } from './file-system';
import { TerminalSuggestion } from '../models/terminal';

const PATH_COMMANDS = ['cd', 'open', 'ls'];

@Injectable({ providedIn: 'root' })
export class TerminalAutocomplete {
  private readonly lang = inject(LanguageService);
  private readonly commandService = inject(TerminalCommands);
  private readonly fileSystem = inject(FileSystem);

  getCommandNames(): string[] {
    return Object.keys(this.lang.t().terminal.commands);
  }

  async getSuggestions(inputValue: string, currentPath: string): Promise<TerminalSuggestion[]> {
    if (!inputValue || !inputValue.trim()) return [];

    const parts = inputValue.split(' ');
    const command = parts[0].toLowerCase();
    const lastPart = parts[parts.length - 1];

    if (parts.length === 1) {
      if (PATH_COMMANDS.includes(command)) {
        return this.getFileSuggestions('', currentPath, command);
      }
      return this.getCommandSuggestions(lastPart);
    }

    if (!PATH_COMMANDS.includes(command)) {
      return [];
    }

    return this.getFileSuggestions(lastPart, currentPath, command);
  }

  resolveMatch(inputValue: string, suggestion: TerminalSuggestion): string {
    const parts = inputValue.split(' ');
    if (parts.length <= 1) {
      const command = parts[0]?.toLowerCase() ?? '';
      if (PATH_COMMANDS.includes(command) && suggestion.value !== command) {
        return `${parts[0]} ${suggestion.value}`;
      }
      return `${suggestion.value} `;
    }
    parts[parts.length - 1] = suggestion.value;
    return parts.join(' ');
  }

  private getCommandSuggestions(prefix: string): TerminalSuggestion[] {
    return this.getCommandNames()
      .filter((cmd) => cmd.startsWith(prefix.toLowerCase()))
      .map((cmd) => ({ label: cmd, value: cmd }));
  }

  private async getFileSuggestions(
    lastPart: string,
    currentPath: string,
    command: string,
  ): Promise<TerminalSuggestion[]> {
    if (!this.fileSystem.isLoaded()) await this.fileSystem.ensureLoaded();

    const isAbsolute = lastPart.startsWith('/');
    const segments = lastPart.split('/');
    const prefix = segments.pop()?.toLowerCase() ?? '';
    const dirPath = isAbsolute && segments.length === 1 ? '/' : segments.join('/');

    const searchDir = this.resolveSearchDir(dirPath, currentPath);
    if (!searchDir) return [];

    const fileTranslations = this.lang.t().files as Record<string, string>;
    const children = this.fileSystem.getChildren(searchDir);
    const filtered =
      command === 'cd' ? children.filter((file) => file.type === 'folder') : children;

    return filtered
      .map((file) => ({
        name: fileTranslations[file.id.toLowerCase()] ?? file.name,
        isFolder: file.type === 'folder',
      }))
      .filter((file) => file.name.toLowerCase().startsWith(prefix))
      .map((file) => {
        const val = file.isFolder ? `${file.name}/` : file.name;
        const prefixed = dirPath ? (dirPath === '/' ? `/${val}` : `${dirPath}/${val}`) : val;
        return { label: val, value: prefixed };
      });
  }

  private resolveSearchDir(dirPath: string, currentPath: string): string | null {
    if (!dirPath) return currentPath;
    const target = this.commandService.resolvePath(dirPath, currentPath);
    if (!target || target.startsWith('NOT_A_DIR:')) return null;
    return target;
  }
}
