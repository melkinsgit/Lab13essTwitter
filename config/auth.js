// lab 12 auth js

module.exports={
	'twitterAuth':{
	'consumerKey': process.env.TWITTER_CONSUMER_KEY,
	'consumerSecret': process.env.TWITTER_CONSUMER_SECRET,
	'callbackURL': 'http://127.0.0.1:3000/auth/twitter/callback'
	}
}