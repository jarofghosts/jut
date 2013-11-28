var through = require('through'),
    select = require('cssauron-falafel'),
    falafel = require('falafel'),
    fs = require('fs'),
    path = require('path'),
    CWD = process.cwd()

module.exports = jut

function jut(options) {
  var files = options.file || [],
      started = false,
      relative = /^\./,
      is_require = select('call id[name=require]:first-child + literal')

  return through(parse_files, noop) 

  function parse_files(chunk) {
    var self = this
    files.push(chunk.toString())
    if (!started) {
      started = true
      read_file(files.shift())
    }

    function read_file(filename) {
      fs.readFile(path.resolve(CWD, filename), 'utf8', process_file)

      function process_file(err, data) {
        if (err) {
          process.exit(1)
        }

        var has_matched = false,
            required,
            req_string

        data = 'function _____() {\n' + data + '\n}'

        falafel(data, function(node) {
          required = is_require(node)
          if (!required) return

          req_string = required.value

          if (relative.test(req_string)) {
            req_string = path.resolve(CWD, req_string)
          }

          if (options.module.indexOf(req_string) > -1) {
            found_match(required.value)
          }
        })

        if (!files.length) return self.queue(null)
        read_file(files.shift())

        function found_match(module_name) {
          if (!has_matched) {
            has_matched = true

            self.queue(
              (options.fullpath ? path.resolve(CWD, filename) : filename) +
              '\n'
            )
          }

          if (options.justmatch) return

          self.queue('===\n' + module_name + '\n')
        }
      }
    }
  }
}

function noop() {}
