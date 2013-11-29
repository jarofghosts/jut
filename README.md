jut
===

[![Build Status](https://travis-ci.org/jarofghosts/jut.png?branch=master)](https://travis-ci.org/jarofghosts/jut)

locate used modules

## installation

`npm install -g jut`

## whafor?

`ls *.js | jut -m badmodule`

or use it with [jung](https://github.com/jarofghosts/jung) and a test runner!

`jung -f '\.js$' -- test_runner '$JUNG_FILE' $(jut -m '$JUNG_FILE' -Fnj)`

or something else. the world is yours.

## usage

`jut [options] --module <module_name>`

Options are:

* `--module, -m <modulename>` Find files that require `<modulename>`
* `--file, -f <filename>` Search `<filename>` for modules
* `--justmatch, -j` Just print the filename that matches
* `--fullpath, -F` Print full path to matched file
* `--nocolor, -n` Don't colorize results
* `--version, -v` Print current version
* `--help, -h` Print help

## as a module

give it a stream of javascript files and get a stream of files that use
`module`.

something like:

```js
var jut = require('jut'),
    ls = require('ls-stream'), // for example
    convert = require('dotpath-stream'),
    filter = require('stream-police'),
    fs = require('fs')

var options = {
  module: 'falafel', // for example
  justmatch: false, // default
  fullpath: false, // default
  nocolor: false // default
}

ls('apps')
    .pipe(convert('path')) // reduce ls-stream object to path string
    .pipe(filter({ verify: [/\.js$/] })) // only .js extension
    .pipe(jut(options)) // right over to jut
    .pipe(fs.createWriteStream('falafel-apps.txt') // out to a file
```

## license

MIT
