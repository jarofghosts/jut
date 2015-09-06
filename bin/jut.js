#!/usr/bin/env node

var fileStream = require('stream').Readable()
var util = require('util')
var path = require('path')
var fs = require('fs')

var filter = require('stream-police')
var lsstream = require('ls-stream')
var dps = require('dotpath-stream')
var color = require('bash-color')
var through = require('through2')
var split = require('split')
var nopt = require('nopt')

var pkg = require('../package.json')
var jut = require('../')

var CWD = process.cwd()

var noptions = {
  version: Boolean,
  help: Boolean,
  dir: String,
  fullpath: Boolean,
  require: Array,
  justmatch: Boolean,
  nocolor: Boolean,
  file: Array,
  module: Array
}

var shorts = {
  v: ['--version'],
  h: ['--help'],
  j: ['--justmatch'],
  d: ['--dir'],
  r: ['--require'],
  f: ['--file'],
  F: ['--fullpath'],
  m: ['--module'],
  n: ['--nocolor']
}

module.exports = bin

if (require.main === module) {
  bin()
}

function bin () {
  var options = nopt(noptions, shorts, process.argv)
  var input

  if (options.version) {
    version()

    return
  }

  if (options.help) {
    help()

    return
  }

  fileStream._read = function () {
    if (options.file) {
      options.file.forEach(function (file) {
        this.push(file)
      }, this)
    }

    this.push(null)
  }

  if (!options.file && !options.dir && process.stdin.isTTY) {
    options.dir = CWD
  }

  if (!options.module && options.argv.remain.length) {
    options.module = options.argv.remain
  }

  if (options.file) {
    input = fileStream
  } else if (options.dir) {
    input = lsstream(path.resolve(options.dir)).pipe(dps('path'))
  } else {
    input = process.stdin.pipe(split())
  }

  options.module = (options.module || []).concat(options.argv.remain)

  input
    .pipe(filter(function (filename) {
      return /\.js$/.test(filename.toString())
    }))
    .pipe(jut(options.module, options.require))
    .pipe(formatStream())
    .pipe(process.stdout)

  function formatStream () {
    var stream = through.obj(write, end)
    var total = 0
    var filename

    return stream

    function write (data, _, next) {
      var moduleName
      var toDisplay

      if (data.filename !== filename) {
        filename = data.filename

        toDisplay = options.fullpath ? path.resolve(CWD, filename) : path.relative(CWD, filename)

        if (!options.nocolor) {
          toDisplay = color.green(toDisplay)
        }

        stream.push(toDisplay + '\n')
      }

      if (options.justmatch) {
        next()

        return
      }

      moduleName = data.module

      if (!options.nocolor) {
        moduleName = color.yellow(moduleName)
      }

      stream.push(data.line + ': ' + moduleName + '\n')
      ++total

      next()
    }

    function end (done) {
      if (!options.justmatch) {
        stream.push(util.format('\n%d found.\n', total))
      }

      done()
    }
  }

  function version () {
    process.stdout.write('jut version ' + pkg.version + '\n')
  }

  function help () {
    version()
    fs.createReadStream(path.join(__dirname, '../help.txt')).pipe(process.stdout)
  }
}
