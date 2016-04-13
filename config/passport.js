// lab 12 ess passport.js in config
var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

var User = require('../models/user');

var configAuth = require('./auth');

module.exports = function(passport){
	// passport session set up - need the ability to
	// serialize (save to disk - a database) and
	// unserialize (extract from database) sessions
	
	// save user in session store
	passport.serializeUser(function(user, done){
		done(null, user.id);
	});
	
	// get user by ID, from session store
	passport.deserializeUser(function(id, done){
		User.findById(id, function(err, user){
			done(err, user);
		} );
	});
	
	// Twitter
	passport.use(new TwitterStrategy( {
        consumerKey : configAuth.twitterAuth.consumerKey,
        consumerSecret : configAuth.twitterAuth.consumerSecret,
        callbackUrl : configAuth.twitterAuth.callbackURL
  }, function(token, tokenSecret, profile, done) {

    process.nextTick(function() {

      console.log('response from twitter');
      console.log(profile);

      User.findOne({ 'twitter.id' : profile.id }, function(err, user){
        if (err) {
          return done(err);
        }

        //this user already has an account on our site. Return this user.
        if (user) {
          return done(null, user);
        }

        //The user does not have an account with our site yet.
        //Make a new user and return it.
        else {
          var newUser = new User();
		  newUser.twitter = {};
          newUser.twitter.id = profile.id;
          newUser.twitter.token = token;
          newUser.twitter.username = profile.username;
          newUser.twitter.displayName = profile.displayName;

          newUser.save(function(err) {
            if (err) {
              throw err;
            }
            return done(null, newUser);
          })
        }
      });
    })
  }));
	
	// sign up new user
	passport.use('local-signup', new LocalStrategy( {
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	}, function (req, username, password, done) {
		
		// when current event loop done call callback fn
		process.nextTick(function () {
			
			// search for user with this username
			User.findOne({'local.username': username}, function (err, user) {
				if (err){
					return done(err);
				}
				
				// check to see if username is already signed up
				if (user){
					console.log('a user with that username already exists');
					return done(null, false, req.flash('signupMessage', 'Sorry, username already taken') );
				}
				
				// else, that username is available; create a new use and save to db
				var newUser = new User();
				newUser.local.username = username;
				newUser.local.password = newUser.generateHash(password);
				
				newUser.save(function(err){
					if(err){
						throw err;
					}
					// if successfully saved, return new user object
					return done(null, newUser);
				} );  // newUser.save
				
			}  );  // newUser.findOne
			
		} );  // process.nextTick
		
	} )); // passport.use
	
	passport.use('local-login', new LocalStrategy({
      usernameField:'username',
      passwordField:'password',
      passReqToCallback : true
    },

    function(req, username, password, done){
      process.nextTick(function() {
        User.findOne({'local.username': username}, function (err, user) {

          if (err) {
            return done(err)
          }
          if (!user) {
            return done(null, false, req.flash('loginMessage', 'User not found'))
          }
          //This method is defined in our user.js model. null here is coder errro, and false is user password entry error
          if (!user.validPassword(password)) {
            return done(null, false, req.flash('loginMessage', 'Wrong password'));
          }

          return done(null, user);
        });
      });
    }));
};