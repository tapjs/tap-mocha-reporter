/**
 * Module dependencies.
 */

var Base = require('./base'),
  utils = require('../utils')

/**
 * Expose `mochawesome`.
 */

exports = module.exports = MochawesomeReporter

/**
 * Initialize a new `mochawesome` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function MochawesomeReporter(runner) {
  var self = this
  Base.call(this, runner)

  var allTests = []
  var allSuites = []

  var rootUUID = uuidv4()
  var currentSuite = null
  var bailed = false

  // mochawesome needs a single root
  var root = {
    uuid: rootUUID,
    title: '',
    fullFile: '',
    file: '',
    beforeHooks: [],
    afterHooks: [],
    tests: [],
    suites: [],
    passes: [],
    failures: [],
    pending: [],
    skipped: [],
    duration: 0,
    root: true,
    rootEmpty: true,
    _timeout: 2000
  }

  // write tests in the root to this suite
  // mochawesome needs at least one suite to display correctly
  var rootSuite = {
    uuid: uuidv4(),
    title: '',
    fullFile: '',
    file: '',
    beforeHooks: [],
    afterHooks: [],
    tests: [],
    suites: [],
    passes: [],
    failures: [],
    pending: [],
    skipped: [],
    duration: 0,
    root: false,
    rootEmpty: false,
    _timeout: 2000
  }

  runner.on('bailout', function (bailout, suite) {
    if (currentSuite) {
      runner.emit('suite end', currentSuite)
    }
    if (bailed) return
    bailed = true
  })

  runner.on('suite', function (suite) {
    var parentSuite = currentSuite
    currentSuite = {
      uuid: uuidv4(),
      title: suite.title,
      fullFile: suite.root ? suite.title : '',
      file: suite.root ? suite.title : '',
      beforeHooks: [], // TODO
      afterHooks: [], // TODO
      tests: [],
      suites: [],
      passes: [],
      failures: [],
      pending: [],
      skipped: [],
      duration: Math.round(suite.duration),
      root: false,
      rootEmpty: false,
      _timeout: 2000
    }
    allSuites.push(currentSuite)

    Object.defineProperty(currentSuite, 'parent', {
      value: parentSuite,
      writable: true,
      configurable: true,
      enumerable: false
    })
  })

  runner.on('suite end', function () {
    var tests = currentSuite.tests
    var pickUuid = function(t){return t.uuid}
    var passes = tests.filter(function(t){return t.pass})
    var failures = tests.filter(function(t){return t.fail})
    var pending = tests.filter(function(t){return t.pending})
    var skipped = tests.filter(function(t){return t.skipped})
    currentSuite.passes = passes.map(pickUuid)
    currentSuite.failures = failures.map(pickUuid)
    currentSuite.pending = pending.map(pickUuid)
    currentSuite.skipped = skipped.map(pickUuid)

    if (currentSuite.parent) {
      currentSuite.parent.suites.push(currentSuite)
    } else {
      root.suites.push(currentSuite)
    }
    currentSuite = currentSuite.parent
  })

  runner.on('test end', function(test) {
    // write the test to the root if not in a suite
    var mySuite = currentSuite || rootSuite
    var _test = {
      title: test.title,
      fullTitle: test.fullTitle(),
      timedOut: false, // TODO
      duration: Math.round(test.duration),
      state: test.result.ok ? 'passed' : 'failed',
      speed: test.speed,
      pass: !!test.result.ok && !test.result.todo && !test.result.skip,
      fail: !test.result.ok && !test.result.todo && !test.result.skip,
      pending: !!test.result.todo,
      context: null, // TODO
      code: utils.clean(test.fn.toString()),
      err: errorJSON(test.err || {}),
      uuid: uuidv4(),
      parentUUID: mySuite.uuid,
      isHook: false, // TODO
      skipped: !!test.result.skip
    }
    mySuite.tests.push(_test)
    allTests.push(_test)
  })

  runner.on('end', function() {
    // if any tests were at the root, include the rootSuite
    if (rootSuite.tests.length) {
      root.suites.push(rootSuite)
    }
    var passes = allTests.filter(function(t){return t.pass})
    var failures = allTests.filter(function(t){return t.fail})
    var pending = allTests.filter(function(t){return t.pending})
    var skipped = allTests.filter(function(t){return t.skipped})
    var obj = {
      stats: {
        suites: allSuites.length,
        tests: allTests.length,
        passes: passes.length,
        pending: pending.length,
        failures: failures.length,
        start: self.stats.start,
        end: self.stats.end,
        duration: Math.round(self.stats.duration),
        testsRegistered: allTests.length,
        passPercent: passes.length / allTests.length * 100,
        pendingPercent: pending.length / allTests.length * 100,
        other: 0, // TODO
        hasOther: false, // TODO
        skipped: skipped.length,
        hasSkipped: !!skipped.length
      },
      results: [root],
      meta: {
        mocha: {
          version: '7.1.0'
        },
        mochawesome: {
          options: {
            quiet: false,
            reportFilename: 'mochawesome',
            saveHtml: true,
            saveJson: true,
            consoleReporter: 'spec',
            useInlineDiffs: false,
            code: true
          },
          version: '5.0.0'
        },
        marge: {
          options: {},
          version: '4.1.0'
        }
      }
    }

    runner.testResults = obj

    process.stdout.write(JSON.stringify(obj, null, 2))
  })
}

/**
 * Generate a UUID.
 * @return {String}
 */

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Transform `error` into a JSON object.
 * @param {Error} err
 * @return {Object}
 */

function errorJSON(err) {
  var res = {}
  Object.getOwnPropertyNames(err).forEach(function(key) {
    res[key] = err[key]
  }, err)
  return res
}
