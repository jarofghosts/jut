#!/usr/bin/env node

var fileStream = require('stream').Readable()
  , path = require('path')
  , fs = require('fs')

var filter = require('stream-police')
  , lsstream = require('ls-stream')
  , dps = require('dotpath-stream')
  , color = require('bash-color')
  , through = require('through')
  , split = require('split')
  , nopt = require('nopt')

var package = require('../package.json')
  , jut = require('../')

var CWD = process.cwd()

var noptions = {
    version: Boolean
  , help: Boolean
  , dir: String
  , fullpath: Boolean
  , justmatch: Boolean
  , nocolor: Boolean
  , file: Array
  , module: Array
}

var shorts = {
    v: ['--version']
  , h: ['--help']
  , j: ['--justmatch']
  , d: ['--dir']
  , f: ['--file']
  , F: ['--fullpath']
  , m: ['--module']
  , n: ['--nocolor']
}

var options = nopt(noptions, shorts, process.argv)
  , input

if(options.version) return version()
if(options.help) return help()

fileStream._read = function () {
  var self = this

  options.file && options.file.forEach(function(file) {
    self.push(file)
  })
  self.push(null)
}

if(!options.file && !options.dir && process.stdin.isTTY) {
  options.dir = CWD
}

if(!options.module && options.argv.remain.length) {
  options.module = options.argv.remain
}

if(options.file) {
  input = fileStream
} else if(options.dir) {
  input = lsstream(path.resolve(options.dir)).pipe(dps('path'))
} else {
  input = process.stdin.pipe(split())
}

options.module = (options.module || []).concat(options.argv.remain)

input
  .pipe(filter({verify: [/\.js$/]}))
  .pipe(jut(options.module))
  .pipe(formatStream())
  .pipe(process.stdout)

function formatStream() {
  var stream = through(write)
    , filename

  return stream

  function write(data) {
    var moduleName
      , toDisplay

    if(data.filename !== filename) {
      filename = data.filename

      toDisplay = options.fullpath ?
          path.resolve(CWD, filename) :
          path.relative(CWD, filename)

      if(!options.nocolor) toDisplay = color.green(toDisplay)

      stream.queue(toDisplay + '\n')
    }

    moduleName = data.module

    if(options.justmatch) return
    if(!options.nocolor) moduleName = color.yellow(moduleName)

    stream.queue(data.line + ': ' + moduleName + '\n')
  }

}

function version() {
  process.stdout.write('jut version ' + package.version + '\n')
}

function help() {
  version()
  fs.createReadStream(path.join(__dirname, '../help.txt')).pipe(process.stdout)
}
