// Require mongoose and mongoose schema
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , validation = require('../../helpers/validation')
  ,	bcrypt = require('bcrypt');

// Define user schema
var CustomerSchema = new Schema({
  name : { 
	  first: { type: String, required: true },
	  last: { type: String, required: true }
  },
  customercode: { type: String, unique: true, index: true}, //idshop + email user collé
  email: { type: String, required: true },
  shop_id: {type: String, index: true },
  salt: { type: String },
  hash: { type: String },
  date: { type: Date, default: Date.now },
  forgot_password: { type: String, default: null },
	shipping : {
		name: {type:String, required:false},
		address : { 
			name: {type:String, required:false},      
			address1: {type:String, required:true},
			address2: {type:String, required:false},
			city: {type:String, required:true},
			province: {type:String, required:false},
			country: {type:String, required:true},
			pcd: {type:String, required:true}
		}
	},
	billing : {
		name: {type:String, required:false},
		address: {    
			address1: {type:String, required:false},
			address2: {type:String, required:false},
			city: {type:String, required:false},
			province: {type:String, required:false},
			country: {type:String, required:false},
			pcd: {type:String, required:false}
		}
	},
	contactNum: {type: Number, required: false},
	checkTerms: { type: Boolean, required: true},
	newsletter: { type: Boolean, default: false}
});

// Create virtuals for passowrd
CustomerSchema
.virtual('password')
	.get(function () {
		return this._password;
	})
	// Hash password when saving
	.set(function (password) {
		if( password ){
			this._password = password;
			var salt = this.salt = bcrypt.genSaltSync(10);
			this.hash = bcrypt.hashSync(password, salt);
		}
	});

CustomerSchema.virtual("password2").get(function() {
  return this._password2;
}).set(function(value) {
	this._password2 = value;
});

CustomerSchema.pre("save", function(next) {
	this.customercode = this.shop_id + this.email;

  if(!validation.notEmpty(this._password)){
  	if( !this.salt || !this.hash)
			next(new Error("Le mot de passe ne doit pas être vide."));
		else
			next();
  }
  else if(this._password2 !== this._password)
		next(new Error("Le mot de passe et la confirmation de celui-ci doivent être identique."));
	  else
			next();
});

CustomerSchema.method('verifyPassword', function(password, callback) {
  bcrypt.compare(password, this.hash, callback);
});

CustomerSchema.static('authenticate', function(customerInfo, callback) {
  this.findOne({ customercode: customerInfo.customercode }, function(err, customer) {
	  if (err) { return callback(err); }
	  
	  if (!customer) { return callback('L\'email est incorrect ou n\'existe pas.', false); }

	  // Verify password if user found
	  customer.verifyPassword(customerInfo.password, function(err, passwordCorrect) {
			if (err) { return callback(err); }
			
			// Return false if incorrect password
			if (!passwordCorrect) { return callback('Le mot de passe est incorrect.', false); }
			
			// Return user if successful
			return callback(null, customer);
	  });
	});
});

var Customer = mongoose.model('Customer', CustomerSchema);

Customer.schema.path('email').validate(validation.email, 'L\'email doit être valide.');
Customer.schema.path('name.last').validate(validation.notEmpty, 'Le nom ne doit pas être vide.');
Customer.schema.path('name.first').validate(validation.notEmpty, 'Le prenom ne peut pas être vide.');
Customer.schema.path('checkTerms').validate(validation.isTrue, 'Vous devez accepter les conditions d\'utilisation');

// Export user model
module.exports = Customer;