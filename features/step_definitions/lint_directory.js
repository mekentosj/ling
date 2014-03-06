var assert = require('assert');
var exec = require('child_process').exec;

module.exports = function() {
  var cmd;

  this.Given(/^the features included in this project$/, function(cb) {
    cb();
  });

  this.When(/^I run `(.*)`$/, function(lingCommand, cb) {
    cmd = lingCommand;
    cb();
  });

  this.Then(/^I should see colourised feature files$/, function(cb) {
    exec(cmd, function(err, stdout, stderr) {
      assert(stdout.match(/As an author of features/), 'The output did not match the expected text');
      if (stderr.length) cb.fail(new Error('stderr should be empty'));
      cb();
    });
  });
};
