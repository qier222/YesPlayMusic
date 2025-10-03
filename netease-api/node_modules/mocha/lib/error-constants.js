'use strict';

/**
 * When Mocha throws exceptions (or rejects `Promise`s), it attempts to assign a `code` property to the `Error` object, for easier handling. These are the potential values of `code`.
 * @public
 * @namespace
 * @memberof module:lib/errors
 */
var constants = {
  /**
   * An unrecoverable error.
   * @constant
   * @default
   */
  FATAL: 'ERR_MOCHA_FATAL',

  /**
   * The type of an argument to a function call is invalid
   * @constant
   * @default
   */
  INVALID_ARG_TYPE: 'ERR_MOCHA_INVALID_ARG_TYPE',

  /**
   * The value of an argument to a function call is invalid
   * @constant
   * @default
   */
  INVALID_ARG_VALUE: 'ERR_MOCHA_INVALID_ARG_VALUE',

  /**
   * Something was thrown, but it wasn't an `Error`
   * @constant
   * @default
   */
  INVALID_EXCEPTION: 'ERR_MOCHA_INVALID_EXCEPTION',

  /**
   * An interface (e.g., `Mocha.interfaces`) is unknown or invalid
   * @constant
   * @default
   */
  INVALID_INTERFACE: 'ERR_MOCHA_INVALID_INTERFACE',

  /**
   * A reporter (.e.g, `Mocha.reporters`) is unknown or invalid
   * @constant
   * @default
   */
  INVALID_REPORTER: 'ERR_MOCHA_INVALID_REPORTER',

  /**
   * `done()` was called twice in a `Test` or `Hook` callback
   * @constant
   * @default
   */
  MULTIPLE_DONE: 'ERR_MOCHA_MULTIPLE_DONE',

  /**
   * No files matched the pattern provided by the user
   * @constant
   * @default
   */
  NO_FILES_MATCH_PATTERN: 'ERR_MOCHA_NO_FILES_MATCH_PATTERN',

  /**
   * Known, but unsupported behavior of some kind
   * @constant
   * @default
   */
  UNSUPPORTED: 'ERR_MOCHA_UNSUPPORTED',

  /**
   * Invalid state transition occurring in `Mocha` instance
   * @constant
   * @default
   */
  INSTANCE_ALREADY_RUNNING: 'ERR_MOCHA_INSTANCE_ALREADY_RUNNING',

  /**
   * Invalid state transition occurring in `Mocha` instance
   * @constant
   * @default
   */
  INSTANCE_ALREADY_DISPOSED: 'ERR_MOCHA_INSTANCE_ALREADY_DISPOSED',

  /**
   * Use of `only()` w/ `--forbid-only` results in this error.
   * @constant
   * @default
   */
  FORBIDDEN_EXCLUSIVITY: 'ERR_MOCHA_FORBIDDEN_EXCLUSIVITY',

  /**
   * To be thrown when a user-defined plugin implementation (e.g., `mochaHooks`) is invalid
   * @constant
   * @default
   */
  INVALID_PLUGIN_IMPLEMENTATION: 'ERR_MOCHA_INVALID_PLUGIN_IMPLEMENTATION',

  /**
   * To be thrown when a builtin or third-party plugin definition (the _definition_ of `mochaHooks`) is invalid
   * @constant
   * @default
   */
  INVALID_PLUGIN_DEFINITION: 'ERR_MOCHA_INVALID_PLUGIN_DEFINITION',

  /**
   * When a runnable exceeds its allowed run time.
   * @constant
   * @default
   */
  TIMEOUT: 'ERR_MOCHA_TIMEOUT',

  /**
   * Input file is not able to be parsed
   * @constant
   * @default
   */
  UNPARSABLE_FILE: 'ERR_MOCHA_UNPARSABLE_FILE'
};

module.exports = { constants };
