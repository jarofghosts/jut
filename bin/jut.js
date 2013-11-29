#!/usr/bin/env node

var nopt = require('nopt'),
    jut = require('../'),
    fs = require('fs'),
    lsstream = require('ls-stream'),
    filter = require('stream-police'),
    file_stream = require('stream').Readable(),
    dps = require('dotpath-stream'),
    split = require('split'),
    path = require('path'),
    package = require('../package.json'),
    noptions = {
      version: Boolean,
      help: Boolean,
      dir: String,
      fullpath: Boolean,
      justmatch: Boolean,
      nocolor: Boolean,
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
      m: ['--module'],
      n: ['--nocolor']
    },
    input,
    options = nopt(noptions, shorts, process.argv)

if (options.version) return version()
if (options.help) return help()

file_stream._read = function () {
  var self = this

  options.file && options.file.forEach(function (file) {
    self.push(file)
  })
  self.push(null)
}

if (options.file) {
  input = file_stream
} else if (options.dir) {
  input = lsstream(path.resolve(options.dir)).pipe(dps('path'))
} else {
  input = process.stdin.pipe(split())
}

options.module = (options.module || []).concat(options.argv.remain)

options.module = options.module.map(function (mod) {
  return /\//.test(mod) ? path.resolve(process.cwd(), mod) : mod
})

input
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
