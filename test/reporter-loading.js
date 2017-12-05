const TSR = require('../index.js')
const tap = require('tap')

let restoreConsoleError = console.error
const UKNWN_TYPE = 'unknown'

//Error messaging for unknown reporter types.
console.error = function(msg, type, avail) {
  tap.equal(type, UKNWN_TYPE, 'was not passed reporter type.')
  tap.equal(msg, 'Unknown format type: %s\n\n%s')
}

TSR(UKNWN_TYPE)

console.error = restoreConsoleError
