const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

//define our user model
const userSchema = new Schema({
  email: {type: String, unique: true, lowercase: true},
  password: String
})

//on Save Hook, encrypt password using bcrypt
//before saving the user model, run this function. Literally 'pre-save'
userSchema.pre('save', function(next){
  //this gives us access to the user model. The context IS the user, and we get context via 'this'. Now have access to user.email and user.password
  const user = this;

  //generate a salt, which is a random string of characters, then run callback
  bcrypt.genSalt(10, function(err, salt){
    if(err){return next(err);}

    //hash (or encrypt) the password using the salt, then run callback. The hash in the password is the encrypted password
    bcrypt.hash(user.password, salt, null, function(err, hash){
      if(err){return next(err);}

      user.password = hash;//assign the new user's password as the hashed password
      next();//move on to next step (ie save user to db)
    })
  })
});

//create method for comparing passwords. the userSchema.methods thingy lets us create any methods tied to an instance of this model. Can use statics too, and with that, we could call the method on the model directly (don't need to create a class)
userSchema.methods.comparePassword = function(candidatePassword, callback) {
  const user = this;//same as above. The user is the context here

  //hey, bcrypt, compare the candidatePassword with the password in the db
  bcrypt.compare(candidatePassword, user.password, function(err, isMatch){
    if(err){return callback(err);}

    //as you'll see in our Local Strategy in passport.js, this callback is literally called as the callback when we invoke this function.
    callback(null, isMatch);
  })
};


//create model class
const User = mongoose.model('user', userSchema);

module.exports = User;
