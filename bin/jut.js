var nopt = require('nopt'),
    jut = require('../'),
    lsstream = require('ls-stream'),
    filter = require('stream-police'),
    split = require('split'),
    path = require('path'),
    package = require('../package.json'),
    noptions = {
      version: Boolean,
      help: Boolean,
      dir: String,
      fullpath: Boolean,
      justmatch: Boolean,
      file: Array,
      module: Array
    },
    shorts = {
      v: ['--version'],
      h: ['--help'],
      d: ['--dir'],
      f: ['--file'],
      F: ['--fullpath'],
      m: ['--module']
    },
    input,
    options = nopt(noptions, shorts, process.argv)

if (options.dir) {
  input = lsstream(path.resolve(options.dir))
} else {
  input = process.stdin.pipe(split())
}

options.module.map(function (mod) {
  return /\//.test(mod) ? path.resolve(process.cwd(), mod) : mod
})

input.pipe(filter({ verify: [/\.js$/] })).pipe(jut(options)).pipe(process.stdout)
