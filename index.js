#!/usr/bin/env node

module.exports = Formatter

var util = require('util')
var reporters = require('./lib/reporters/index.js')
var Writable = require('stream').Writable
var Runner = require('./lib/runner.js')

util.inherits(Formatter, Writable)

function Formatter (type, options) {
  if (!reporters[type]) {
    console.error('Unknown format type: %s\n\n%s', type, avail())
    type = 'silent'
  }

  var runner = this.runner = new Runner(options)
  this.reporter = new reporters[type](this.runner)
  Writable.call(this, options)

  runner.on('end', function () {
    process.nextTick(function () {
      if (!runner.parser.ok)
        process.exit(1)
    })
  })
}

Formatter.prototype.write = function () {
  return this.runner.write.apply(this.runner, arguments)
}

Formatter.prototype.end = function () {
  return this.runner.end.apply(this.runner, arguments)
}

function avail () {
  var types = Object.keys(reporters).sort().reduce(function (str, t) {
    var ll = str.split('\n').pop().length + t.length
    if (ll < 40)
      return str + ' ' + t
    else
      return str + '\n' + t
  }, '').trim()

  return 'Available format types:\n\n' + types
}


function usage (err) {
  console[err ? 'error' : 'log'](function () {/*
Usage:
  tap-mocha-reporter <type>

Reads TAP data on stdin, and formats to stdout using the specified
reporter.  (Note that some reporters write to files instead of stdout.)

%s
*/}.toString().split('\n').slice(1, -1).join('\n'), avail())
}

if (require.main === module) {
  var type = process.argv[2]
  if (!type)
    return usage()

  process.stdin.pipe(new Formatter(type))
}
