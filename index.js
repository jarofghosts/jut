var through = require('through'),
    select = require('cssauron-falafel'),
    falafel = require('falafel'),
    color = require('bash-color'),
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
            req_string,
            line_number

        data = 'function ____() {\n' + data.replace(/^#!(.*?)\n/, '\n') + '\n}'

        falafel(data, function(node) {
          required = is_require(node)
          if (!required) return

          req_string = required.value

          if (relative.test(req_string)) {
            req_string = path.resolve(CWD, req_string)
          }

          if (options.module.indexOf(req_string) > -1) {
            line_number = data.slice(0, node.range[0]).match(/\n/g).length
            found_match(required.value, line_number)
          }
        })

        if (!files.length) return self.queue(null)
        read_file(files.shift())

        function found_match(module_name) {
          var to_display

          if (!has_matched) {
            has_matched = true
            to_display = options.fullpath ? path.resolve(CWD, filename) :
                path.relative(CWD, filename)
            if (!options.nocolor) to_display = color.green(to_display)

            self.queue(to_display + '\n')
          }

          if (options.justmatch) return
          if (!options.nocolor) module_name = color.yellow(module_name)

          self.queue(line_number + ': ' + module_name + '\n')
        }
      }
    }
  }
}

function noop() {}
