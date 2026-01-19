// minimal mock of the mocha Test class for formatters

module.exports = Test

function Test (result, suite) {
  this.result = result
  this._slow = 75
  this.duration = result.time
  this.title = result.name || result.skip || ''
  this.pending = result.todo || false
  if (result.ok) {
    this.state = result.skip ? 'skipped' : 'passed'
  } else {
    this.state = 'failed'
  }
  if (result.diag) {
    if (result.diag.source) {
      var source = result.diag.source
      this.fn = {
        toString: function () {
          return 'function(){' + source + '\n}'
        }
      }
    } else {
      this.context = {
        title: 'diagnostic',
        value: result.diag,
      }
    }
  }

  Object.defineProperty(this, 'suite', {
    value: suite,
    writable: true,
    configurable: true,
    enumerable: false
  })

  if (suite) {
    suite.tests.push(this)
    if (!result.ok) {
      for (var ancestor = suite; ancestor; ancestor = ancestor.parent) {
        ancestor.ok = false
      }
    }
  }
}

Test.prototype.fullTitle = function () {
  return this.titlePath().join(' ').trim()
}

Test.prototype.titlePath = function () {
  var title = [(this.title || '').trim()]
  if (this.suite && this.suite.titlePath)
    return this.suite.titlePath().concat(title)
  return title
}

Test.prototype.slow = function (ms){
  return 75
}

Test.prototype.fn = {
  toString: function () {
    return 'function () {\n}'
  }
}
