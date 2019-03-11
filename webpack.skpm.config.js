const path = require('path')

module.exports = (existingConfig, isCommand) => {
  if (!isCommand) {
    return
  }
  existingConfig.module.rules[0].include = [path.resolve(__dirname, "__tests__")]
}
