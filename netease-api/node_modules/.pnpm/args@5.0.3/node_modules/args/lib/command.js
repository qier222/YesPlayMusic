'use strict'

module.exports = function(usage, description, init, aliases) {
  if (Array.isArray(init)) {
    aliases = init
    init = undefined
  }

  if (aliases && Array.isArray(aliases)) {
    usage = [].concat([usage], aliases)
  }

  // Register command to global scope
  this.details.commands.push({
    usage,
    description,
    init: typeof init === 'function' ? init : false
  })

  // Allow chaining of .command()
  return this
}
