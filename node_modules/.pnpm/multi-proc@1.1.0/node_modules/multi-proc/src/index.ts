import * as CLI from 'commander';
import Actions from './Actions.js';
import version from './version';

CLI.description('Run multiple node commands in parallel, and see the output')
  .version(version, '-v --version')
  .option(
    '-c --config <config-file>', 'Specify a configiguration. defaults to "multi-proc.config.json" if not included'
  );

CLI.command('init')
  .description('Create a multi-proc.config.json configuration file')
  .action(Actions.init);

CLI.command('start')
  .description('Start the main processes by running their "command" property')
  .option(
    '-f --filter <tag-regex>',
    'Filter and only show logs from any process who\'s name matches the regexprovided'
  )
  .action(Actions.start(CLI));

CLI.parse(process.argv);
