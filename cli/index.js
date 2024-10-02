const chalk = require('chalk')
const cliArgs = require('command-line-args')
const cliUsage = require('command-line-usage')

const aCaseOfNoMoreSnakes = (snakeCaseString) =>
  {
    const uppercaseStart = snakeCaseString[0]
    const lowerCaseNormalizedString = snakeCaseString.replace('_', ' ').toLowerCase()
    return uppercaseStart + lowerCaseNormalizedString.substring(1)
  }

class CLI {
  args = {}

  #validateArgs (optionDefinitions) {
    const missingArgs = []
    for (const optionDefinition of optionDefinitions) {
      let missing = false
      if (optionDefinition.required) {
        const optionHasAValue = !!this.args[optionDefinition.name]
        if (typeof optionDefinition.required === 'function') {
          missing = optionDefinition.required(this.args) && !optionHasAValue
        } else {
          missing = !optionHasAValue
        }
      }
      if (missing) {
        missingArgs.push(optionDefinition.name)
      }
    }
    return missingArgs
  }
  /**
   *
   * @param {object} configDefinition - Option definitions
   * @param {object} configDefinition.options - Options for the CLI as defined by command-line-args
   * @param {object} configDefinition.optionsUsage - Options usage as defined by command-line-usage
   */
  constructor (configDefinition) {
    try {
      this.args = cliArgs(configDefinition.options)
    } catch (error) {
      const normalizedErrorName = aCaseOfNoMoreSnakes(error.name)
      console.log(chalk.red(
        `${normalizedErrorName} ${error.optionName ? `\`${error.optionName}\`` : ''}`
      ))
      if (error.value) {
        console.log((`${chalk.italic('The unexpected value was:')} \`${error.value}\``))
      }
      process.exit(1)
    }
    let missingArgs
    if (!this.args.help) {
      missingArgs = this.#validateArgs(configDefinition.options)
      if (missingArgs.length !== 0) {
        console.log(`${chalk.italic('Missing options')}: ${missingArgs}`)
      }
    }
    if (this.args.help || missingArgs.length !== 0) {
      const usage = cliUsage(configDefinition.optionsUsage)
      console.log(usage)
      process.exit(1)
    }
  }
}

module.exports = CLI
