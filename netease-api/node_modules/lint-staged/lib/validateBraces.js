import { incorrectBraces } from './messages.js'

/**
 * A correctly-formed brace expansion must contain unquoted opening and closing braces,
 * and at least one unquoted comma or a valid sequence expression.
 * Any incorrectly formed brace expansion is left unchanged.
 *
 * @see https://www.gnu.org/software/bash/manual/html_node/Brace-Expansion.html
 *
 * Lint-staged uses `micromatch` for brace expansion, and its behavior is to treat
 * invalid brace expansions as literal strings, which means they (typically) do not match
 * anything.
 *
 * This RegExp tries to match most cases of invalid brace expansions, so that they can be
 * detected, warned about, and re-formatted by removing the braces and thus hopefully
 * matching the files as intended by the user. The only real fix is to remove the incorrect
 * braces from user configuration, but this is left to the user (after seeing the warning).
 *
 * @example <caption>Globs with brace expansions</caption>
 * - *.{js,tx}         // expanded as *.js, *.ts
 * - *.{{j,t}s,css}    // expanded as *.js, *.ts, *.css
 * - file_{1..10}.css  // expanded as file_1.css, file_2.css, …, file_10.css
 *
 * @example <caption>Globs with incorrect brace expansions</caption>
 * - *.{js}       // should just be *.js
 * - *.{js,{ts}}  // should just be *.{js,ts}
 * - *.\{js\}     // escaped braces, so they're treated literally
 * - *.${js}      // dollar-sign inhibits expansion, so treated literally
 * - *.{js\,ts}   // the comma is escaped, so treated literally
 */
export const BRACES_REGEXP = /(?<![\\$])({)(?:(?!(?<!\\),|\.\.|\{|\}).)*?(?<!\\)(})/g

/**
 * @param {string} pattern
 * @returns {string}
 */
const withoutIncorrectBraces = (pattern) => {
  let output = `${pattern}`
  let match = null

  while ((match = BRACES_REGEXP.exec(pattern))) {
    const fullMatch = match[0]
    const withoutBraces = fullMatch.replace(/{/, '').replace(/}/, '')
    output = output.replace(fullMatch, withoutBraces)
  }

  return output
}

/**
 * Validate and remove incorrect brace expansions from glob pattern.
 * For example `*.{js}` is incorrect because it doesn't contain a `,` or `..`,
 * and will be reformatted as `*.js`.
 *
 * @param {string} pattern the glob pattern
 * @param {*} logger
 * @returns {string}
 */
export const validateBraces = (pattern, logger) => {
  const fixedPattern = withoutIncorrectBraces(pattern)

  if (fixedPattern !== pattern) {
    logger.warn(incorrectBraces(pattern, fixedPattern))
  }

  return fixedPattern
}
