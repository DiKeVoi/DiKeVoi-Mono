import { ChildProcess, spawn, SpawnOptions } from 'child_process';
import { join } from 'path';
import Actions, { InputNodeProcess } from './Actions';
import { Color, color as asColor } from './Colors';

export default class NodeProcess {

  public static start = async (proc: NodeProcess): Promise<void> => {
    return new Promise((resolve, reject) => {
      const spawnOptions: SpawnOptions = {
        cwd: proc.directory,
        shell: proc.command.search(/(&&|;)/) >= 0,
      };
      const startMessageArray = [`${asColor('Starting: ', Color.BOLD)}${proc.command}`];
      if (spawnOptions.cwd) {
        startMessageArray.push(asColor(`in ${spawnOptions.cwd}`, Color.DIM));
      }
      if (spawnOptions.shell) {
        startMessageArray.push(asColor(`(as a shell)`, Color.DIM));
      }
      proc.log(startMessageArray.join(' '));
      let spawned: ChildProcess;
      if (spawnOptions.shell) {
        spawned = spawn(proc.command, spawnOptions);
      } else {
        const commandArray = proc.command.split(' ');
        const initialCommand = commandArray.shift()!;
        spawned = spawn(initialCommand, commandArray, spawnOptions);
      }
      spawned.addListener('close', () => resolve());
      spawned.addListener('disconnect', () => resolve());
      spawned.addListener('exit', () => {
        proc.log(asColor('Finished!', Color.BOLD));
        resolve();
      });
      spawned.addListener('err', (err: Error) => reject(err));
      spawned.stdout.addListener('data', (chunk: any) => {
        if (!proc.filter || proc.filter.exec(proc.tag)) {
          proc.log(chunk.toString());
        }
      });
      spawned.stderr.addListener('data', (chunk: any) => {
        if (!proc.filter || proc.filter.exec(proc.tag)) {
          proc.log(chunk.toString());
        }
      });
    });
  }

  public tag: string;
  public command: string;
  public filter?: RegExp;
  public directory?: string;

  constructor(inputProc: InputNodeProcess, tagWidth: number, filter?: RegExp) {
    this.tag = this.getTag(inputProc, tagWidth);
    this.command = inputProc.command;
    this.filter = filter;
    if (inputProc.directory) {
      if (inputProc.directory.startsWith('/')) {
        this.directory = inputProc.directory;
      } else {
        this.directory = join(Actions.pwd, inputProc.directory);
      }
    }
  }

  public log = (message: string): void => {
    const lines = message.trim().split('\n');
    for (const line of lines) {
      console.log(`${this.tag}${line.trim()}`);
    }
  }

  public error = (message: string): void => {
    const lines = message.trim().split('\n');
    for (const line of lines) {
      console.log(`${asColor(this.tag, Color.BG_RED, Color.UNDERLINE, Color.WHITE)}${line.trim()}`);
    }
  }

  public getTag = (proc: InputNodeProcess, maxWidth: number): string => {
    let tag = proc.tag;
    while (tag.length < maxWidth) {
      tag += ' ';
    }
    if (!proc.color) {
      throw new Error(`'process.color' is required`);
    }
    // @ts-ignore
    const color = Color[proc.color.toUpperCase()];
    if (!color) {
      throw new Error(`${proc.color.toUpperCase()} is not a valid color.`);
    }
    return asColor(` ${tag} `, color, Color.WHITE) + ' ';
  }

}
