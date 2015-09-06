# jut

[![Build Status](https://img.shields.io/travis/jarofghosts/jut.svg?style=flat-square)](https://travis-ci.org/jarofghosts/jut)
[![npm install](https://img.shields.io/npm/dm/jut.svg?style=flat-square)](https://www.npmjs.org/package/jut)
[![npm version](https://img.shields.io/npm/v/jut.svg?style=flat-square)](https://www.npmjs.org/package/jut)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
[![License](https://img.shields.io/npm/l/jut.svg?style=flat-square)](https://github.com/jarofghosts/jut/blob/master/LICENSE)

locate used modules

## installation

`npm install -g jut`

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
var ls = require('ls-stream') // for example
var convert = require('dotpath-stream')
var filter = require('stream-police')

ls('apps')
  .pipe(convert('path')) // reduce ls-stream object to path string
  .pipe(filter(function (data) {
    return /\.js$/.test(data.toString()) // only js files
  }))
  .pipe(jut(['falafel'])) // right over to jut
  .on('data', function (data) {
    console.log(data) // {filename: fullpath, line: lineNumber, module: 'falafel'}
  })
```

## license

MIT
