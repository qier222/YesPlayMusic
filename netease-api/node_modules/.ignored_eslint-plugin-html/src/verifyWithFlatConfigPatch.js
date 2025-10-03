const getSettings = require("./settings").getSettings
const getFileMode = require("./getFileMode")
const extract = require("./extract")
const { verifyWithSharedScopes } = require("./verifyWithSharedScopes")
const { remapMessages } = require("./remapMessages")
const pluginReference = require("./pluginReference")

const PREPARE_RULE_NAME = "__eslint-plugin-html-prepare"
const PREPARE_PLUGIN_NAME = "__eslint-plugin-html-prepare"

module.exports = { createVerifyWithFlatConfigPatch }

function createVerifyWithFlatConfigPatch(eslintModule, verifyWithFlatConfig) {
  return function (textOrSourceCode, providedConfig, providedOptions) {
    const callOriginalVerify = () =>
      verifyWithFlatConfig.call(
        this,
        textOrSourceCode,
        providedConfig,
        providedOptions
      )

    if (!Object.values(providedConfig.plugins).includes(pluginReference)) {
      return callOriginalVerify()
    }

    const pluginSettings = getSettings(providedConfig.settings || {})
    const mode = getFileMode(pluginSettings, providedOptions.filename)

    if (!mode) {
      return callOriginalVerify()
    }

    let messages
    ;[messages, providedConfig] = verifyExternalHtmlPlugin(
      eslintModule,
      providedConfig,
      callOriginalVerify
    )

    const extractResult = extract(
      textOrSourceCode,
      mode === "xml",
      pluginSettings
    )

    if (pluginSettings.reportBadIndent) {
      messages.push(
        ...extractResult.badIndentationLines.map((line) => ({
          message: "Bad line indentation.",
          line,
          column: 1,
          ruleId: "(html plugin)",
          severity: pluginSettings.reportBadIndent,
        }))
      )
    }

    // Save code parts parsed source code so we don't have to parse it twice
    const sourceCodes = new WeakMap()
    const verifyCodePart = (codePart, { prepare, ignoreRules } = {}) => {
      providedConfig.plugins[PREPARE_PLUGIN_NAME] = {
        rules: {
          [PREPARE_RULE_NAME]: {
            create(context) {
              sourceCodes.set(codePart, context.getSourceCode())
              return {
                Program(program) {
                  if (prepare) {
                    prepare(context, program)
                  }
                },
              }
            },
          },
        },
      }

      const localMessages = verifyWithFlatConfig.call(
        this,
        sourceCodes.get(codePart) || String(codePart),
        createNewConfig(providedConfig, {
          rules: {
            [`${PREPARE_PLUGIN_NAME}/${PREPARE_RULE_NAME}`]: "error",
            ...(!ignoreRules && providedConfig.rules),
          },
        }),
        ignoreRules
          ? {
              ...providedOptions,
              reportUnusedDisableDirectives: false,
            }
          : providedOptions
      )

      messages.push(
        ...remapMessages(localMessages, extractResult.hasBOM, codePart)
      )
    }

    const languageOptions = providedConfig.languageOptions || {}
    const parserOptions = languageOptions.parserOptions || {}
    const sourceType = languageOptions.sourceType || parserOptions.sourceType
    if (sourceType === "module") {
      for (const codePart of extractResult.code) {
        verifyCodePart(codePart)
      }
    } else {
      verifyWithSharedScopes(extractResult.code, verifyCodePart, parserOptions)
    }

    messages.sort((ma, mb) => ma.line - mb.line || ma.column - mb.column)

    return messages
  }
}

const externalHtmlPlugins = [
  { parser: "@html-eslint/parser", plugin: "@html-eslint/eslint-plugin" },
]

function tryRequire(name) {
  try {
    return require(name)
  } catch {
    return undefined
  }
}

function findExternalHtmlPluginName(config) {
  if (!config.languageOptions || !config.languageOptions.parser) {
    return
  }
  for (const { parser, plugin } of externalHtmlPlugins) {
    let parserModule = tryRequire(parser)
    if (config.languageOptions.parser === parserModule) {
      const pluginModule = tryRequire(plugin)
      for (const [name, plugin] of Object.entries(config.plugins)) {
        if (plugin === pluginModule) {
          return name
        }
      }
    }
  }
}

function verifyExternalHtmlPlugin(eslintModule, config, callOriginalVerify) {
  const htmlPluginName = findExternalHtmlPluginName(config)
  if (!htmlPluginName) {
    return [[], config]
  }

  const rules = {}
  for (const name in config.rules) {
    if (!name.startsWith(htmlPluginName + "/")) {
      rules[name] = config.rules[name]
    }
  }

  return [
    callOriginalVerify(),
    createNewConfig(config, {
      languageOptions: {
        ...config.languageOptions,
        parser: eslintModule.require("espree"),
      },
      rules,
    }),
  ]
}

/**
 * Creates a clone of the provided config object so it can be modified without affecting the
 * original.
 */
function createNewConfig(originalConfig, overrides) {
  return Object.setPrototypeOf(overrides, originalConfig)
}
