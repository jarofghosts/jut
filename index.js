var path = require('path')
var fs = require('fs')

var detective = require('detective')
var escape = require('quotemeta')
var through = require('through2')

var CWD = process.cwd()
var relative = /^\./

module.exports = jut

function jut (modules, _aliases) {
  var aliases = _aliases || ['require']

  var stream = through.obj(parseFiles, noop)
  var started = false
  var files = []

  modules = modules.map(makeAbsolute)

  return stream

  function parseFiles (chunk, _, next) {
    files.push(chunk.toString())

    if (!started) {
      started = true
      readFile(files.shift())
    }

    next()
  }

  function readFile (filename) {
    fs.readFile(path.resolve(CWD, filename), 'utf8', processFile)

    function processFile (err, data) {
      if (err) {
        return stream.emit('error', err)
      }

      data = 'function ____() {\n' + data.replace(/^#!(.*?)\n/, '\n') + '\n}'

      aliases.reduce(requires, []).forEach(checkNode)

      if (!files.length) {
        return stream.push(null)
      }

      readFile(files.shift())

      function requires (requires, alias) {
        return requires.concat(
          detective.find(data, {word: alias, nodes: true}).nodes
        )
      }

      function checkNode (required) {
        required = required.arguments[0]

        var reqString = required.value

        if (!(relative.test(reqString) && testRelative()) &&
            !modules.filter(checkRequires(reqString)).length) {
          return
        }

        stream.push({
          line: data.slice(0, required.start).match(/\n/g).length,
          module: required.value,
          filename: filename
        })

        function testRelative () {
          reqString = path.resolve(path.dirname(filename), reqString)

          if (modules.indexOf(reqString) > -1) {
            return true
          }

          if (modules.indexOf(reqString + '.js') > -1) {
            return true
          }

          reqString += (reqString.slice(-1) === '/' ? 'index' : '/index')

          if (modules.indexOf(reqString) > -1) {
            return true
          }

          if (modules.indexOf(reqString + '.js') > -1) {
            return true
          }

          return false
        }
      }
    }
  }

  function checkRequires (reqString) {
    return function (x) {
      return x === reqString ||
          new RegExp('^' + escape(x) + '/.+').test(reqString)
    }
  }
}

function makeAbsolute (x) {
  return relative.test(x) ? path.resolve(CWD, x) : x
}

function noop () {
  // shhh
}
