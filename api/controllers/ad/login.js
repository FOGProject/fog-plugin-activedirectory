const passport = require('passport'),
  jwt = require('jsonwebtoken');
module.exports = {
  friendlyName: 'Login',
  description: 'Login auth.',
  exits: {
    success: {
      description: 'Login Successful'
    }
  },
  fn: async function (inputs, exits) {
    let req = this.req,
      res = this.res;
    await passport.authenticate('activedirectory', async function(err, user, info) {
      if (err || !user) {
        if (req.wantsJSON) {
          res.forbidden();
          return res.end();
        } else {
          return res.redirect('/login');
        }
      }
      await req.login(user, async function(err) {
        if (err) return res.serverError(err);
        await jwt.sign(
          {user: user},
          sails.config.auth.jwt.secret,
          sails.config.auth.jwt.options,
          async function(err, token) {
            //if (err) return res.serverError(err);
            if (!token) return res.ok('Invalid token created');
            if (req.param('remember-me') == 'on') res.cookie('jwt', token, sails.config.auth.jwt.cookie);
            if (req.wantsJSON) return exits.success({token});
            res.redirect('/');
          }
        );
      });
    })(req, res);
  }
};