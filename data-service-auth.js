// Database : mongodb+srv://dbUser:suqbi6-dorXom-syqjiv@senecaweb.e9ew8p5.mongodb.net/Web322Assignment?retryWrites=true&w=majority

// Requiring mongoose module and creating schema
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Creating a schema for the database
const userSchema = new Schema({
	userName: {
		type: String,
		unique: true
	},
	password: String,
	email: String,
	loginHistory: [{
		dateTime: Date,
		userAgent: String
	}]
});

let User;
// data-service-auth.js - Exported Functions
// Each of the below functions are designed to work with the User Object (defined by userSchema).  Once again, since we have no way of knowing how long each function will take, every one of the below functions must return a promise that passes the data via it's "resolve" method (or if an error was encountered, passes an error message via it's "reject" method).  When we access these methods from the server.js file, we will be assuming that they return a promise and will respond appropriately with .then() and .catch().

module.exports = {
	initialize: function () {
		return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://dbUser:suqbi6-dorXom-syqjiv@senecaweb.e9ew8p5.mongodb.net/Web322Assignment?retryWrites=true&w=majority");
        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
		});
	},

	registerUser: function (userData) {
		return new Promise(function (resolve, reject) {
			if(userData.password != userData.password2){
				reject("Passwords do not match");
			}else{
				bcrypt.genSalt(10, function (err, salt) {
					bcrypt.hash(userData.password, salt, function (err, hash) {
						if (err) {
							reject("There was an error encrypting the password");
						} else {
							userData.password = hash;
							let newUser = new User(userData);
							newUser.save((err) => {
								if (err) {
									if (err.code == 11000) {
										reject("User Name already taken");
									} else {
										reject("There was an error creating the user: " + err);
									}
								} else {
									resolve();
								}
							});
						}
					});
				});
			}
		});
	},
	// •	Recall from the Week 12 notes - to compare an encrypted (hashed) value (ie: hash) with a plain text value (ie: "myPassword123", we can use the following code: 
// bcrypt.compare("myPassword123", hash).then((result) => {
//    // result === true if it matches and result === false if it does not match
// });

// •	Use the above code to verify if the user entered password (ie: userData.password) matches the hashed version for the requested user (userData.userName) in the database (ie: instead of simply comparing users[0].password == userData.password as this will no longer work.  The compare method must be used to compare the hashed value from the database to userData.password)

	
	checkUser : function(userData){
		return new Promise(function(resolve, reject){
			User.find({userName: userData.userName}).exec().then((users)=>{
				if(users.length == 0){
					reject("Unable to find user: " + userData.userName);
				}else{
					bcrypt.compare(userData.password, users[0].password).then((res)=>{
						if(res === true){
							users[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});
							User.update({userName: users[0].userName}, {$set: {loginHistory: users[0].loginHistory}}).exec().then(()=>{
								resolve(users[0]);
							}).catch((err)=>{
								reject("There was an error verifying the user: " + err);
							});
						}else{
							reject("Incorrect Password for user: " + userData.userName);
						}
					}).catch((err)=>{
						reject("There was an error verifying the user: " + err);
					}
					);
				}
		});

	});
	}
}
