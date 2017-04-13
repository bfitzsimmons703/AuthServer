const passport = require('passport'),
      User = require('../models/user'),
      config = require('../config'),
      LocalStrategy = require('passport-local'),
      JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt;



//Create Local Strategy
const localLogin = new LocalStrategy({usernameField: 'email'}, function(email, password, done){
  //verify email and password
    User.findOne({email: email}, function(err, user){
      if (err) {return done(err);}
      if (!user) {
        return done(null, false)//no error per se, but no user so false
      }
      //compare passwords - is the request password == user.password? Well, user.password is stored as a salt, so need to decode it
      user.comparePassword(password, function(err, isMatch){
        if(err){ return done(err); }
        if(!isMatch){ return done(null, false); } //if password's didn't match, no error technically, but false on the user

        return done(null, user); //if all is well, return done with no error and the user
      })

    })
  //call done with the user if email and password are correct. Otherwise, call done with false
});

//setup options for passport's JWT Strategy. Need to tell our strategy where to look on the request for the token payload
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),//saying whenever a request comes in and we want passport to handle it, it needs to look at the header of the request, specifically the part called authorization
  secretOrKey: config.secret //the token is encrypted remember! So we need the secret key we made to decrypt it :)

};


//create JWT Strategy
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done){ //payload is the decoded JWT token! It's the {sub: userId, iat:timestamp} thing from authentication controller!! 'done' is a callback function we need to call depending on whether we can authenticate the user or not

//The done callback is supplied by Passport. When we return a done(user), Passport assigns the user model to req.user

    //see if the user.id in the payload exists in our db. If yes, call 'done' with that user. If not, call 'done' WITHOUT the user object
    User.findById(payload.sub, function(err, user){
      if(err){return done(err, false);} //no user, so second argument is false, meaning nope, we did not find a user

      if(user){
        done(null, user) //if we found the user, call done WITHOUT an error object (hence the null), plus that user
      } else {
        done(null, false)//if we did not find a user, call done without an error (everything was fine, just no user) and false (because, again, no user)
      }
    })
});

//Tell Passport to use this JWT Strategy that we so kindly made for it
passport.use(jwtLogin);
passport.use(localLogin);
