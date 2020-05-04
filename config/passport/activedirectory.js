const passport = require('passport'),
  ADStrategy = require('passport-activedirectory'),
  adOpts = require('../adopts'),
  adperms = require('../adperms') || {};
passport.serializeUser(async function(user, done) {
  done(null, user);
});
passport.deserializeUser(async function(id, done) {
  done(null, user);
});
passport.use(new ADStrategy(
  adOpts.adopts,
  async function(profile, ad, done) {
    for (var i = 0;i < permissions.memberOf.length;i++) {
      let permKeys = Object.keys(permissions.memberOf[i]);
      for (var j = 0;j < permKeys.length;j++) {
        await ad.isUserMemberOf(profile._json.dn, permKeys[i], function(err, isMember) {
          let user = profile;
          if (err) return done(err);
          if (!isMember) continue;
          user.permissions = {};
          user.permissions = _.merge(user.permissions, permissions, permissions.memberOf[permKeys[i]].permissions);
          user.isADAuth = true;
          return done(null, user, {message: 'Login Successful'});
        });
      }
    }
    return done(null, user, {message: 'User not found'});
  }
));
