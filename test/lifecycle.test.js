const sails = require('sails');

before(function(done) {
  this.timeout(11000);
  sails.lift({
    appPath: '../..',
    hooks: {
      'fog-plugin-activedirectory': require('../'),
      grunt: false
    },
    log: {level: 'error'}
  }, (err) => {
    if (err) return done(err);
    done();
  });
});
after((done) => {
  sails.lower(done);
});
