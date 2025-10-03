'use strict'

module.exports = function(name, description, defaultValue, init) {
  let usage = []

  const assignShort = (name, options, short) => {
    if (options.find(flagName => flagName.usage[0] === short)) {
      short = name.charAt(0).toUpperCase()
    }

    return [short, name]
  }

  // If name is an array, pick the values
  // Otherwise just use the whole thing
  switch (name.constructor) {
    case String:
      usage = assignShort(name, this.details.options, name.charAt(0))
      break
    case Array:
      usage = usage.concat(name)
      break
    default:
      throw new Error('Invalid name for option')
  }

  // Throw error if short option is too long
  if (usage.length > 0 && usage[0].length > 1) {
    throw new Error('Short version of option is longer than 1 char')
  }

  const optionDetails = {
    defaultValue,
    usage,
    description
  }

  let defaultIsWrong

  switch (defaultValue) {
    case false:
      defaultIsWrong = true
      break
    case null:
      defaultIsWrong = true
      break
    case undefined:
      defaultIsWrong = true
      break
    default:
      defaultIsWrong = false
  }

  if (typeof init === 'function') {
    optionDetails.init = init
  } else if (!defaultIsWrong) {
    // Set initializer depending on type of default value
    optionDetails.init = this.handleType(defaultValue)[1]
  }

  // Register option to global scope
  this.details.options.push(optionDetails)

  // Allow chaining of .option()
  return this
}
