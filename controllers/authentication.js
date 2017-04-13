//all logic for auth requests goes here! We'll authenticate users upon signup here.
const User = require('../models/user'); //import User class
const jwt = require('jwt-simple');
const config = require('../config');

//create function that will take user's id and encode it with our secret key to create a jwt
function userJWT(user){
  const timestamp = new Date().getTime();
  return jwt.encode({sub: user.id, iat: timestamp}, config.secret);//first arg is info we want to encode, 2nd arg is how we want to encrypt it (ie with our secret key). {sub: user.id, iat: timestamp} is a convention for issuing web tokens. Sub is subject sub field of the token, iat is issued at time
}
//create a helper function to hanlde logins and to give the users tokens upon signing in
exports.login = function(req, res, next){
  //User is authorized, just need to give them a token now. Remember, once user is authorized, Passport assigns them to req.user!
  res.send({token: userJWT(req.user)});

}


//create a helper function to handle signups
exports.signup = function(req, res, next){
  const email = req.body.email;
  const password = req.body.password;

  //make sure both email and password are filled out
  if(!email || !password){
    return res.status(422).send({error: 'Email and password are required!'});//want a return statement here so it stops the whole process, preventing it from still trying to create a user!
  }

  //see if a user with given email exists using req.body
  User.findOne({email: email}, function(err, existingUser){
    //handle any potential errors associated with db
    if(err){ return next(err); }

    //if email exists, throw an error
    if(existingUser){
      return res.status(422).send({error: 'That email is taken'});//again, use return keyword to stop evertying
    }

    //if email is free, create new user and save it to db
    if(!existingUser){
      const user = new User({email: email, password: password});
      user.save(function(err){
        if(err){return next(err)};

        //if all good, respond by giving the new user a web token (using the function defined above) which they can use to make authenticated requests in the future!
        res.json({token: userJWT(user)});
      });
    }
  })
}
