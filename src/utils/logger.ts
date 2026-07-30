import * as vscode from 'vscode';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class Logger {
  private static instance: Logger;
  private outputChannel: vscode.OutputChannel;
  private level: LogLevel = LogLevel.INFO;

  private constructor() {
    this.outputChannel = vscode.window.createOutputChannel('Shadcn Helper');
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.DEBUG) {
      this.log('DEBUG', message, args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.INFO) {
      this.log('INFO', message, args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.WARN) {
      this.log('WARN', message, args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.ERROR) {
      this.log('ERROR', message, args);
    }
  }

  show(): void {
    this.outputChannel.show();
  }

  dispose(): void {
    this.outputChannel.dispose();
  }

  private log(level: string, message: string, args: unknown[]): void {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const line = `[${timestamp}] [${level}] ${message}`;
    this.outputChannel.appendLine(line);
    if (args.length > 0) {
      args.forEach(arg => this.outputChannel.appendLine(`  ${JSON.stringify(arg)}`));
    }
  }
}
