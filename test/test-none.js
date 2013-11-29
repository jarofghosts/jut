var assert = require('assert'),
    jut = require('../'),
    path = require('path'),
    rs = require('stream').Readable(),
    result = []

rs._read = function () {
  this.push(path.join(__dirname, 'dummy.js'))
  this.push(path.join(__dirname, 'fake.js'))
  this.push(path.join(__dirname, 'pluto.js'))
  this.push(null)
}

var test = rs.pipe(jut({ nocolor: true, module: ['barb'] }))
test.on('data', function (data) {
  result.push(data.toString())
})
test.on('end', function (data) {
  assert.equal(result.join(''), '')
})
