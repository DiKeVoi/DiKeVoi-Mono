# multi-proc

Run multiple command line operations at the same time. For example, if you want to run your Express backend alongside the Vue frontend, you could use this package to run both from the same terminal instance, and view both logs at the same time.

![multi-proc in action](https://user-images.githubusercontent.com/10101283/50622981-96158780-0edf-11e9-9141-e3c671b97211.gif)

#### Windows:

This was developed and tested on only `OSX` and `*nix`. Windows has not been tested, but it should work with cmd syntax for commands. Cannot guarantee it.

## Usage

### Installation

You can install it locally or globally:

```bash
# Global (Recommended)
npm install -g multi-proc
yarn global add multi-proc

# Local
npm install multi-proc
yarn add multi-proc
```

Globally would a be a pretty good move if you want to use it outside of a project, so you wouldn't have to create a `package.json` before using it.

### Configuration

~~Generate a configuration file using the `init` command~~ This hasn't been implemented yet. It's just a `json` file, so... make it yourself.

```bash 
multi-proc init
```

This will generate a file in the working directory called `multi-proc.config.json`. ___Paths in this file are not relative to the config file, but to the working directory when the command is called___.

```json
[
  {
    "tag": "Process 1",
    "color": "BG_BLUE",
    "command": "yarn start",
    "directory": "/path/to/process1"
  },
  {
    "tag": "Process 2",
    "color": "BG_GREEN",
    "command": "npm run start",
    "directory": "/path/to/process2"
  }
]
```

This file could also be a `.js` file as well:

```js
// multi-proc.config.js
module.exports = [
  {
    tag: "Process 1",
    color: "BG_BLUE",
    command: "yarn start",
    directory: "/path/to/process1"
  },
  ...
]
```

#### `tag`

This is the string that is displayed in the terminal output at the beginning of the line when the process prints a line.

#### `color`
This is the colorization of the `tag` when the process outputs a message. Any of the enum names [here](https://github.com/aklinker1/multi-proc/blob/21c7f784a187f3467555dbc14d85a612a0eefb7c/src/Colors.ts#L3), such as `"BLUE"`, `"BG_RED"`, `"UNDERSCORE"`, are valid options.

#### `command`

Specify the command to start each process. This doesn't have to start a node script, could be any bash command. Be careful when you have to escape characters.

```json
"command": "cd some/directory && yarn start"
``` 

#### `directory`

Specify the working directory for the `"command"` to run from. This path should be relative to where the command is used from.

### Running

```bash
# Run the processes in multi-proc.config.json
multi-proc start

# Filter and only output tags that match regex
multi-proc start --filter 'proc.*?1'

# Run the processes in a specific config file
multi-proc --config path/to/config.json start

# View all commands/options
multi-proc --help
```

## Example 1: Vue + Express

In this case, you only need to run both in the Vue frontend, as the frontend is dependent on the backend.

```bash
$ pwd
/home/aklinker1/workspace/Gamer-Elite

$ ls
... express-backend/ ... vue-frontend/ ...

$ cd vue-frontend

$ ls
... multi-proc.config.json ... package.json ...

$ cat multi-proc.config.json
[
  {
    "tag": "Express",
    "color": "BG_BLUE",
    "command": "yarn start:dev",
    "directory": "../express-backend"
  },
  {
    "tag": "Vue",
    "color": "BG_TEAL",
    "command": "yarn serve",
  }
]

$ multi-proc start
```

## Example 2

```bash
$ pwd
/home/aaron/programming

$ ls
node-project-1/  node-project-2/  multi-proc.config.json

$ cat multi-proc.config.json
[
  {
    "tag": "Process 1",
    "color": "BG_BLUE",
    "command": "yarn start:dev",
    "directory": "programming/node-project-1"
  },
  {
    "tag": "Project 2",
    "color": "BG_GREEN",
    "command": "cd programming/node-project-2 && node src/index.js"
  }
]

$ cd ..

$ pwd 
/home/aaron

# Note because this isn't running in /home/aaron/programming, I had to add programming/* for the directory on the node-project-1 process and the cd for the node-project-2 process
# Paths in the config need to be relative to where the command is called from
$ multi-proc --config programming/multi-proc.config.json start
```
