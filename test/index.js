var path = require('path')

var test = require('tape')

var jut = require('../')

test('finds regular modules', function(t) {
  t.plan(1)

  var jutStream = jut(['foop'])
    , result = []

  jutStream.on('data', function(data) {
    result.push(data)
  })

  jutStream.on('end', function() {
    t.deepEqual(
        result
      , [
            {filename: fixPath('dummy.js'), line: 1, module: 'foop'}
          , {filename: fixPath('dummy.js'), line: 3, module: 'foop/joop'}
          , {filename: fixPath('dummy.js'), line: 5, module: 'foop/joop.doop'}
        ]
    )
  })

  jutStream.write(fixPath('dummy.js'))
  jutStream.write(fixPath('pluto.js'))

  jutStream.end()
})

test('finds "required-into" modules', function(t) {
  t.plan(1)

  var jutStream = jut(['foop/joop'])
    , result = []

  jutStream.on('data', function(data) {
    result.push(data)
  })

  jutStream.on('end', function() {
    t.deepEqual(
        result
      , [{filename: fixPath('dummy.js'), line: 3, module: 'foop/joop'}]
    )
  })

  jutStream.write(fixPath('dummy.js'))
  jutStream.write(fixPath('pluto.js'))

  jutStream.end()
})

test('finds "required-into" modules with dot', function(t) {
  t.plan(1)

  var jutStream = jut(['foop/joop.doop'])
    , result = []

  jutStream.on('data', function(data) {
    result.push(data)
  })

  jutStream.on('end', function() {
    t.deepEqual(
        result
      , [{filename: fixPath('dummy.js'), line: 5, module: 'foop/joop.doop'}]
    )
  })

  jutStream.write(fixPath('dummy.js'))
  jutStream.write(fixPath('pluto.js'))

  jutStream.end()
})

test('finds relative modules', function(t) {
  t.plan(1)

  var jutStream = jut(['./test/herp'])
    , result = []

  jutStream.on('data', function(data) {
    result.push(data)
  })

  jutStream.on('end', function() {
    t.deepEqual(
        result
      , [{filename: fixPath('pluto.js'), line: 4, module: './herp'}]
    )
  })

  jutStream.write(fixPath('dummy.js'))
  jutStream.write(fixPath('pluto.js'))

  jutStream.end()
})

test('finds relative modules with extension', function(t) {
  t.plan(1)

  var jutStream = jut(['./test/herp.js'])
    , result = []

  jutStream.on('data', function(data) {
    result.push(data)
  })

  jutStream.on('end', function() {
    t.deepEqual(
        result
      , [{filename: fixPath('pluto.js'), line: 4, module: './herp'}]
    )
  })

  jutStream.write(fixPath('dummy.js'))
  jutStream.write(fixPath('pluto.js'))

  jutStream.end()
})

test('finds implicit matches', function(t) {
  t.plan(1)

  var jutStream = jut(['./test/herp/index.js'])
    , result = []

  jutStream.on('data', function(data) {
    result.push(data)
  })

  jutStream.on('end', function() {
    t.deepEqual(
        result
      , [{filename: fixPath('pluto.js'), line: 4, module: './herp'}]
    )
  })

  jutStream.write(fixPath('dummy.js'))
  jutStream.write(fixPath('pluto.js'))

  jutStream.end()
})

test('finds implicit matches without extension', function(t) {
  t.plan(1)

  var jutStream = jut(['./test/herp/index'])
    , result = []

  jutStream.on('data', function(data) {
    result.push(data)
  })

  jutStream.on('end', function() {
    t.deepEqual(
        result
      , [{filename: fixPath('pluto.js'), line: 4, module: './herp'}]
    )
  })

  jutStream.write(fixPath('dummy.js'))
  jutStream.write(fixPath('pluto.js'))

  jutStream.end()
})

test('allows changing require alias', function(t) {
  t.plan(1)

  var jutStream = jut(['./test/herp'], ['iunno'])
    , result = []

  jutStream.on('data', function(data) {
    result.push(data)
  })

  jutStream.on('end', function() {
    t.deepEqual(
        result
      , [
            {filename: fixPath('pluto.js'), line: 5, module: './herp'}
        ]
    )
  })

  jutStream.write(fixPath('dummy.js'))
  jutStream.write(fixPath('pluto.js'))

  jutStream.end()
})
test('can search for multiple modules', function(t) {
  t.plan(1)

  var jutStream = jut(['fabio', 'foop'])
    , result = []

  jutStream.on('data', function(data) {
    result.push(data)
  })

  jutStream.on('end', function() {
    t.deepEqual(
        result
      , [
            {filename: fixPath('dummy.js'), line: 1, module: 'foop'}
          , {filename: fixPath('dummy.js'), line: 3, module: 'foop/joop'}
          , {filename: fixPath('dummy.js'), line: 5, module: 'foop/joop.doop'}
          , {filename: fixPath('fake.js'), line: 1, module: 'foop'}
          , {filename: fixPath('fake.js'), line: 2, module: 'fabio'}
        ]
    )
  })

  jutStream.write(fixPath('dummy.js'))
  jutStream.write(fixPath('fake.js'))
  jutStream.write(fixPath('pluto.js'))
  jutStream.end()
})

test('can search multiple files', function(t) {
  t.plan(1)

  var jutStream = jut(['foop'])
    , result = []

  jutStream.on('data', function(data) {
    result.push(data)
  })

  jutStream.on('end', function() {
    t.deepEqual(
        result
      , [
            {filename: fixPath('dummy.js'), line: 1, module: 'foop'}
          , {filename: fixPath('dummy.js'), line: 3, module: 'foop/joop'}
          , {filename: fixPath('dummy.js'), line: 5, module: 'foop/joop.doop'}
          , {filename: fixPath('fake.js'), line: 1, module: 'foop'}
        ]
    )
  })

  jutStream.write(fixPath('dummy.js'))
  jutStream.write(fixPath('pluto.js'))
  jutStream.write(fixPath('fake.js'))

  jutStream.end()
})

test('reports nothing if none found', function(t) {
  t.plan(1)

  var jutStream = jut(['barb'])
    , result = []

  jutStream.on('data', function(data) {
    result.push(data)
  })

  jutStream.on('end', function() {
    t.equal(result.length, 0)
  })

  jutStream.write(fixPath('dummy.js'))
  jutStream.write(fixPath('fake.js'))
  jutStream.write(fixPath('pluto.js'))

  jutStream.end()
})

function fixPath(filename) {
  return path.resolve(__dirname, filename)
}
