var path = require('path')

var test = require('tape')

var jut = require('../')

test('finds regular modules', function(t) {
  t.plan(1)

  var jutStream = jut({nocolor: true, module: ['foop']})
    , result = []

  jutStream.on('data', function(data) {
    result.push(data.toString())
  })

  jutStream.on('end', function() {
    t.equal(result.join(''), 'test/dummy.js\n1: foop\n')
  })

  jutStream.write(path.join(__dirname, 'dummy.js'))
  jutStream.write(path.join(__dirname, 'pluto.js'))

  jutStream.end()
})

test('finds "required-into" modules', function(t) {
  t.plan(1)

  var jutStream = jut({nocolor: true, module: ['foop/joop']})
    , result = []

  jutStream.on('data', function(data) {
    result.push(data.toString())
  })

  jutStream.on('end', function() {
    t.equal(result.join(''), 'test/dummy.js\n3: foop/joop\n')
  })

  jutStream.write(path.join(__dirname, 'dummy.js'))
  jutStream.write(path.join(__dirname, 'pluto.js'))

  jutStream.end()
})

test('finds "required-into" modules with dot', function(t) {
  t.plan(1)

  var jutStream = jut({nocolor: true, module: ['foop/joop.doop']})
    , result = []

  jutStream.on('data', function(data) {
    result.push(data.toString())
  })

  jutStream.on('end', function() {
    t.equal(result.join(''), 'test/dummy.js\n5: foop/joop.doop\n')
  })

  jutStream.write(path.join(__dirname, 'dummy.js'))
  jutStream.write(path.join(__dirname, 'pluto.js'))

  jutStream.end()
})

test('finds relative modules', function(t) {
  t.plan(1)

  var jutStream = jut({nocolor: true, module: ['./test/herp']})
    , result = []

  jutStream.on('data', function(data) {
    result.push(data.toString())
  })

  jutStream.on('end', function() {
    t.equal(result.join(''), 'test/pluto.js\n4: ./herp\n')
  })

  jutStream.write(path.join(__dirname, 'dummy.js'))
  jutStream.write(path.join(__dirname, 'pluto.js'))

  jutStream.end()
})

test('finds relative modules with extension', function(t) {
  t.plan(1)

  var jutStream = jut({nocolor: true, module: ['./test/herp.js']})
    , result = []

  jutStream.on('data', function(data) {
    result.push(data.toString())
  })

  jutStream.on('end', function() {
    t.equal(result.join(''), 'test/pluto.js\n4: ./herp\n')
  })

  jutStream.write(path.join(__dirname, 'dummy.js'))
  jutStream.write(path.join(__dirname, 'pluto.js'))

  jutStream.end()
})

test('finds implicit matches', function(t) {
  t.plan(1)

  var jutStream = jut({nocolor: true, module: ['./test/herp/index.js']})
    , result = []

  jutStream.on('data', function(data) {
    result.push(data.toString())
  })

  jutStream.on('end', function() {
    t.equal(result.join(''), 'test/pluto.js\n4: ./herp\n')
  })

  jutStream.write(path.join(__dirname, 'dummy.js'))
  jutStream.write(path.join(__dirname, 'pluto.js'))

  jutStream.end()
})

test('finds implicit matches without extension', function(t) {
  t.plan(1)

  var jutStream = jut({nocolor: true, module: ['./test/herp/index']})
    , result = []

  jutStream.on('data', function(data) {
    result.push(data.toString())
  })

  jutStream.on('end', function() {
    t.equal(result.join(''), 'test/pluto.js\n4: ./herp\n')
  })

  jutStream.write(path.join(__dirname, 'dummy.js'))
  jutStream.write(path.join(__dirname, 'pluto.js'))

  jutStream.end()
})

test('can search for multiple modules', function(t) {
  t.plan(1)

  var jutStream = jut({nocolor: true, module: ['fabio', 'foop']})
    , result = []

  jutStream.on('data', function(data) {
    result.push(data.toString())
  })

  jutStream.on('end', function() {
    t.equal(
        result.join('')
      , 'test/dummy.js\n1: foop\ntest/fake.js\n1: foop\n2: fabio\n'
    )
  })

  jutStream.write(path.join(__dirname, 'dummy.js'))
  jutStream.write(path.join(__dirname, 'fake.js'))
  jutStream.write(path.join(__dirname, 'pluto.js'))
  jutStream.end()
})

test('can search multiple files', function(t) {
  t.plan(1)

  var jutStream = jut({nocolor: true, module: ['foop']})
    , result = []

  jutStream.on('data', function(data) {
    result.push(data.toString())
  })

  jutStream.on('end', function() {
    t.equal(result.join(''), 'test/dummy.js\n1: foop\ntest/fake.js\n1: foop\n')
  })

  jutStream.write(path.join(__dirname, 'dummy.js'))
  jutStream.write(path.join(__dirname, 'pluto.js'))
  jutStream.write(path.join(__dirname, 'fake.js'))

  jutStream.end()
})

test('reports nothing if none found', function(t) {
  t.plan(1)

  var jutStream = jut({nocolor: true, module: ['barb']})
    , result = []

  jutStream.on('data', function(data) {
    result.push(data.toString())
  })

  jutStream.on('end', function() {
    t.equal(result.length, 0)
  })

  jutStream.write(path.join(__dirname, 'dummy.js'))
  jutStream.write(path.join(__dirname, 'fake.js'))
  jutStream.write(path.join(__dirname, 'pluto.js'))

  jutStream.end()
})
