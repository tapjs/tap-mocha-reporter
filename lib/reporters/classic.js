// Type of output that tap 0.x did by default:

// ok test/00-setup.js ................................... 18/18
// ok test/abort.js ........................................ 2/2
// ok test/bash-comparison.js .......................... 887/887
// ok test/broken-symlink.js ............................. 81/81
// ok test/cwd-test.js ................................. 420/420
// ok test/empty-set.js .................................... 9/9
// ok test/error-callback.js ............................... 3/3
// ok test/follow.js ....................................... 5/5
// ok test/global-leakage.js ............................... 2/2
// ok test/globstar-match.js ............................... 2/2
// ok test/has-magic.js .................................. 10/10
// ok test/ignore.js ..................................... 49/49
// ok test/mark.js ....................................... 53/53
// ok test/negation-test.js ................................ 4/4
// ok test/new-glob-optional-options.js .................... 2/2
// ok test/nocase-nomagic.js ............................... 6/6
// ok test/nodir.js .................................... 159/159
// ok test/nonull.js ....................................... 9/9
// ok test/pause-resume.js ............................... 42/42
// ok test/readme-issue.js ................................. 4/4
// ok test/realpath.js ................................... 21/21
// ok test/root-nomount.js ............................... 78/78
// ok test/root.js ....................................... 78/78
// ok test/slash-cwd.js .................................... 3/3
// ok test/stat.js ....................................... 16/16
// ok test/sync-cb-throw.js ................................ 7/7
// ok test/zz-cleanup.js ................................... 2/2
// total ............................................. 1972/1972
//
// ok

// Skipped tests just show "skipped: <n>" after the top line.
// Output todos and failures as-is.
// Use color.

exports = module.exports = Classic
var Base = require('./base')
  , cursor = Base.cursor
  , color = Base.color
  , yaml = require('js-yaml')
  , util = require('util')
  , fancy = Base.useColors

util.inherits(Classic, Base)

function Classic (runner) {
  Base.call(this, runner);

  var self = this

  var grandTotal = 0
  var grandPass = 0

  var bailed = false
  var hadFails = false
  var currentSuite = null
  var tests = []
  var skipped = 0
  var skipMsg = []
  var todo = []
  var fails = []
  var total = 0
  var pass = 0
  var tickDots = 0
  var tickColor = 'checkmark'

  runner.on('bailout', function (bailout, suite) {
    if (currentSuite)
      runner.emit('suite end', currentSuite)
    if (bailed)
      return
    bailed = true
    console.log(Base.color('fail', 'Bail out! ' + bailout))
  })

  runner.on('suite', function (suite) {
    if (!suite.root)
      return

    if (fancy) {
      process.stdout.write(suite.title + ' ')
      tickDots = 0
      tickColor = 'checkmark'
    }

    currentSuite = suite
    tests = []
    todo = []
    fails = []
    skipMsg = []
    skipped = 0
    pass = 0
    total = 0
  })

  runner.on('suite end', function (suite) {
    if (!suite.root)
      return

    if (fancy)
      Base.cursor.beginningOfLine()

    currentSuite = null
    var len = 60
    var title = suite.title || '(unnamed)'
    var num = pass + '/' + total
    var dots = len - title.length - num.length - 2
    if (dots < 3)
      dots = 3
    dots = ' ' + new Array(dots).join('.') + ' '
    if (pass === total)
      num = Base.color('checkmark', num)
    else if (fails.length)
      num = Base.color('fail', num)
    else
      num = Base.color('pending', num)

    console.log(title + dots + num)

    if (fails.length) {
      var failMsg = ''
      fails.forEach(function (t) {
        failMsg += Base.color('fail', 'not ok ' + t.name) + '\n'
        if (t.diag)
          failMsg += indent(yaml.safeDump(t.diag), 2) + '\n'
      })
      console.log(indent(failMsg, 2))
    }

    if (todo.length) {
      var todoMsg = ''
      var bullet = Base.color('pending', '~ ')
      todo.forEach(function (t) {
        if (t.todo !== true)
          t.name += ' - ' + Base.color('pending', t.todo)
        todoMsg += bullet + t.name + '\n'
        if (t.diag)
          todoMsg += indent(yaml.safeDump(t.diag), 4) + '\n'
      })
      console.log(indent(todoMsg, 2))
    }

    if (skipped) {
      var fmt = Base.color('skip', indent('Skipped: %d', 2))
      console.log(fmt, skipped)
      if (skipMsg.length)
        console.log(indent(skipMsg.join('\n'), 4))
      console.log('')
    }
  })

  runner.on('test', function (test) {
    total ++
    grandTotal ++
    var t = test.result
    if (fancy && currentSuite) {
      var max = 57 - currentSuite.title.length
      if (max < 3)
        max = 3

      if (tickDots > max) {
        tickDots = 0
        Base.cursor.deleteLine()
        Base.cursor.beginningOfLine();
        process.stdout.write(currentSuite.title + ' ')
      }
      tickDots ++

      if (t.todo &&
          (tickColor === 'checkmark' || tickColor === 'skip'))
        tickColor = 'pending'
      else if (t.skip && tickColor === 'checkmark')
        tickColor = 'skip'
      else if (!t.ok)
        tickColor = 'fail'

      process.stdout.write(Base.color(tickColor, '.'))
    }

    if (t.skip) {
      skipped += 1
      if (t.skip !== true)
        skipMsg.push(t.name + ' ' + Base.color('skip', t.skip))
      else
        skipMsg.push(t.name)
    }
    else if (t.todo)
      todo.push(t)
    else if (!t.ok) {
      fails.push(t)
      hadFails = true
    }
    else {
      pass ++
      grandPass ++
    }
  })

  runner.on('end', function () {
    total = grandTotal
    pass = grandPass
    tests = []
    todo = []
    fails = []
    skipMsg = []
    skipped = 0
    if (hadFails)
      fails = [,,,]
    runner.emit('suite end', { title: 'total', root: true })
    self.failures = []
    self.epilogue();

    if (grandTotal === grandPass) {
      console.log(Base.color('checkmark', '\n  ok'))
    }
  })
}

function indent (str, n) {
  var ind = new Array(n + 1).join(' ')
  str = ind + str.split('\n').join('\n' + ind)
  return str.replace(/(\n\s*)+$/, '\n')
}
