'use strict'

module.exports = function(usage, description) {
  if (typeof usage !== 'string' || typeof description !== 'string') {
    throw new TypeError(
      'Usage for adding an Example: args.example("usage", "description")'
    )
  }

  this.details.examples.push({ usage, description })

  return this
}
