// Require mongoose and mongoose schema
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , generator = require('../../helpers/generator')
  , validation = require('../../helpers/validation');

// Require bcrypt for hashing passwords
var bcrypt = require('bcrypt');

// Define user schema
var UserSchema = new Schema({
  // Name
  name : {
	  first: { type: String, required: true },
	  last: { type: String, required: true }
  },
  email: { type: String, required: true, unique: true },
  salt: { type: String, required: true },
  hash: { type: String, required: true },
  date: { type: Date, default: Date.now },
  forgot_password: { type: String, default: null },
  validation_code: { type: String, required: true, default: generator.randomString(16) },
  validated: { type: Boolean, default:false}
});

// Create virtuals for passowrd
UserSchema
.virtual('password')
  .get(function () {
		return this._password;
  })
  // Hash password when saving
  .set(function (password) {
		this._password = password;
		var salt = this.salt = bcrypt.genSaltSync(10);
		this.hash = bcrypt.hashSync(password, salt);
  });

UserSchema.virtual("password2").get(function() {
  return this._password2;
}).set(function(value) {
	this._password2 = value;
});

UserSchema.pre("save", function(next) {
  if(!validation.notEmpty(this._password))
		next(new Error("Le mot de passe ne doit pas être vide."));
  else if(this._password2 !== this._password)
		next(new Error("Le mot de passe et la confirmation de celui-ci doivent être identique."));
	  else
			next();
});

UserSchema.method('verifyPassword', function(password, callback) {
  bcrypt.compare(password, this.hash, callback);
});

UserSchema.static('authenticate', function(email, password, callback) {
  this.findOne({ email: email }, function(err, user) {
	  if (err) { return callback(err); }

	  if (!user) { return callback(null, false); }

	  // Verify password if user found
	  user.verifyPassword(password, function(err, passwordCorrect) {
			if (err) { return callback(err); }

			// Return false if incorrect password
			if (!passwordCorrect) { return callback(null, false); }

			// Return user if successful
			return callback(null, user);
	  });
	});
});

var User = mongoose.model('User', UserSchema);

User.schema.path('email').validate(validation.email, 'L\'email doit être valide.');
User.schema.path('name.last').validate(validation.notEmpty, 'Le nom ne doit pas être vide.');
User.schema.path('name.first').validate(validation.notEmpty, 'Le prenom ne peut pas être vide.');


// Export user model
module.exports = User;
