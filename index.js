const CLI = require('./cli')
const { options, optionsUsage } = require('./cli/definitions')
const cli = new CLI({ options, optionsUsage })
const chokidar = require('chokidar')
const Compiler = require('./compiler')
const { getOutputFromArgs } = require('./utils')
const chalk = require('chalk')
const compiler = new Compiler(getOutputFromArgs(cli.args))
const watchInput = cli.args.src || '**/*.nut'
const watcher = chokidar.watch(watchInput, {
  ignoreInitial: true,
  ignored: (path, stats) => stats?.isFile() && !path.endsWith('.nut')
})
watcher.on('all', async (event, path) => {
  console.log(`${chalk.yellow(event)} (${path})`)
  await compiler.compileSquirrel(path)
})
