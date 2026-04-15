import { execSync } from 'child_process';
import { CommanderStatic } from 'commander';
import { join } from 'path';
import { Color, color } from './Colors';
import NodeProcess from './NodeProcess';

export interface InputNodeProcess {
  tag: string;
  color: Color;
  command: string;
  directory?: string;
}

export default class Actions {

  public static pwd = execSync('pwd', { encoding: 'utf8' }).trim();

  public static init = (CLI: CommanderStatic): void => {
    console.log('Initializing');
  }

  public static start = (CLI: CommanderStatic) => async (commandOptions: any): Promise<void> => {
    const configFile = CLI.config || 'multi-proc.config.json';
    const config = Actions.readConfig(configFile, commandOptions.filter);
    console.log(color(`${config.length} Process${config.length === 1 ? '' : 'es'} in ${configFile}`, Color.BOLD));
    console.log(`Working directory: ${color(`[${Actions.pwd}]`, Color.DIM)}\n`);

    try {
      await Promise.all(config.map(NodeProcess.start));
    } catch (err) {
      console.error(err);
    }
    console.log();
  }

  public static readConfig = (configFile: string, filter: string | undefined): NodeProcess[] => {
    const procs = require(join(Actions.pwd, configFile)) as InputNodeProcess[];
    let maxTagWidth = 0;
    for (const proc of procs) {
      if (proc.tag.length > maxTagWidth) {
        maxTagWidth = proc.tag.length;
      }
    }
    return procs.map((proc) => new NodeProcess(proc, maxTagWidth, filter ? new RegExp(filter) : undefined));
  }

}
