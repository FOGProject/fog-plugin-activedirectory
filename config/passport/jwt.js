const passport = require('passport'),
  JWTStrategy = require('passport-jwt-cookiecombo'),
  jwt = require('jsonwebtoken'),
  locals = require('../../../../config/local'),
  opts = {
    secretOrPublicKey: locals.auth.jwt.secret,
    jwtVerifyOptions: locals.auth.jwt.options,
    session: locals.auth.jwt.session
  };
passport.serializeUser(async (user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  await Aduser.findOne({id}).populateAll().exec(async (err, user) => {
    if (err) return done(err);
    user = user.toJSON();
    done(null, user, {message: 'User deserialized'});
  });
});
passport.use('ad-jwt-cookiecombo', new JWTStrategy(opts,
  async (jwt_payload, done) => {
    if (!jwt_payload) return done(null, false, {message: 'No token passed'});
    if (!jwt_payload.user) return done(null, false, {message: 'No user information present'});
    await Aduser.findOne({id: jwt_payload.user}).populateAll().exec(async (err, user) => {
      if (err) return done(err, false, {message: 'An error occurred locating the user'});
      if (!user) return done(null, false, {message: 'No AD user found'});
      done(null, user, {message: 'JWT Auth verified'});
    });
  }
));
