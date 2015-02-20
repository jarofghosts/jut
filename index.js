var path = require('path')
  , fs = require('fs')

var select = require('cssauron-falafel')
  , escape = require('quotemeta')
  , through = require('through')
  , falafel = require('falafel')

var CWD = process.cwd()
  , relative = /^\./

module.exports = jut

function jut(modules) {
  var isRequire = select('call id[name=require]:first-child + literal')
    , stream = through(parseFiles, Function())
    , started = false
    , files = []

  modules = modules.map(makeAbsolute)

  return stream

  function parseFiles(chunk) {
    files.push(chunk.toString())

    if(!started) {
      started = true
      readFile(files.shift())
    }
  }

  function readFile(filename) {
    fs.readFile(path.resolve(CWD, filename), 'utf8', processFile)

    function processFile(err, data) {
      if(err) process.exit(1)

      var reqString
        , required

      data = 'function ____() {\n' + data.replace(/^#!(.*?)\n/, '\n') + '\n}'

      if(data.indexOf('require') > -1) {
        falafel(data, checkNode)
      }

      if(!files.length) return stream.queue(null)

      readFile(files.shift())

      function checkNode(node) {
        required = isRequire(node)

        if(!required) return

        reqString = required.value

        if(!(relative.test(reqString) && testRelative()) &&
            !modules.filter(checkRequires(reqString)).length) return

        stream.queue({
            line: data.slice(0, node.range[0]).match(/\n/g).length
          , module: required.value
          , filename: filename
        })

        function testRelative() {
          reqString = path.resolve(path.dirname(filename), reqString)

          if(modules.indexOf(reqString) > -1) return true
          if(modules.indexOf(reqString + '.js') > -1) return true

          reqString += reqString.slice(-1) === '/' ?
            'index' :
            '/index'

          if(modules.indexOf(reqString) > -1) return true
          if(modules.indexOf(reqString + '.js') > -1) return true

          return false
        }
      }
    }
  }

  function checkRequires(reqString) {
    return function(x) {
      return x === reqString ||
          new RegExp('^' + escape(x) + '/.+').test(reqString)
    }
  }
}

function makeAbsolute(x) {
  return relative.test(x) ? path.resolve(CWD, x) : x
}
