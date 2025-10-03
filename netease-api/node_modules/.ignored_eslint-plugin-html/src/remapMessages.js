module.exports = { remapMessages }

function remapMessages(messages, hasBOM, codePart) {
  const newMessages = []

  for (const message of messages) {
    if (remapMessage(message, hasBOM, codePart)) {
      newMessages.push(message)
    }
  }

  return newMessages
}

function remapMessage(message, hasBOM, codePart) {
  if (!message.line || !message.column) {
    // Some messages apply to the whole file instead of a particular code location. In particular:
    // * @typescript-eslint/parser may send messages with no line/column
    // * eslint-plugin-eslint-comments send messages with column=0 to bypass ESLint ignore comments.
    //   See https://github.com/BenoitZugmeyer/eslint-plugin-html/issues/70
    // For now, just include them in the output. In the future, we should make sure those messages
    // are not print twice.
    return true
  }

  const location = codePart.originalLocation({
    line: message.line,
    column: message.column,
  })

  // Ignore messages if they were in transformed code
  if (!location) {
    return false
  }

  Object.assign(message, location)
  message.source = codePart.getOriginalLine(location.line)

  // Map fix range
  if (message.fix && message.fix.range) {
    const bomOffset = hasBOM ? -1 : 0
    message.fix.range = [
      codePart.originalIndex(message.fix.range[0]) + bomOffset,
      // The range end is exclusive, meaning it should replace all characters  with indexes from
      // start to end - 1. We have to get the original index of the last targeted character.
      codePart.originalIndex(message.fix.range[1] - 1) + 1 + bomOffset,
    ]
  }

  // Map end location
  if (message.endLine && message.endColumn) {
    const endLocation = codePart.originalLocation({
      line: message.endLine,
      column: message.endColumn,
    })
    if (endLocation) {
      message.endLine = endLocation.line
      message.endColumn = endLocation.column
    }
  }

  return true
}
