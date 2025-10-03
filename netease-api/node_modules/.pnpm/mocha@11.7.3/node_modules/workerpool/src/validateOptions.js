/**
 * Validate that the object only contains known option names
 * - Throws an error when unknown options are detected
 * - Throws an error when some of the allowed options are attached
 * @param {Object | undefined} options
 * @param {string[]} allowedOptionNames
 * @param {string} objectName
 * @retrun {Object} Returns the original options
 */
exports.validateOptions = function validateOptions(options, allowedOptionNames, objectName) {
  if (!options) {
    return
  }

  var optionNames = options ?  Object.keys(options) : []

  // check for unknown properties
  var unknownOptionName = optionNames.find(optionName => !allowedOptionNames.includes(optionName))
  if (unknownOptionName) {
    throw new Error('Object "' + objectName + '" contains an unknown option "' + unknownOptionName + '"')
  }

  // check for inherited properties which are not present on the object itself
  var illegalOptionName = allowedOptionNames.find(allowedOptionName => {
    return Object.prototype[allowedOptionName] && !optionNames.includes(allowedOptionName)
  })
  if (illegalOptionName) {
    throw new Error('Object "' + objectName + '" contains an inherited option "' + illegalOptionName + '" which is ' +
      'not defined in the object itself but in its prototype. Only plain objects are allowed. ' +
      'Please remove the option from the prototype or override it with a value "undefined".')
  }

  return options
}

// source: https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker
exports.workerOptsNames = [
  'credentials', 'name', 'type' ]

// source: https://nodejs.org/api/child_process.html#child_processforkmodulepath-args-options
exports.forkOptsNames = [
  'cwd', 'detached', 'env', 'execPath', 'execArgv', 'gid', 'serialization',
  'signal', 'killSignal', 'silent', 'stdio', 'uid', 'windowsVerbatimArguments',
  'timeout'
]

// source: https://nodejs.org/api/worker_threads.html#new-workerfilename-options
exports.workerThreadOptsNames = [
  'argv', 'env', 'eval', 'execArgv', 'stdin', 'stdout', 'stderr', 'workerData',
  'trackUnmanagedFds', 'transferList', 'resourceLimits', 'name'
]
