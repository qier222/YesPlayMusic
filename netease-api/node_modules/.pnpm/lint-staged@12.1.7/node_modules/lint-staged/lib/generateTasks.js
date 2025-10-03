import path from 'path'

import debug from 'debug'
import micromatch from 'micromatch'
import normalize from 'normalize-path'

const debugLog = debug('lint-staged:generateTasks')

/**
 * Generates all task commands, and filelist
 *
 * @param {object} options
 * @param {Object} [options.config] - Task configuration
 * @param {Object} [options.cwd] - Current working directory
 * @param {boolean} [options.gitDir] - Git root directory
 * @param {boolean} [options.files] - Staged filepaths
 * @param {boolean} [options.relative] - Whether filepaths to should be relative to gitDir
 */
export const generateTasks = ({ config, cwd = process.cwd(), gitDir, files, relative = false }) => {
  debugLog('Generating linter tasks')

  const absoluteFiles = files.map((file) => normalize(path.resolve(gitDir, file)))
  const relativeFiles = absoluteFiles.map((file) => normalize(path.relative(cwd, file)))

  return Object.entries(config).map(([rawPattern, commands]) => {
    let pattern = rawPattern

    const isParentDirPattern = pattern.startsWith('../')

    // Only worry about children of the CWD unless the pattern explicitly
    // specifies that it concerns a parent directory.
    const filteredFiles = relativeFiles.filter((file) => {
      if (isParentDirPattern) return true
      return !file.startsWith('..') && !path.isAbsolute(file)
    })

    const matches = micromatch(filteredFiles, pattern, {
      cwd,
      dot: true,
      // If the pattern doesn't look like a path, enable `matchBase` to
      // match against filenames in every directory. This makes `*.js`
      // match both `test.js` and `subdirectory/test.js`.
      matchBase: !pattern.includes('/'),
      strictBrackets: true,
    })

    const fileList = matches.map((file) => normalize(relative ? file : path.resolve(cwd, file)))

    const task = { pattern, commands, fileList }
    debugLog('Generated task: \n%O', task)

    return task
  })
}
