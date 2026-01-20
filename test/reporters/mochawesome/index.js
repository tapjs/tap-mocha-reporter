var tap = require('tap')
var fs = require('fs')
var path = require('path')
var childProcess = require('child_process')

tap.test('nested tap', function(tap) {
  return processTapFile('fixtures/nested.tap').then(function(result) {
    tap.deepEqual(cleanAndParse(result), require('./fixtures/nestedExpected.json'))
  })
})

tap.test('flat tap', function(tap) {
  return processTapFile('fixtures/flat.tap').then(function(result) {
    tap.deepEqual(cleanAndParse(result), require('./fixtures/flatExpected.json'))
  })
})

function processTapFile(fileName) {
  var stdout = '', stderr = ''
  var child = childProcess.spawn('node', ['index.js', 'mochawesome'])
  child.stdout.on('data', function(data) {
    stdout += data.toString()
  })
  child.stderr.on('data', function(data) {
    stderr += data.toString()
  })
  child.stdin.write(fs.readFileSync(path.join(__dirname, fileName)))
  child.stdin.end()

  return new Promise(function(resolve) {
    child.on('close', function() {
      resolve(stdout)
    })
  })
}

function cleanAndParse(json) {
  var re = '"uuid": "([^"]{36})",\\n'
  var i = 0
  var found = {}
  json = json
    .replace(new RegExp(re, 'g'), function(m) {
      var r = '<UUID-' + (i++) + '>'
      found[m.replace(new RegExp(re), '$1')] = r
      return '"uuid": "' + r + '",\n'
    })
  for (var k in found) {
    json = json.split(k).join(found[k])
  }
  json = JSON.parse(json)
  json.stats.start = '<START>'
  json.stats.end = '<END>'
  json.stats.duration = '<DURATION>'
  return json
}
