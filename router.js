const authentication = require('./controllers/authentication');
const passportService = require('./services/passport');
const passport = require('passport');

//setup passport as middleware! Saying, okay passport, when a user makes a request, authenticate them using the jwt strategy, and DON'T make a session for them (because that's for cookies, not tokens)
const requireAuth = passport.authenticate('jwt', {session: false});
const requireAuthOnLogin = passport.authenticate('local', {session: false});

module.exports = function(app){
    app.get('/', requireAuth, function(req, res){ //saying any request to this route will pass through our auth middleware first! If not authorized, we'll see an "unauthorized" message in the response. If not, we'll see....
      res.send('You are authneticated!');
    });

    app.post('/login', requireAuthOnLogin, authentication.login); //sending the login process through middleware that checks if the password is correct, then to the helper function in authentication.js that gives the now logged in user a token

    app.post('/signup', authentication.signup);//using the auth controller, which handles request logic for this route. Don't need req, res, next and all that because the auth.signup is the callback function!
}

//Now, if we want to protect any routes now, we just have to pass in requireAuth as the second argument (ie as middleware) ANd the third argument will be whatever the protected route is
