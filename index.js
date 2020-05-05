module.exports = function(sails) {
  var loader = require('sails-util-micro-apps')(sails);
  // Load policies under ./api/policies and config under ./config
  loader.configure({
    //hooks: __dirname + '/api/hooks',
    //policies: __dirname + '/api/policies',
    config: __dirname + '/config'
  });

  return {
    initialize: function (next) {
      /**
       * Load helpers under ./api/helpers
       * Load controllers under ./api/controllers
       */
      loader.inject(
        {
          controllers: __dirname + '/api/controllers',
          models: __dirname + '/api/models',
          //helpers: __dirname + '/api/helpers',
        },
        (err) => {
          return next(err);
        }
      );
    }
  };
};
