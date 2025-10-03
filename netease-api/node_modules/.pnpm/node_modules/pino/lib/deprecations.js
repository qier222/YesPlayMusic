'use strict'

const warning = require('process-warning')()
module.exports = warning

const warnName = 'PinoWarning'

warning.create(warnName, 'PINODEP004', 'bindings.serializers is deprecated, use options.serializers option instead')

warning.create(warnName, 'PINODEP005', 'bindings.formatters is deprecated, use options.formatters option instead')

warning.create(warnName, 'PINODEP006', 'bindings.customLevels is deprecated, use options.customLevels option instead')

warning.create(warnName, 'PINODEP007', 'bindings.level is deprecated, use options.level option instead')
