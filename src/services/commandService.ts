import { Command } from '../types/command';

export class CommandService {
  private commands: Command[] = [];
  private commandHistory: string[] = [];

  constructor() {
    this.initializeDefaultCommands();
  }

  private initializeDefaultCommands(): void {
    this.commands = [
      {
        id: 'create-task',
        name: 'Create New Task',
        description: 'Create a new task',
        shortcut: 'Ctrl+N',
        action: () => {
          // This would typically navigate to task creation
          console.log('Creating new task...');
          return Promise.resolve(true);
        }
      },
      {
        id: 'search-tasks',
        name: 'Search Tasks',
        description: 'Search through all tasks',
        shortcut: 'Ctrl+F',
        action: () => {
          console.log('Opening search...');
          return Promise.resolve(true);
        }
      },
      {
        id: 'show-help',
        name: 'Show Help',
        description: 'Show help documentation',
        shortcut: 'Ctrl+/',
        action: () => {
          console.log('Showing help...');
          return Promise.resolve(true);
        }
      },
      {
        id: 'settings',
        name: 'Open Settings',
        description: 'Open application settings',
        action: () => {
          console.log('Opening settings...');
          return Promise.resolve(true);
        }
      },
      {
        id: 'logout',
        name: 'Logout',
        description: 'Logout from the application',
        action: () => {
          console.log('Logging out...');
          return Promise.resolve(true);
        }
      }
    ];
  }

  public getCommands(): Command[] {
    return [...this.commands];
  }

  public getCommandById(id: string): Command | undefined {
    return this.commands.find(cmd => cmd.id === id);
  }

  public addCommand(command: Command): void {
    this.commands.push(command);
  }

  public removeCommand(id: string): boolean {
    const index = this.commands.findIndex(cmd => cmd.id === id);
    if (index !== -1) {
      this.commands.splice(index, 1);
      return true;
    }
    return false;
  }

  public executeCommand(command: Command): Promise<boolean> {
    if (command.action) {
      this.commandHistory.push(command.id);
      return command.action();
    }
    return Promise.resolve(false);
  }

  public executeCommandById(id: string): Promise<boolean> {
    const command = this.getCommandById(id);
    if (command) {
      return this.executeCommand(command);
    }
    return Promise.resolve(false);
  }

  public searchCommands(query: string): Command[] {
    if (!query || query.trim() === '') {
      return this.getCommands();
    }

    const searchTerm = query.toLowerCase();
    return this.commands.filter(command =>
      command.name.toLowerCase().includes(searchTerm) ||
      (command.description && command.description.toLowerCase().includes(searchTerm))
    );
  }

  public getCommandHistory(): string[] {
    return [...this.commandHistory];
  }

  public clearCommandHistory(): void {
    this.commandHistory = [];
  }
}

// Singleton instance
let commandServiceInstance: CommandService | null = null;

export function getCommandService(): CommandService {
  if (!commandServiceInstance) {
    commandServiceInstance = new CommandService();
  }
  return commandServiceInstance;
}