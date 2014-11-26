var path = require('path')
  , fs = require('fs')

var select = require('cssauron-falafel')
  , color = require('bash-color')
  , through = require('through')
  , falafel = require('falafel')

module.exports = jut

function jut(options) {
  var CWD = process.cwd()
  var isRequire = select('call id[name=require]:first-child + literal')

  var files = []
    , started = false
    , relative = /^\./

  var stream = through(parseFiles, Function())

  if(options.dir) CWD = path.resolve(options.dir)

  options.module = options.module.map(makeAbsolute)

  return stream

  function makeAbsolute(x) {
    if(relative.test(x)) return path.resolve(CWD, x)

    return x
  }

  function parseFiles(chunk) {
    files.push(chunk.toString())
    if(!started) {
      started = true
      readFile(files.shift())
    }

    function readFile(filename) {
      fs.readFile(path.resolve(CWD, filename), 'utf8', processFile)

      function processFile(err, data) {
        if(err) process.exit(1)

        var hasMatched = false
          , lineNumber
          , reqString
          , toDisplay
          , required

        data = 'function ____() {\n' + data.replace(/^#!(.*?)\n/, '\n') + '\n}'

        if(/require/.test(data)) {
          falafel(data, checkNode)
        }

        if(!files.length) return stream.queue(null)

        readFile(files.shift())

        function checkNode(node) {
          required = isRequire(node)

          if(!required) return

          reqString = required.value

          if(relative.test(reqString)) return testRelative()

          doTest(reqString)

          function doTest(str) {
            if(options.module.indexOf(str) > -1) {
              lineNumber = data.slice(0, node.range[0]).match(/\n/g).length
              foundMatch(required.value, lineNumber)

              return true
            }

            return false
          }

          function testRelative() {
            reqString = path.resolve(path.dirname(filename), reqString)

            if(doTest(reqString)) return
            if(/\/index\.js/.test(reqString)) return

            reqString += reqString.slice(-1) === '/' ?
              'index' :
              '/index'

            if(doTest(reqString)) return
            if(!/\.(js|json)$/.test(reqString)) reqString += '.js'

            doTest(reqString)
          }
        }


        function foundMatch(moduleName) {
          if(!hasMatched) {
            hasMatched = true

            toDisplay = options.fullpath ?
                path.resolve(CWD, filename) :
                path.relative(CWD, filename)

            if(!options.nocolor) toDisplay = color.green(toDisplay)

            stream.queue(toDisplay + '\n')
          }

          if(options.justmatch) return
          if(!options.nocolor) moduleName = color.yellow(moduleName)

          stream.queue(lineNumber + ': ' + moduleName + '\n')
        }
      }
    }
  }
}
