import { redBright, bold, yellow } from 'colorette'
import inspect from 'object-inspect'

import { error, info, warning } from './figures.js'

export const configurationError = (opt, helpMsg, value) =>
  `${redBright(`${error} Validation Error:`)}

  Invalid value for '${bold(opt)}': ${bold(
    inspect(value, { inlineCharacterLimit: Number.POSITIVE_INFINITY })
  )}

  ${helpMsg}`

export const NOT_GIT_REPO = redBright(`${error} Current directory is not a git directory!`)

export const FAILED_GET_STAGED_FILES = redBright(`${error} Failed to get staged files!`)

export const incorrectBraces = (before, after) =>
  yellow(
    `${warning} Detected incorrect braces with only single value: \`${before}\`. Reformatted as: \`${after}\`
`
  )

export const NO_STAGED_FILES = `${info} No staged files found.`

export const NO_TASKS = `${info} No staged files match any configured task.`

export const skippingBackup = (hasInitialCommit) => {
  const reason = hasInitialCommit ? '`--no-stash` was used' : 'there’s no initial commit yet'
  return yellow(`${warning} Skipping backup because ${reason}.\n`)
}

export const DEPRECATED_GIT_ADD = yellow(
  `${warning} Some of your tasks use \`git add\` command. Please remove it from the config since all modifications made by tasks will be automatically added to the git commit index.
`
)

export const TASK_ERROR = 'Skipped because of errors from tasks.'

export const SKIPPED_GIT_ERROR = 'Skipped because of previous git error.'

export const GIT_ERROR = `\n  ${redBright(`${error} lint-staged failed due to a git error.`)}`

export const invalidOption = (name, value, message) => `${redBright(`${error} Validation Error:`)}

  Invalid value for option '${bold(name)}': ${bold(value)}

  ${message}

See https://github.com/okonet/lint-staged#command-line-flags`

export const PREVENTED_EMPTY_COMMIT = `
  ${yellow(`${warning} lint-staged prevented an empty git commit.
  Use the --allow-empty option to continue, or check your task configuration`)}
`

export const RESTORE_STASH_EXAMPLE = `  Any lost modifications can be restored from a git stash:

    > git stash list
    stash@{0}: automatic lint-staged backup
    > git stash apply --index stash@{0}
`

export const CONFIG_STDIN_ERROR = 'Error: Could not read config from stdin.'
