#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import cmdline from 'commander'
import debug from 'debug'
import supportsColor from 'supports-color'

import lintStaged from '../lib/index.js'
import { CONFIG_STDIN_ERROR } from '../lib/messages.js'

// Force colors for packages that depend on https://www.npmjs.com/package/supports-color
if (supportsColor.stdout) {
  process.env.FORCE_COLOR = supportsColor.stdout.level.toString()
}

// Do not terminate main Listr process on SIGINT
process.on('SIGINT', () => {})

const packageJsonPath = path.join(fileURLToPath(import.meta.url), '../../package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath))
const version = packageJson.version

cmdline
  .version(version)
  .option('--allow-empty', 'allow empty commits when tasks revert all staged changes', false)
  .option('-c, --config [path]', 'path to configuration file, or - to read from stdin')
  .option('-d, --debug', 'print additional debug information', false)
  .option('--no-stash', 'disable the backup stash, and do not revert in case of errors', false)
  .option(
    '-p, --concurrent <parallel tasks>',
    'the number of tasks to run concurrently, or false to run tasks serially',
    true
  )
  .option('-q, --quiet', 'disable lint-staged’s own console output', false)
  .option('-r, --relative', 'pass relative filepaths to tasks', false)
  .option('-x, --shell [path]', 'skip parsing of tasks for better shell support', false)
  .option(
    '-v, --verbose',
    'show task output even when tasks succeed; by default only failed output is shown',
    false
  )
  .parse(process.argv)

const cmdlineOptions = cmdline.opts()

if (cmdlineOptions.debug) {
  debug.enable('lint-staged*')
}

const debugLog = debug('lint-staged:bin')
debugLog('Running `lint-staged@%s`', version)

/**
 * Get the maximum length of a command-line argument string based on current platform
 *
 * https://serverfault.com/questions/69430/what-is-the-maximum-length-of-a-command-line-in-mac-os-x
 * https://support.microsoft.com/en-us/help/830473/command-prompt-cmd-exe-command-line-string-limitation
 * https://unix.stackexchange.com/a/120652
 */
const getMaxArgLength = () => {
  switch (process.platform) {
    case 'darwin':
      return 262144
    case 'win32':
      return 8191
    default:
      return 131072
  }
}

const options = {
  allowEmpty: !!cmdlineOptions.allowEmpty,
  concurrent: JSON.parse(cmdlineOptions.concurrent),
  configPath: cmdlineOptions.config,
  debug: !!cmdlineOptions.debug,
  maxArgLength: getMaxArgLength() / 2,
  stash: !!cmdlineOptions.stash, // commander inverts `no-<x>` flags to `!x`
  quiet: !!cmdlineOptions.quiet,
  relative: !!cmdlineOptions.relative,
  shell: cmdlineOptions.shell /* Either a boolean or a string pointing to the shell */,
  verbose: !!cmdlineOptions.verbose,
}

debugLog('Options parsed from command-line:', options)

if (options.configPath === '-') {
  delete options.configPath
  try {
    options.config = fs.readFileSync(process.stdin.fd, 'utf8').toString().trim()
  } catch {
    console.error(CONFIG_STDIN_ERROR)
    process.exit(1)
  }

  try {
    options.config = JSON.parse(options.config)
  } catch {
    // Let config parsing complain if it's not JSON
  }
}

lintStaged(options)
  .then((passed) => {
    process.exitCode = passed ? 0 : 1
  })
  .catch(() => {
    process.exitCode = 1
  })
