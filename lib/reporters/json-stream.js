/**
 * Module dependencies.
 */

var Base = require('./base')
  , clean = Base.clean
  , color = Base.color;

/**
 * Expose `List`.
 */

exports = module.exports = List;

/**
 * Initialize a new `List` test reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function List(runner) {
  Base.call(this, runner);

  var self = this
    , stats = this.stats
    , total = runner.total;

  runner.on('start', function(){
    console.log(JSON.stringify(['start', { total: total }]));
  });

  runner.on('pass', function(test){
    console.log(JSON.stringify(['pass', clean(test)]));
  });

  runner.on('fail', function(test, err){
    test = clean(test);
    console.log(JSON.stringify(['fail', test]));
  });

  runner.on('end', function(){
    process.stdout.write(JSON.stringify(['end', self.stats]));
  });
}
