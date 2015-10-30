// Require mongoose and mongoose schema
var mongoose = require('mongoose')
	,	Schema = mongoose.Schema
	,	generator = require('../../helpers/generator')
	, validation = require('../../helpers/validation');

// Define shop schema
var ShopSchema = new Schema({

	name: { type: String, required: true },
	id_owner: { type: String, required: true },
	url: { type: String, required: true, unique: true}, // match: /[a-z0-9]+/ dont work ?
	custom_domain: { type: String, required: false },
	contact_email: { type: String, required: true },
	paypal_email: { type: String, required: true, unique: false},
	date: { type: Date, default: Date.now },
	theme: {type: String, required: true },
	language: {type: String, required: false, default:'fr'},
	currency: {type: String, required: false, default:'EUR'},
	validation_code: { type: String, required: true, default: generator.randomString(16) },
	validated: { type: Boolean, required: true, default:false},
	custom_settings: { type: Object, required: true, default:{
		banner_showing: "true",
		company_address: null,
		company_details: null,
		company_phone_number: null,
		company_promotion: null,
		map_showing: null
	}}
});
/*
ShopSchema.pre("save", function(next) {
	this.existingUrl(this.url, next);
});

ShopSchema.method('existingUrl', function(url, callback) {
	Shop.findOne({ url: url }, function(err, user) {
		if(!user)
			callback(null);
		else
			callback(new Error("Url de domaine non disponible"));
	});
});
*/

var Shop = mongoose.model('Shop', ShopSchema);

Shop.schema.path('url').validate(validation.url, 'Adresse de la boutique incorrecte. Ne dois pas contenir de caractères spéciaux et contenir au moins 3 caractères.');
Shop.schema.path('name').validate(validation.notEmpty, 'Veuillez indiquer un nom de magasin.');
Shop.schema.path('contact_email').validate(validation.email, 'L\'email doit être valide.');
Shop.schema.path('paypal_email').validate(validation.email, 'L\'email paypal est invalide.');
	
// Export category model
module.exports = mongoose.model('Shop', ShopSchema);