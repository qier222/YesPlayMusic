'use strict'

const chalk = require('chalk')
const utils = require('./utils')

const publicMethods = {
  option: require('./option'),
  options: require('./options'),
  command: require('./command'),
  parse: require('./parse'),
  example: require('./example'),
  examples: require('./examples'),
  showHelp: require('./help'),
  showVersion: require('./version')
}

function Args() {
  this.details = {
    options: [],
    commands: [],
    examples: []
  }

  // Configuration defaults
  this.config = {
    exit: { help: true, version: true },
    help: true,
    version: true,
    usageFilter: null,
    value: null,
    name: null,
    mainColor: 'yellow',
    subColor: 'dim'
  }

  this.printMainColor = chalk
  this.printSubColor = chalk
}

// Assign internal helpers
for (const util in utils) {
  if (!{}.hasOwnProperty.call(utils, util)) {
    continue
  }

  Args.prototype[util] = utils[util]
}

// Assign public methods
for (const method in publicMethods) {
  if (!{}.hasOwnProperty.call(publicMethods, method)) {
    continue
  }

  Args.prototype[method] = publicMethods[method]
}

module.exports = new Args()
module.exports.Args = Args;
