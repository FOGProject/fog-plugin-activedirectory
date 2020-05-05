const passport = require('passport'),
  ADStrategy = require('passport-activedirectory'),
  adOpts = require('../adopts'),
  uuid = require('uuid'),
  adperms = require('../adperms');
passport.serializeUser(async (user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  await Aduser.findOne({id}).populateAll().exec(async function(err, user) {
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
      await Role.find({or: [{name: roleNames},{id: roleNames}]})
        .then((roles) => {
          for (var i = 0;i < roles.length;i++) {
            roleIDs.push(roles.id);
          }
        })
        .catch((err) => {
          return done(err, false, {message: err});
        });
      await ad.isUserMemberOf(profile._json.dn, member, async (err, isMember) => {
        if (err) return done(err, false, {message: err});
        if (isMember) {
          let aduser = {
            objectGuid: uuid.v4(profile._json.dn),
            displayName: profile._json.displayName,
            roles: roleIDs
          };
          await Aduser.findOrCreate({objectGuid: aduser.objectGuid}, aduser)
            .then((user) => {
              sails.log.info(user);
              user = user.toJSON();
              sails.log.info(user);
              return done(null, user, {message: 'Login Successful'});
            })
            .catch((err) => {
              return done(err, false, {message: err});
            });
        }
      });
      return done(null, false, {message: 'No user found or matched'});
    }
  ));
});
