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
