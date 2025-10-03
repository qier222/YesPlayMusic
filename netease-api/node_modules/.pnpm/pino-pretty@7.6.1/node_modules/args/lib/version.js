'use strict'

const fs = require('fs')
const path = require('path')

/**
 * Retrieves the main module package.json information.
 *
 * @param {string} directory
 *   The directory to start looking in.
 *
 * @return {Object|null}
 *   An object containing the package.json contents or NULL if it could not be found.
 */
function findPackage(directory) {
  const file = path.resolve(directory, 'package.json')
  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    return require(file)
  }

  const parent = path.resolve(directory, '..')
  return parent === directory ? null : findPackage(parent)
}

module.exports = function() {
  const pkg = findPackage(path.dirname(process.mainModule.filename))
  const version = (pkg && pkg.version) || '-/-'

  console.log(version)

  if (this.config.exit && this.config.exit.version) {
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit()
  }
}
