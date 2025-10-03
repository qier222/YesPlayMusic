'use strict'

module.exports = function(list) {
  if (list.constructor !== Array) {
    throw new Error('Item passed to .examples is not an array')
  }

  for (const item of list) {
    const usage = item.usage || false
    const description = item.description || false
    this.example(usage, description)
  }

  return this
}
