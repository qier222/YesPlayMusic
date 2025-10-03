'use strict'

module.exports = function() {
  const name = this.config.name || this.binary.replace('-', ' ')
  const capitalize = word => word.charAt(0).toUpperCase() + word.substr(1)

  const parts = []

  const groups = {
    commands: true,
    options: true,
    examples: true
  }

  for (const group in groups) {
    if (this.details[group].length > 0) {
      continue
    }

    groups[group] = false
  }

  const optionHandle = groups.options ? '[options] ' : ''
  const cmdHandle = groups.commands ? '[command]' : ''
  const value =
    typeof this.config.value === 'string' ? ' ' + this.config.value : ''

  parts.push([
    `  Usage: ${this.printMainColor(name)} ${this.printSubColor(
      optionHandle + cmdHandle + value
    )}`,
    ''
  ])

  for (const group in groups) {
    if (!groups[group]) {
      continue
    }

    parts.push(['', capitalize(group) + ':', ''])

    if (group === 'examples') {
      parts.push(this.generateExamples())
    } else {
      parts.push(this.generateDetails(group))
    }

    parts.push(['', ''])
  }

  let output = ''

  // And finally, merge and output them
  for (const part of parts) {
    output += part.join('\n  ')
  }

  if (!groups.commands && !groups.options) {
    output = 'No sub commands or options available'
  }

  const { usageFilter } = this.config

  // If filter is available, pass usage information through
  if (typeof usageFilter === 'function') {
    output = usageFilter(output) || output
  }

  console.log(output)

  if (this.config.exit && this.config.exit.help) {
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit()
  }
}
