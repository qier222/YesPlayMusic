import { redBright, dim } from 'colorette'
import execa from 'execa'
import debug from 'debug'
import { parseArgsStringToArgv } from 'string-argv'

import { error, info } from './figures.js'
import { getInitialState } from './state.js'
import { TaskError } from './symbols.js'

const debugLog = debug('lint-staged:resolveTaskFn')

const getTag = ({ code, killed, signal }) => signal || (killed && 'KILLED') || code || 'FAILED'

/**
 * Handle task console output.
 *
 * @param {string} command
 * @param {Object} result
 * @param {string} result.stdout
 * @param {string} result.stderr
 * @param {boolean} result.failed
 * @param {boolean} result.killed
 * @param {string} result.signal
 * @param {Object} ctx
 * @returns {Error}
 */
const handleOutput = (command, result, ctx, isError = false) => {
  const { stderr, stdout } = result
  const hasOutput = !!stderr || !!stdout

  if (hasOutput) {
    const outputTitle = isError ? redBright(`${error} ${command}:`) : `${info} ${command}:`
    const output = []
      .concat(ctx.quiet ? [] : ['', outputTitle])
      .concat(stderr ? stderr : [])
      .concat(stdout ? stdout : [])
    ctx.output.push(output.join('\n'))
  } else if (isError) {
    // Show generic error when task had no output
    const tag = getTag(result)
    const message = redBright(`\n${error} ${command} failed without output (${tag}).`)
    if (!ctx.quiet) ctx.output.push(message)
  }
}

/**
 * Create a error output dependding on process result.
 *
 * @param {string} command
 * @param {Object} result
 * @param {string} result.stdout
 * @param {string} result.stderr
 * @param {boolean} result.failed
 * @param {boolean} result.killed
 * @param {string} result.signal
 * @param {Object} ctx
 * @returns {Error}
 */
const makeErr = (command, result, ctx) => {
  ctx.errors.add(TaskError)
  handleOutput(command, result, ctx, true)
  const tag = getTag(result)
  return new Error(`${redBright(command)} ${dim(`[${tag}]`)}`)
}

/**
 * Returns the task function for the linter.
 *
 * @param {Object} options
 * @param {string} options.command — Linter task
 * @param {string} [options.cwd]
 * @param {String} options.gitDir - Current git repo path
 * @param {Boolean} options.isFn - Whether the linter task is a function
 * @param {Array<string>} options.files — Filepaths to run the linter task against
 * @param {Boolean} [options.shell] — Whether to skip parsing linter task for better shell support
 * @param {Boolean} [options.verbose] — Always show task verbose
 * @returns {function(): Promise<Array<string>>}
 */
export const resolveTaskFn = ({
  command,
  cwd = process.cwd(),
  files,
  gitDir,
  isFn,
  shell = false,
  verbose = false,
}) => {
  const [cmd, ...args] = parseArgsStringToArgv(command)
  debugLog('cmd:', cmd)
  debugLog('args:', args)

  const execaOptions = {
    // Only use gitDir as CWD if we are using the git binary
    // e.g `npm` should run tasks in the actual CWD
    cwd: /^git(\.exe)?/i.test(cmd) ? gitDir : cwd,
    preferLocal: true,
    reject: false,
    shell,
  }

  debugLog('execaOptions:', execaOptions)

  return async (ctx = getInitialState()) => {
    const result = await (shell
      ? execa.command(isFn ? command : `${command} ${files.join(' ')}`, execaOptions)
      : execa(cmd, isFn ? args : args.concat(files), execaOptions))

    if (result.failed || result.killed || result.signal != null) {
      throw makeErr(command, result, ctx)
    }

    if (verbose) {
      handleOutput(command, result, ctx)
    }
  }
}
