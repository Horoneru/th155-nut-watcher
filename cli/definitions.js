const optionDefinitions = [
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'Display this usage guide.\nAlso printed if required options are missing.\n'
  },
  {
    name: 'src',
    alias: 'i',
    type: String,
    multiple: true,
    description: `The input files/directories to watch, delimited by spaces
    Will watch the current directory's .nut files by default.
    Every directory will be watched recursively\n`,
  },
  {
    name: 'output',
    alias: 'o',
    type: String,
    description: `{yellow.bold [Required]} The directory to output the compiled files specified in src to.
    Use the corresponding thcrap repo's complete path. Keep in mind that the complete path for the files will be appended to this output.
    If the folder structure doesn't exist yet, it will be recreated.\n`,
    required: true,
  },
  {
    name: 'config',
    alias: 'c',
    type: String,
    description: '{red.bold TODO} The config file to use\n'
  },
  {
    name: 'debug',
    alias: 'd',
    type: Boolean,
    hidden: true,
  }
]
exports.options = optionDefinitions
exports.optionsUsage = [
  {
    header: `th155 🥥 watcher {yellow ${require('../package.json').version}}`,
    content: 'A CLI by {yellow Takuneru} that makes modding squirrel .nut files for th155 easier'
  },
  {
    header: 'Options',
    optionList: optionDefinitions.filter((option) => !option.hidden )
  },
  {
    header: 'Problems with paths',
    content: `Use {italic quoted paths} like "C:/folder" if path options have unknown values`
  }
]
