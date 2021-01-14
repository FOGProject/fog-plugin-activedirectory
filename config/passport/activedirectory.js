const passport = require('passport'),
  ADStrategy = require('passport-activedirectory'),
  adOpts = require('../adopts'),
  uuid = require('uuid'),
  adperms = require('../adperms');
passport.serializeUser(async function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(async function(id, done) {
  await Aduser.findOne({id}).populateAll().exec(function(err, user) {
    done(err, user);
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
        if (err) return done(err);
        for (var i = 0;i < roles.length;i++) {
          roleIDs.push(roles[i].id);
        }
        await ad.isUserMemberOf(profile._json.dn, member, async (err, isMember) => {
          if (err) return done(err);
          let aduser = {
            objectGuid: uuid.v4(profile._json.dn),
            displayName: profile._json.displayName,
            roles: roleIDs
          };
          await Aduser.findOrCreate({objectGuid: aduser.objectGuid}, aduser).then((user) => {
            user.isADAuth = true;
            Aduser.findOne({id: user.id}).populate('roles').then((user) => {
              done(null, user, {message: 'Login Successful'});
            }).catch(done);
          }).catch(done);
        });
      });
    }
  ));
});
