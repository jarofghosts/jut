jut
===

[![Build Status](http://img.shields.io/travis/jarofghosts/jut.svg?style=flat)](https://travis-ci.org/jarofghosts/jut)
[![npm install](http://img.shields.io/npm/dm/jut.svg?style=flat)](https://www.npmjs.org/package/jut)

locate used modules

## installation

`npm install -g jut`

## whafor?

`jut -m badmodule`

or use it with [jung](https://github.com/jarofghosts/jung) and a test runner!

`jung -f '\.js$' -- test_runner $(ls tests/**/*.js | jut -m '$JUNG_FILE' -Fnj)`

or something else. the world is yours.

## usage

`jut [options] --module <modulename>`

Options are:

* `--module, -m <modulename>` Find files that require `<modulename>`
* `--dir, -d <dirname>` Search files in `<dirname>` recursively
* `--file, -f <filename>` Search `<filename>` for modules
* `--justmatch, -j` Just print the filename that matches
* `--fullpath, -F` Print full path to matched file
* `--require, -r <name>` Specify a different function name from `require`
* `--nocolor, -n` Don't colorize results
* `--version, -v` Print current version
* `--help, -h` Print help

## notes

in order to support searching for "deep-requires", (such as
`module-name/sub-module`) searching for a "local" file (such as
`../../module-name/sub-module`) requires a leading `./` in the module name.

## as a module

`jut(['array', 'of', 'module', './names'], ['aliases']) -> DuplexStream`

stream it filenames, and get out objects with match objects.
something like:

```js
var jut = require('jut')
  , ls = require('ls-stream') // for example
  , convert = require('dotpath-stream')
  , filter = require('stream-police')

ls('apps')
  .pipe(convert('path')) // reduce ls-stream object to path string
  .pipe(filter({verify: [/\.js$/]})) // only .js files
  .pipe(jut(['falafel'])) // right over to jut
  .on('data', function(data) {
    console.log(data) // {filename: fullpath, line: lineNumber, module: 'falafel'}
  })
```

## license

MIT
