'use strict'

const { isColorSupported } = require('colorette')
const pump = require('pump')
const { Transform } = require('readable-stream')
const abstractTransport = require('pino-abstract-transport')
const sjs = require('secure-json-parse')
const colors = require('./lib/colors')
const { ERROR_LIKE_KEYS, MESSAGE_KEY, TIMESTAMP_KEY, LEVEL_KEY, LEVEL_NAMES } = require('./lib/constants')
const {
  isObject,
  prettifyErrorLog,
  prettifyLevel,
  prettifyMessage,
  prettifyMetadata,
  prettifyObject,
  prettifyTime,
  buildSafeSonicBoom,
  filterLog
} = require('./lib/utils')

const jsonParser = input => {
  try {
    return { value: sjs.parse(input, { protoAction: 'remove' }) }
  } catch (err) {
    return { err }
  }
}

const defaultOptions = {
  colorize: isColorSupported,
  crlf: false,
  errorLikeObjectKeys: ERROR_LIKE_KEYS,
  errorProps: '',
  customLevels: null,
  customColors: null,
  useOnlyCustomProps: true,
  levelFirst: false,
  messageKey: MESSAGE_KEY,
  messageFormat: false,
  timestampKey: TIMESTAMP_KEY,
  translateTime: false,
  useMetadata: false,
  outputStream: process.stdout,
  customPrettifiers: {},
  hideObject: false,
  singleLine: false
}

