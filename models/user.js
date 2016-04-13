// lab 12 ess user.js in models

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema ({
	local: {
		username: String,
		password: String
	},
	
	signUpDate : {
		type : Date,
		default: Date.now()
	},
	
	favoriteColor : String,
	luckyNumber : Number
});

userSchema.methods.generateHash = function(password){
	// create salted hash of password by hashing plaintext password
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

userSchema.methods.validPassword = function(password){
	//Hash entered password, compare with stored hash
	return bcrypt.compareSync(password, this.local.password);
};

module.exports=mongoose.model('User', userSchema);