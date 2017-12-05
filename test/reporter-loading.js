var TSR = require('../index.js')
var tap = require('tap')

var restoreConsoleError = console.error
var UKNWN_TYPE = 'unknown'

//Error messaging for unknown reporter types.
console.error = function(msg, type, vail) {
  tap.equal(type, UKNWN_TYPE, 'reporter type should be "unknown".')
  tap.equal(msg, 'Unknown format type: %s\n\n%s', 'should have correct error msg' )
}

TSR(UKNWN_TYPE)

//Load from an improperly exported reporter.
console.error = function(msg) {
  var modPath = './test/stubs/bad-reporter'
  var expected = 'Failed to load ' + modPath + ': Reporter ' + modPath + ' was not a function.'
  tap.equal(actual, expected, 'should have helpful error for bad reporters.')
}

//Load from a module that exists. 

console.error = function() {
  tap.fail('needs a different error message')
}

var reporter = TSR('./lib/reporters/silent')

tap.pass('able to require reporter from module path')
console.error = restoreConsoleError

