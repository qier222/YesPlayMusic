const { splatSet } = require("./utils")

module.exports = { verifyWithSharedScopes }

function verifyWithSharedScopes(codeParts, verifyCodePart, parserOptions) {
  // First pass: collect needed globals and declared globals for each script tags.
  const firstPassValues = []

  for (const codePart of codeParts) {
    verifyCodePart(codePart, {
      prepare(context, program) {
        const globalScope = getGlobalScope(context, program)
        // See https://github.com/eslint/eslint/blob/4b267a5c8a42477bb2384f33b20083ff17ad578c/lib/rules/no-redeclare.js#L67-L78
        let scopeForDeclaredGlobals
        if (
          parserOptions.ecmaFeatures &&
          parserOptions.ecmaFeatures.globalReturn
        ) {
          scopeForDeclaredGlobals = globalScope.childScopes[0]
        } else {
          scopeForDeclaredGlobals = globalScope
        }

        firstPassValues.push({
          codePart,
          exportedGlobals: globalScope.through.map(
            (node) => node.identifier.name
          ),
          declaredGlobals: scopeForDeclaredGlobals.variables.map(
            (variable) => variable.name
          ),
        })
      },
      ignoreRules: true,
    })
  }

  // Second pass: declare variables for each script scope, then run eslint.
  for (let i = 0; i < firstPassValues.length; i += 1) {
    verifyCodePart(firstPassValues[i].codePart, {
      prepare(context, program) {
        const exportedGlobals = splatSet(
          firstPassValues
            .slice(i + 1)
            .map((nextValues) => nextValues.exportedGlobals)
        )
        for (const name of exportedGlobals)
          markGlobalVariableAsUsed(context, program, name)

        const declaredGlobals = splatSet(
          firstPassValues
            .slice(0, i)
            .map((previousValues) => previousValues.declaredGlobals)
        )
        const scope = getGlobalScope(context, program)
        scope.through = scope.through.filter((variable) => {
          return !declaredGlobals.has(variable.identifier.name)
        })
      },
    })
  }
}

function markGlobalVariableAsUsed(context, program, name) {
  const sourceCode = context.getSourceCode()

  if (sourceCode.markVariableAsUsed) {
    sourceCode.markVariableAsUsed(name, program)
  } else {
    context.markVariableAsUsed(name)
  }
}

function getGlobalScope(context, program) {
  const sourceCode = context.getSourceCode()
  if (sourceCode.getScope) {
    // eslint 9+
    return sourceCode.getScope(program)
  }
  return context.getScope()
}
