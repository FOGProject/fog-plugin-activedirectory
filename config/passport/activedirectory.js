const passport = require('passport'),
  ADStrategy = require('passport-activedirectory'),
  adOpts = require('../adopts'),
  adperms = require('../adperms') || {};
passport.serializeUser(async function(user, done) {
  done(null, user);
});
passport.deserializeUser(async function(user, done) {
  done(null, user);
});
passport.use(new ADStrategy(
  adOpts.adopts,
  async function(profile, ad, done) {
    for (var i = 0;i < adperms.memberOf.length;i++) {
      memberOf = adperms.memberOf[i];
      let permKeys = Object.keys(memberOf);
      for (var j = 0;j < permKeys.length;j++) {
        member = permKeys[j];
        await ad.isUserMemberOf(profile._json.dn, member, function(err, isMember) {
          let user = profile,
            permissions = memberOf[member].permissions;
          if (err) return done(err);
          if (!isMember) return;
          user.permissions = {};
          user.permissions = _.merge(user.permissions, permissions);
          user.isADAuth = true;
          user.displayName = user._json.dn.displayName || `${user.name.givenName} ${user.name.familyName}`;
          return done(null, user, {message: 'Login Successful'});
        });
      }
    }
    return done(null, false, {message: 'User not found'});
  }
));
