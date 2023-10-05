// minimal mock of mocha's Suite class for formatters

module.exports = Suite

function Suite (title, parent) {
  this.root = !parent
  this.title = title
  this.suites = []
  this.tests = []
  this.ok = true
  this._beforeEach = []
  this._beforeAll = []
  this._afterEach = []
  this._afterAll = []

  Object.defineProperty(this, 'parent', {
    value: parent,
    writable: true,
    configurable: true,
    enumerable: false
  })

  if (parent) {
    parent.suites.push(this)
  }
}

Suite.prototype.fullTitle = function () {
  return this.titlePath().join(' ').trim()
}

Suite.prototype.titlePath = function () {
  var title = [(this.title || '').trim()]
  if (this.parent && this.parent.titlePath)
    return this.parent.titlePath().concat(title)
  return title
}
