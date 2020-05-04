const passport = require('passport'),
  ADStrategy = require('passport-activedirectory'),
  adOpts = require('../local'),
  permissions = require('../permissions') || {};
passport.serializeUser(async function(user, done) {
  done(null, user);
});
passport.deserializeUser(async function(id, done) {
  done(null, user);
});
passport.use(new ADStrategy(
  async function(profile, ad, done) {
    for (var i = 0;i < permissions.memberOf.length;i++) {
      let permKeys = Object.keys(permissions.memberOf[i]);
      for (var j = 0;j < permKeys.length;j++) {
        await ad.isUserMemberOf(profile._json.dn, permKeys[i], function(err, isMember) {
          let user = profile;
          if (err) return done(err);
          if (!isMember) continue;
          user.permissions = _.extend(user.permissions, permissions);
          user.isADAuth = true;
          return done(null, user, {message: 'Login Successful'});
        });
      }
    }
    return done(null, user, {message: 'User not found'});
  }
));
