const passport = require('passport'),
  ADStrategy = require('passport-activedirectory'),
  adOpts = require('../adopts'),
  uuid = require('uuid'),
  adperms = require('../adperms');
passport.serializeUser(async (user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  await Aduser.findOne({id}).populateAll().exec(async (err, user) => {
    if (err) return done(err);
    done(null, user);
  });
});
let permKeys = Object.keys(adperms.memberOf);
permKeys.forEach(async (member) => {
  let roleNames = adperms.memberOf[member],
    roleIDs = [];
  await passport.use(new ADStrategy(
    adOpts.adopts,
    async (profile, ad, done) => {
      await Role.find({or: [{name: roleNames},{id: roleNames}]}, async (err, roles) => {
        if (err) return done(null, false, {message: err});
        for (var i = 0;i < roles.length;i++) {
          roleIDs.push(roles[i].id);
        }
        await ad.isUserMemberOf(profile._json.dn, member, async (err, isMember) => {
          if (err) return done(err, false, {message: err});
          if (isMember) {
            let aduser = {
              objectGuid: uuid.v4(profile._json.dn),
              displayName: profile._json.displayName,
              roles: roleIDs
            };
            await Aduser.findOrCreate({objectGuid: aduser.objectGuid}, aduser, async (err, user) => {
              if (err) return done(err, false, {message: err});
              if (user) user.isADAuth = true;
              await Aduser.findOne({id: user.id}).populate('roles').exec(async (err, user) => {
                done(null, user, {message: 'Login Successful'});
              });
            });
          }
        });
      });
    }
  ));
});
