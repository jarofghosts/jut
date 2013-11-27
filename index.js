var through = require('through'),
    select = require('cssauron-falafel'),
    falafel = require('falafel'),
    fs = require('fs'),
    path = require('path')

module.exports = jut

function jut(options) {
  var files = [],
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
      fs.readFile(path.resolve(process.cwd(), filename), 'utf8', process_file)

      function process_file(err, data) {
        if (err) {
          console.dir(err)
          process.exit(1)
        }

        var has_matched = false,
            req

        falafel(data, function(node) {
          req = is_require(node)
          if (req) {
            req = req.value
            if ((!relative.test(req) && options.module.indexOf(req) > -1 ||
               (relative.test(req) &&
                   options.module.indexOf(
                       path.resolve(process.cwd(), req)) > -1))) {
              found_match(req)
            }
          }
        })
        if (files.length) return read_file(files.shift())
        self.queue(null)
        function found_match(module_name) {
          if (!has_matched) {
            if (options.fullpath) {
              filename = path.resolve(process.cwd(), filename)
            }

            has_matched = true
            self.queue(filename + '\n')
            if (!options.justmatch) self.queue('===\n')
          }
          if (!options.justmatch) self.queue(module_name + '\n')
        }
      }
    }
  }
}

function noop() {}
