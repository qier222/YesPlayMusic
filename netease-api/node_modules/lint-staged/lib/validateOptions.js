import { constants, promises as fs } from 'fs'

import debug from 'debug'

import { invalidOption } from './messages.js'
import { InvalidOptionsError } from './symbols.js'

const debugLog = debug('lint-staged:validateOptions')

/**
 * Validate lint-staged options, either from the Node.js API or the command line flags.
 * @param {*} options
 * @param {boolean|string} [options.shell] - Skip parsing of tasks for better shell support
 *
 * @throws {InvalidOptionsError}
 */
export const validateOptions = async (options = {}, logger) => {
  debugLog('Validating options...')

  /** Ensure the passed shell option is executable */
  if (typeof options.shell === 'string') {
    try {
      await fs.access(options.shell, constants.X_OK)
    } catch (error) {
      logger.error(invalidOption('shell', options.shell, error.message))
      throw InvalidOptionsError
    }
  }

  debugLog('Validated options!')
}