function prettyFactory (options) {
  const opts = Object.assign({}, defaultOptions, options)
  const EOL = opts.crlf ? '\r\n' : '\n'
  const IDENT = '    '
  const messageKey = opts.messageKey
  const levelKey = opts.levelKey
  const levelLabel = opts.levelLabel
  const minimumLevel = opts.minimumLevel
  const messageFormat = opts.messageFormat
  const timestampKey = opts.timestampKey
  const errorLikeObjectKeys = opts.errorLikeObjectKeys
  const errorProps = opts.errorProps.split(',')
  const useOnlyCustomProps = typeof opts.useOnlyCustomProps === 'boolean' ? opts.useOnlyCustomProps : opts.useOnlyCustomProps === 'true'
  const customLevels = opts.customLevels
    ? opts.customLevels
        .split(',')
        .reduce((agg, value, idx) => {
          const [levelName, levelIdx = idx] = value.split(':')

          agg[levelIdx] = levelName.toUpperCase()

          return agg
        }, { default: 'USERLVL' })
    : {}
  const customLevelNames = opts.customLevels
    ? opts.customLevels
        .split(',')
        .reduce((agg, value, idx) => {
          const [levelName, levelIdx = idx] = value.split(':')

          agg[levelName.toLowerCase()] = levelIdx

          return agg
        }, {})
    : {}
  const customColors = opts.customColors
    ? opts.customColors
        .split(',')
        .reduce((agg, value) => {
          const [level, color] = value.split(':')

          const condition = useOnlyCustomProps ? opts.customLevels : customLevelNames[level] !== undefined
          const levelNum = condition ? customLevelNames[level] : LEVEL_NAMES[level]
          const colorIdx = levelNum !== undefined ? levelNum : level

          agg.push([colorIdx, color])

          return agg
        }, [])
    : undefined
  const customProps = {
    customLevels,
    customLevelNames
  }
  if (useOnlyCustomProps && !opts.customLevels) {
    customProps.customLevels = undefined
    customProps.customLevelNames = undefined
  }
  const customPrettifiers = opts.customPrettifiers
  const ignoreKeys = opts.ignore ? new Set(opts.ignore.split(',')) : undefined
  const hideObject = opts.hideObject
  const singleLine = opts.singleLine
  const colorizer = colors(opts.colorize, customColors, useOnlyCustomProps)

  return pretty

  function pretty (inputData) {
    let log
    if (!isObject(inputData)) {
      const parsed = jsonParser(inputData)
      if (parsed.err || !isObject(parsed.value)) {
        // pass through
        return inputData + EOL
      }
      log = parsed.value
    } else {
      log = inputData
    }

    if (minimumLevel) {
      const condition = useOnlyCustomProps ? opts.customLevels : customLevelNames[minimumLevel] !== undefined
      const minimum = (condition ? customLevelNames[minimumLevel] : LEVEL_NAMES[minimumLevel]) || Number(minimumLevel)
      const level = log[levelKey === undefined ? LEVEL_KEY : levelKey]
      if (level < minimum) return
    }

    const prettifiedMessage = prettifyMessage({ log, messageKey, colorizer, messageFormat, levelLabel, ...customProps, useOnlyCustomProps })

    if (ignoreKeys) {
      log = filterLog(log, ignoreKeys)
    }

    const prettifiedLevel = prettifyLevel({ log, colorizer, levelKey, prettifier: customPrettifiers.level, ...customProps })
    const prettifiedMetadata = prettifyMetadata({ log, prettifiers: customPrettifiers })
    const prettifiedTime = prettifyTime({ log, translateFormat: opts.translateTime, timestampKey, prettifier: customPrettifiers.time })

    let line = ''
    if (opts.levelFirst && prettifiedLevel) {
      line = `${prettifiedLevel}`
    }

    if (prettifiedTime && line === '') {
      line = `${prettifiedTime}`
    } else if (prettifiedTime) {
      line = `${line} ${prettifiedTime}`
    }

    if (!opts.levelFirst && prettifiedLevel) {
      if (line.length > 0) {
        line = `${line} ${prettifiedLevel}`
      } else {
        line = prettifiedLevel
      }
    }

    if (prettifiedMetadata) {
      if (line.length > 0) {
        line = `${line} ${prettifiedMetadata}:`
      } else {
        line = prettifiedMetadata
      }
    }

    if (line.endsWith(':') === false && line !== '') {
      line += ':'
    }

    if (prettifiedMessage) {
      if (line.length > 0) {
        line = `${line} ${prettifiedMessage}`
      } else {
        line = prettifiedMessage
      }
    }

    if (line.length > 0 && !singleLine) {
      line += EOL
    }

    // pino@7+ does not log this anymore
    if (log.type === 'Error' && log.stack) {
      const prettifiedErrorLog = prettifyErrorLog({
        log,
        errorLikeKeys: errorLikeObjectKeys,
        errorProperties: errorProps,
        ident: IDENT,
        eol: EOL
      })
      if (singleLine) line += EOL
      line += prettifiedErrorLog
    } else if (!hideObject) {
      const skipKeys = [messageKey, levelKey, timestampKey].filter(key => typeof log[key] === 'string' || typeof log[key] === 'number')
      const prettifiedObject = prettifyObject({
        input: log,
        skipKeys,
        customPrettifiers,
        errorLikeKeys: errorLikeObjectKeys,
        eol: EOL,
        ident: IDENT,
        singleLine,
        colorizer
      })

      // In single line mode, include a space only if prettified version isn't empty
      if (singleLine && !/^\s$/.test(prettifiedObject)) {
        line += ' '
      }
      line += prettifiedObject
    }

    return line
  }
}

function build (opts = {}) {
  const pretty = prettyFactory(opts)
  return abstractTransport(function (source) {
    const stream = new Transform({
      objectMode: true,
      autoDestroy: true,
      transform (chunk, enc, cb) {
        const line = pretty(chunk)
        cb(null, line)
      }
    })

    let destination

    if (typeof opts.destination === 'object' && typeof opts.destination.write === 'function') {
      destination = opts.destination
    } else {
      destination = buildSafeSonicBoom({
        dest: opts.destination || 1,
        append: opts.append,
        mkdir: opts.mkdir,
        sync: opts.sync // by default sonic will be async
      })
    }

    source.on('unknown', function (line) {
      destination.write(line + '\n')
    })

    pump(source, stream, destination)
    return stream
  }, { parse: 'lines' })
}

module.exports = build
module.exports.prettyFactory = prettyFactory
module.exports.colorizerFactory = colors
module.exports.default = build
