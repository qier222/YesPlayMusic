'use strict';

/**
 * Metadata about various options of the `run` command
 * @see module:lib/cli/run
 * @module
 * @private
 */

/**
 * Dictionary of yargs option types to list of options having said type
 * @type {Record<string, string[]>}
 * @private
 */
const TYPES = (exports.types = {
  array: [
    'extension',
    'file',
    'global',
    'ignore',
    'node-option',
    'reporter-option',
    'require',
    'spec',
    'watch-files',
    'watch-ignore'
  ],
  boolean: [
    'allow-uncaught',
    'async-only',
    'bail',
    'check-leaks',
    'color',
    'delay',
    'diff',
    'dry-run',
    'exit',
    'pass-on-failing-test-suite',
    'fail-zero',
    'forbid-only',
    'forbid-pending',
    'full-trace',
    'inline-diffs',
    'invert',
    'list-interfaces',
    'list-reporters',
    'no-colors',
    'parallel',
    'posix-exit-codes',
    'recursive',
    'sort',
    'watch'
  ],
  number: ['retries', 'jobs'],
  string: [
    'config',
    'fgrep',
    'grep',
    'package',
    'reporter',
    'ui',
    'slow',
    'timeout'
  ]
});

/**
 * Option aliases keyed by canonical option name.
 * Arrays used to reduce
 * @type {Record<string, string[]>}
 * @private
 */
exports.aliases = {
  'async-only': ['A'],
  bail: ['b'],
  color: ['c', 'colors'],
  fgrep: ['f'],
  global: ['globals'],
  grep: ['g'],
  ignore: ['exclude'],
  invert: ['i'],
  jobs: ['j'],
  'no-colors': ['C'],
  'node-option': ['n'],
  parallel: ['p'],
  reporter: ['R'],
  'reporter-option': ['reporter-options', 'O'],
  require: ['r'],
  slow: ['s'],
  sort: ['S'],
  timeout: ['t', 'timeouts'],
  ui: ['u'],
  watch: ['w']
};

const ALL_MOCHA_FLAGS = Object.keys(TYPES).reduce((acc, key) => {
  // gets all flags from each of the fields in `types`, adds those,
  // then adds aliases of each flag (if any)
  TYPES[key].forEach(flag => {
    acc.add(flag);
    const aliases = exports.aliases[flag] || [];
    aliases.forEach(alias => {
      acc.add(alias);
    });
  });
  return acc;
}, new Set());

/**
 * Returns `true` if the provided `flag` is known to Mocha.
 * @param {string} flag - Flag to check
 * @returns {boolean} If `true`, this is a Mocha flag
 * @private
 */
exports.isMochaFlag = flag => {
  return ALL_MOCHA_FLAGS.has(flag.replace(/^--?/, ''));
};

/**
 * Returns expected yarg option type for a given mocha flag.
 * @param {string} flag - Flag to check (can be with or without leading dashes "--"")
 * @returns {string | undefined} - If flag is a valid mocha flag, the expected type of argument for this flag is returned, otherwise undefined is returned.
 * @private
 */
exports.expectedTypeForFlag = flag => {
  const normalizedName = flag.replace(/^--?/, '');

  // If flag is an alias, get it's full name.
  const aliases = exports.aliases;
  const fullFlagName =
    Object.keys(aliases).find(flagName =>
      aliases[flagName].includes(normalizedName)
    ) || normalizedName;

  return Object.keys(TYPES).find(flagType =>
    TYPES[flagType].includes(fullFlagName)
  );
};
