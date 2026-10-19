export interface CommandResult {
  output?: string;
  newPath?: string;
  action?: 'CLEAR_ACTION' | 'NONE';
  blurInput?: boolean;
}

export interface TerminalLine {
  command: string;
  output: string;
  path: string;
}

export type CommandHandler = (
  args: string[],
  currentPath: string,
) => CommandResult | Promise<CommandResult>;

export interface TerminalSuggestion {
  label: string;
  value: string;
}

export type TerminalTouchKey = {
  label: string;
  key: string;
  action: 'key' | 'ctrl';
};
