var nopt = require('nopt'),
    jut = require('../'),
    lsstream = require('ls-stream'),
    split = require('split'),
    path = require('path'),
    package = require('../package.json'),
    noptions = {
      'version': Boolean,
      'help': Boolean,
      'dir': String,
      'file': Array,
      'module': Array
    },
    shorts = {
      'v': ['--version'],
      'h': ['--help'],
      'd': ['--dir'],
      'f': ['--file'],
      'm': ['--module']
    },
    input,
    options = nopt(noptions, shorts, process.argv)

if (options.dir) {
  input = lsstream(path.resolve(dir))
} else {
  input = process.stdin
}

options.module.map(function (mod) {
  return /\//.test(mod) ? path.resolve(process.cwd(), mod) : mod
})

input.pipe(split()).pipe(jut(options.module)).pipe(process.stdout)
