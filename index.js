var select = require('cssauron-falafel')
  , color = require('bash-color')
  , through = require('through')
  , falafel = require('falafel')
  , path = require('path')
  , fs = require('fs')

var CWD = process.cwd()

module.exports = jut

function jut(options) {
  var is_require = select('call id[name=require]:first-child + literal')

  var files = []
    , started = false
    , relative = /^\./

  var stream = through(parse_files, noop)

  if (options.dir) CWD = path.resolve(options.dir)

  return stream

  function parse_files(chunk) {
    files.push(chunk.toString())
    if (!started) {
      started = true
      read_file(files.shift())
    }

    function read_file(filename) {
      fs.readFile(path.resolve(CWD, filename), 'utf8', process_file)

      function process_file(err, data) {
        if (err) process.exit(1)

        var has_matched = false
          , line_number
          , req_string
          , to_display
          , required

        data = 'function ____() {\n' + data.replace(/^#!(.*?)\n/, '\n') + '\n}'

        falafel(data, function(node) {
          required = is_require(node)
          if (!required) return

          req_string = required.value

          if (relative.test(req_string)) {
            if (/\/$/.test(req_string)) req_string += 'index.js'
            if (!/\.(js|json)$/.test(req_string)) req_string += '.js'
            req_string = path.resolve(path.dirname(filename), req_string)
          }

          if (options.module.indexOf(req_string) > -1) {
            line_number = data.slice(0, node.range[0]).match(/\n/g).length
            found_match(required.value, line_number)
          }
        })

        if (!files.length) return stream.queue(null)
        read_file(files.shift())

        function found_match(module_name) {
          if (!has_matched) {
            has_matched = true
            to_display = options.fullpath ?
                path.resolve(CWD, filename) :
                path.relative(CWD, filename)

            if (!options.nocolor) to_display = color.green(to_display)

            stream.queue(to_display + '\n')
          }

          if (options.justmatch) return
          if (!options.nocolor) module_name = color.yellow(module_name)

          stream.queue(line_number + ': ' + module_name + '\n')
        }
      }
    }
  }
}

function noop() {}
