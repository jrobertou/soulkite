// Require mongoose and mongoose schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define category schema
var CountrySchema = new Schema({
  taxCode: { type: String, unique: true, required: true }, //shop id + country
  country: { type: String, required: true },
  shop_id: { type: String, required: true, index: true }
});

var RatesSchema = new Schema({
	shop_id: { type: String, required: true, index: true },
	_country: { type: String, required: true },
	name: { type: String, required: true },
	percent: { type: Number, required: true },
	includedInPrice: { type: Boolean, required: true, default:true},
});

var Country = mongoose.model('TaxCountry', CountrySchema);
var Rates = mongoose.model('TaxRates', RatesSchema);

// Export category model
module.exports = {
	Country: Country,
	Rates: Rates
};