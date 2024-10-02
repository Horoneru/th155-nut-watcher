const { promisify } = require('util')
const { exec: callbackExec, execSync } = require('child_process')
const { rename, existsSync, mkdirSync, writeFileSync, readFileSync } = require('fs')
const exec = promisify(callbackExec)
const chokidar = require('chokidar')
const chalk = require('chalk')
const path = require('path')
const os = require('os')

const UNIVERSAL_PATH_DELIMITER = '/'
const WINDOWS_PATH_DELIMITER = '\\'
const BUNDLED_SQUIRREL_COMPILER_EXECUTABLE = path.join(__dirname, './assets/sq.exe')
// This should be enough time for the compiler to do its job before we kill it forcefully
const SQUIRREL_COMPILER_EXEC_TIMEOUT = 500

class Compiler {
  // May change over time in case the user deletes the copied bundled one...
  #squirrelExecutable = 'sq'

  constructor (outputDirectory) {
    if (!existsSync(outputDirectory)) {
      throw new Error(`The directory ${outputDirectory} doesn't seem to exist`)
    }
    // We need a trailing slash if there is none already, because we'll directly append to that path
    if (
        !outputDirectory.endsWith(UNIVERSAL_PATH_DELIMITER) &&
        !outputDirectory.endsWith(WINDOWS_PATH_DELIMITER)
      ) {
      const usesWindowsFormat = outputDirectory.includes(WINDOWS_PATH_DELIMITER)
      outputDirectory += usesWindowsFormat
        ? WINDOWS_PATH_DELIMITER
        : UNIVERSAL_PATH_DELIMITER
    }
    this.outputDirectory = outputDirectory
    console.log(chalk.bold.yellow(`Files will be compiled to ${outputDirectory}`))
    this.#initSquirrelCompiler()
  }

  async #initSquirrelCompiler () {
    try {
      execSync('sq -h', { timeout: SQUIRREL_COMPILER_EXEC_TIMEOUT, stdio: 'ignore' })
    } catch (error) {
      if (error.status !== null) {
        console.log(chalk.bold(`Squirrel compiler unavailable as a global or local executable. Using bundled 3.0.6 sq compiler`))
        this.#produceBundledCompiler()
      }
    }
  }

  #produceBundledCompiler () {
    const sqData = readFileSync(BUNDLED_SQUIRREL_COMPILER_EXECUTABLE);
    const filepath = path.join(os.tmpdir(), 'sq.exe');
    if (!existsSync(filepath)) {
      writeFileSync(filepath, sqData)
      console.log(
        `For an unknown reason, the first time the bundled sq compiler is created, it takes an abnormal amount of time for the first compilation to be successful.
Hang tight and retry your change after around 7 seconds (each time...) if it didn't compile ! It'll be smooth after the first compilation.`
      )
    }
    this.#squirrelExecutable = filepath
  }

  #getFileName (path) {
    const usesWindowsFormat = path.includes(WINDOWS_PATH_DELIMITER)
    let pathFragments = []
    usesWindowsFormat
      ? pathFragments = path.split(WINDOWS_PATH_DELIMITER)
      : pathFragments = path.split(UNIVERSAL_PATH_DELIMITER)
    return pathFragments[pathFragments.length - 1]
  }

  #moveCompiledFile (temporaryCompiledFileName, completePath) {
    const usesWindowsFormat = completePath.includes(WINDOWS_PATH_DELIMITER)
    let delimiterUsed
    usesWindowsFormat
      ? delimiterUsed = WINDOWS_PATH_DELIMITER
      : delimiterUsed = UNIVERSAL_PATH_DELIMITER
    const outputFolderPathFragments = completePath.split(delimiterUsed)
    outputFolderPathFragments.pop()

    const completeOutputFolder = this.outputDirectory +
      outputFolderPathFragments.reduce((acc, path) => acc + path + delimiterUsed, '')
    if (!existsSync(completeOutputFolder)) {
      mkdirSync(completeOutputFolder, { recursive: true })
    }
    rename(temporaryCompiledFileName, this.outputDirectory + completePath, (error) => {
      if (error) throw error
      else {
        console.log(chalk.green(`Compiled ${completePath}`))
      }
    })
  }

/**
 * Handles the grunt work of forwarding the compilation to the sq executable
 * @param {string} input - The path of the .nut file to compile
 */
  async compileSquirrel (input) {
    const fileName = this.#getFileName(input)
    const temporaryCompiledFileName = `${fileName}.cnut`
    const watcher = chokidar.watch(temporaryCompiledFileName)
    watcher.on('add', () => {
      this.#moveCompiledFile(temporaryCompiledFileName, input)
      watcher.removeAllListeners()
    })
    try {
      // We expect it to never return, which will make it timeout and go in the catch.
      await
        exec(`${this.#squirrelExecutable} -o ${temporaryCompiledFileName} -c ${input}`,
          {
            timeout: SQUIRREL_COMPILER_EXEC_TIMEOUT
          }
        )
    } catch (error) {
      watcher.removeAllListeners()
      // The sq compiler doesn't have an stderr output if it compiles successfully
      if (error.stderr) {
        console.log(chalk.red('uh oh, something unexpected happened:'))
        console.log(chalk.red(error.stderr))
        // Compile errors usually include the full input. If it's not that, guess it's an unavailable compiler error
        if (!error.stderr.includes(input)) {
          console.log(chalk.italic('The Squirrel compiler became unavailable. Setting up the bundled one again...'))
          this.#produceBundledCompiler()
        }
      }
    }
  }
}

module.exports = Compiler
