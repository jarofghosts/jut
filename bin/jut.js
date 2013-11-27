var nopt = require('nopt'),
    jut = require('../'),
    fs = require('fs'),
    lsstream = require('ls-stream'),
    filter = require('stream-police'),
    split = require('split'),
    rs = require('stream').Readable(),
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
      j: ['--justmatch'],
      d: ['--dir'],
      f: ['--file'],
      F: ['--fullpath'],
      m: ['--module']
    },
    input,
    options = nopt(noptions, shorts, process.argv)

if (options.version) return version()
if (options.help) return help()

rs._read = function () {
  var self = this

  options.file && options.file.forEach(function (file) {
    self.push(file)
  })
}

if (options.dir) {
  input = lsstream(path.resolve(options.dir))
} else {
  input = process.stdin.pipe(split())
}

options.module = (options.module || []).concat(options.argv.remain)

options.module.map(function (mod) {
  return /\//.test(mod) ? path.resolve(process.cwd(), mod) : mod
})

rs
  .pipe(input)
  .pipe(filter({ verify: [/\.js$/] }))
  .pipe(jut(options))
  .pipe(process.stdout)

function version() {
  process.stdout.write('jut version ' + package.version + '\n')
}

function help() {
  version()
  fs.createReadStream(path.join(__dirname, '../help.txt')).pipe(process.stdout)
}
