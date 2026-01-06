export interface CommandResult {
  output?: string;
  newPath?: string;
  action?: 'CLEAR_ACTION' | 'NONE';
}

export interface TerminalLine {
  command: string;
  output: string;
  path: string;
}

export type CommandHandler = (
  args: string[],
  currentPath: string
) => CommandResult | Promise<CommandResult>;
