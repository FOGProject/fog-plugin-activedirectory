const passport = require('passport'),
  ADStrategy = require('passport-activedirectory'),
  adOpts = require('../local'),
  permissions = require('../permissions') || {};
let permKeys = Object.keys(permissions);
for (var i = 0;i < permKeys.length;i++) {
  sails.log.info(permKeys[i]);
}
passport.serializeUser(async function(user, done) {
  done(null, user);
});
passport.deserializeUser(async function(id, done) {
  done(null, user);
});
passport.use(new ADStrategy(
  async function(profile, ad, done) {
    await ad.isUserMemberOf(profile._json.dn, adminMemberOf, async function(err, isMember) {
      let user = profile;
      if (err) return done(err);
      if (!isMember) return done(null, false, {message: 'User not found'});
      user.permissions = _.extend({}, user.permissions, permissions);
      user.isADAuth = true;
      return done(null, user, {message: 'Login Successful'});
    });
  }
));
