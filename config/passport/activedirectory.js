const passport = require('passport'),
  ADStrategy = require('passport-activedirectory'),
  JWTStrategy = require('passport-jwt-cookiecombo'),
  adOpts = require('../adopts'),
  uuid = require('uuid'),
  jwt = require('jsonwebtoken'),
  locals = require('../../../../config/local'),
  opts = {
    secretOrPublicKey: locals.auth.jwt.secret,
    jwtVerifyOptions: locals.auth.jwt.options,
    session: locals.auth.jwt.session
  },
  adperms = require('../adperms');
passport.serializeUser(async function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(async function(id, done) {
  await Aduser.findOne({id}).populateAll().exec(async function(err, user) {
    sails.log.info(user);
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
        if (err) return done(err, false, {message: err});
        if (!roles) return done(null, false, {message: 'No roles found'});
        for (var i = 0;i < roles.length;i++) {
          let role = roles[i];
          roleIDs.push(role.id);
        }
        await ad.isUserMemberOf(profile._json.dn, member, async (err, isMember) => {
          if (err) return done(err, false, {message: err});
          if (!isMember) return done(null, false, {message: 'User is not member of this group'});
          let aduser = {
            objectGuid: uuid.v4(profile._json.dn),
            displayName: profile._json.displayName,
            roles: roleIDs
          };
          sails.log.info(aduser);
          await Aduser.findOrCreate({objectGuid: aduser.objectGuid}, aduser, async (err, user) => {
            if (err) return done(err, false, {message: err});
            if (!user) return done(null, false, {message: 'Unable to find or create AD User object'});
            await Aduser.findOne({id: user.id}).populateAll().exec(async (err, adu) => {
              if (err) return done(err, false, {message: err});
              done(null, adu, {message: 'Login Successful'});
            });
          });
        });
      });
    }
  ));
});
passport.use(new JWTStrategy(opts,
  async (jwt_payload, done) => {
    if (!jwt_payload) return done(null, false, {message: 'No token passed'});
    if (!jwt_payload.user) return done(null, false, {message: 'No user information present'});
    await Aduser.findOne({id: jwt_payload.user}).populateAll().exec(async function(err, user) {
      sails.log.info(user);
      if (err) return done(err, false, {message: 'An error occurred locating the user'});
      if (!user) return done(null, false, {message: 'AD User not found'});
      user.isADAuth = true;
      user.isJWTAuth = true;
      done(null, user, {message: 'Login Successful'});
    });
  }
));
