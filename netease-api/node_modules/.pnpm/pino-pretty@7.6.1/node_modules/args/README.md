# args

[![Build Status](https://travis-ci.org/leo/args.svg?branch=master)](https://travis-ci.org/leo/args)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

This package makes creating command line interfaces a breeze.

## Features

- Git-style sub commands (e.g. `pizza cheese` executes the "pizza-cheese" binary)
- Auto-generated usage information
- Determines type of option by checking type of default value (e.g. `['hi']` => `<list>`)
- Clean [syntax](#usage) for defining options and commands
- Easily [retrieve](#usage) values of options
- Automatically suggests a similar option, if the user entered an unknown one

## Usage

Install the package (you'll need at least version 6.0.0 of [Node](https://nodejs.org/en/)):

```bash
npm install --save args
```

Once you're done, you can start using it within your binaries:

```js
#!/usr/bin/env node

const args = require('args')

args
  .option('port', 'The port on which the app will be running', 3000)
  .option('reload', 'Enable/disable livereloading')
  .command('serve', 'Serve your static site', ['s'])

const flags = args.parse(process.argv)
```

The upper code defines two options called "port" and "reload" for the current binary, as well as a new sub command named "serve". So if you want to check for the value of the "port" option, just do this:

```js
// This also works with "flags.p", because the short name of the "port" option is "p"

if (flags.port) {
  console.log(`I'll be running on port ${flags.port}`)
}
```

In turn, this is how the auto-generated usage information will look like:

```

  Usage: haha [options] [command]


  Commands:

    serve, s       Serve your static site
    help           Display help

  Options:

    -v, --version  Output the version number
    -r, --reload   Enable/disable livereloading
    -h, --help     Output usage information
    -p, --port     The port on which the app will be running

```

## API

### .option(name, description, default, init)

Register a new option for the binary in which it's being called.

- **name:** Takes a string which defines the name of the option. In this case, the first letter will be used as the short version (`port` => `-p, --port`). However, it can also be an array in which the first value defines the short version (`p` => `-p`) and the second one the long version (`packages` => `--packages`).
- **description:** A short explanation of what the option shall be used for. Will be outputted along with help.
- **default:** If it's defined, args will not only use it as a default value for the property, but it will also determine the type and append it to the usage info when the help gets outputted. For example: If the default param of an option named "package" contains an array, the usage information will look like this: `-p, --package <list>`.
- **init:** A function through which the option's value will be passed when used. The first paramater within said function will contain the option's value. If the parameter "default" is defined, args will provide a default initializer depending on the type of its value. For example: If "default" contains an integer, "init" will be `parseInt`.

### .options(list)

Takes in an array of objects that are each defining an option that shall be registered. This is basically a minimalistic way to register a huge list of options at once. Here's what each option object needs to look like:

```js
{
  name: 'port',
  description: 'The port on which the app runs',
  init: content => content,
  defaultValue: 3000
}
```

However, the keys `init` and `defaultValue` are not strictly required.

### .command(name, description, init, aliases)

Register a new sub command. Args requires all binaries to be defined in the style of git's. That means each sub command should be a separate binary called "&#60;parent-command&#62;-&#60;sub-command&#62;".

For example: If your main binary is called "muffin", the binary of the subcommand "muffin list" should be called "muffin-list". And all of them should be defined as such in your [package.json](https://docs.npmjs.com/files/package.json#bin).

- **name:** Takes a string which defines the name of the command. This value will be used when outputting the help.
- **description:** A short explanation of what the command shall be used for. Will be outputted along with help.
- **init:** If a function was passed through at this parameter, args will call it instead of running the binary related to that command. The function receives three arguments:

  ```js
  function aCommand (name, sub, options) {
    name // The name of the command
    sub // The output of .sub
    options // An object containing the options that have been used
  }
  ```

  Using an initializer is currently only recommended if your command doesn't need special/different options than the binary in which you're defining it. The reason for this is that the "options" argument of the upper function will contain the options registered within the current binary.

- **aliases:** Takes in an array of aliases which can be used to run the command.

### .example(usage, description)

Register an example which will be shown when calling `help`

- **usage:** Takes a string which defines your usage example command
- **description:** A short explanation of what the example shall be used for. Will be outputted along with help.

### .examples(list)
Takes in an array of objects that are each defining an example that shall be registered. This is basically a minimalistic way to register a huge list of examples at once. Here's what each option object needs to look like:

```js
{
  usage: 'args command -d',
  description: 'Run the args command with the option -d'
}
```

### .parse(argv, options)

This method takes the process' command line arguments (command and options) and uses the internal methods to get their values and assign them to the current instance of args. It needs to be run after all of the `.option` and `.command` calls. If you run it before them, the method calls after it won't take effect.

The methods also returns all options that have been used and their respective values.

- **argv:** Should be the process' argv: `process.argv`, for example.
- **options:** This parameter accepts an object containing several [configuration options](#configuration).

### .sub

This property exposes all sub arguments that have been parsed by [mri](https://npmjs.com/mri). This is useful when trying to get the value after the command, for example:

```bash
pizza ./directory
```

The upper path can now be loaded by doing:

```js
// Contains "./directory"
const path = args.sub[0]
```

This also works completely fine with sub commands: After you've registered a new command using `.command()`, you can easily check the following sub argument within its binary like mentioned above:

```bash
pizza eat ./directory
```

### .showHelp()

Outputs the usage information based on the options and comments you've registered so far and exits, if configured to do so.

### .showVersion()

Outputs the version and exits, if configured to do so.

## Configuration

By default, the module already registers some default options and commands (e.g. "version" and "help"). These things have been implemented to make creating CLIs easier for beginners. However, they can also be disabled by taking advantage of the following properties:

| Property | Description | Default&nbsp;value | Type |
| -------- | ----------- | ------------------ | ---- |
| exit | Automatically exits when help or version is rendered  | `{ help: true, version: true }` | Object |
| help | Automatically render the usage information when running `help`, `-h` or `--help` | true | Boolean |
| name | The name of your program to display in help | Name of script file | String |
| version | Outputs the version tag of your package.json | true | Boolean |
| usageFilter | Allows you to specify a filter through which the usage information will be passed before it gets outputted | null | Function |
| value | Suffix for the "Usage" section of the usage information ([example](https://github.com/leo/args/issues/13)) | null | String |
| mri | Additional parsing options to pass to mri, see [mri docs](https://github.com/lukeed/mri) for details | undefined | Object |
| mainColor | Specify the main color for the output when running the `help` command. See [chalk docs](https://github.com/chalk/chalk) for available colors / modifiers. You can specify multiple colors / modifiers with an array. For example: `{mainColor: ['red', 'bold', 'underline']}` | yellow | String[Array] |
| subColor | Specify the sub color for the output when running the `help` command. See [chalk docs](https://github.com/chalk/chalk) for available colors / modifiers. You can specify multiple colors / modifiers with an array. For example: `{subColor: ['dim', 'blue']}` | dim | String[Array] |

You can pass the configuration object as the second paramater of [.parse()](#parseargv-options).

## Contribute

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device
2. Link the package to the global module directory: `npm link`
3. Within the module you want to test your local development instance of args, just link it to the dependencies: `npm link args`. Instead of the default one from npm, node will now use your clone of args!

As always, you can run the [AVA](https://github.com/sindresorhus/ava) and [ESLint](http://eslint.org) tests using: `npm test`

## Special thanks

... to [Dmitry Smolin](https://github.com/dimsmol) who donated the package name. If you're looking for the old content (before I've added my stuff) of the package, you can find it [here](https://github.com/dimsmol/args).

## Authors

- Leo Lamprecht ([@notquiteleo](https://twitter.com/notquiteleo))
- Marvin Mieth ([@ntwcklng](https://twitter.com/ntwcklng))
