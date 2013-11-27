var through = require('through2'),
    select = require('cssauron-falafel'),
    falafel = require('falafel'),
    fs = require('fs'),
    path = require('path')

module.exports = jut

function jut(modules) {
  var files = [],
      started = false,
      relative = /^\./,
      is_require = select('call id[name=require]:first-child + literal')

  return through(parse_files)

  function parse_files(chunk, enc, next) {
    var self = this
    files.push(chunk.toString())
    if (!started) {
      started = true
      read_file(files.shift())
    }

    function read_file(filename) {
      fs.readFile(path.resolve(process.cwd(), filename), process_file)

      function process_file(err, data) {
        if (err) {
          console.dir(err)
          process.exit(1)
        }

        var has_matched = false

        falafel(data, function(node) {
          var req = is_require(node)

          if (req) {
            if ((!relative.test(req) && modules.indexOf(req) > -1 ||
               (local_modules.indexOf(path.resolve(process.cwd(), req))))) {
              return found_match(req)
            }
          }
        }
      }
      function found_match(module_name) {
        if (!has_matched) {
          has_matched = true
          self.push(filename) + '\n'
        }
        self.push(module_name) + '\n'
      }
  }
}
