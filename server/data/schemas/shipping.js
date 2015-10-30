// Require mongoose and mongoose schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define category schema
var CountrySchema = new Schema({
  shippingCode: { type: String, unique: true, required: true }, //shop id + country
  country_name: { type: String, required: true },
  shop_id: { type: String, required: true, index: true }
});

var RatesSchema = new Schema({
	shop_id: { type: String, required: true, index: true },
	_country: { type: String, required: true, ref: CountrySchema},
	name: { type: String, required: true },
	price: { type: Number, required: true },
	rangeMin: { type: Number, required: true },
	rangeMax: { type: Number, required: true },
	criteria: { type: String, required: true },
	shippingDelay: { 
		min: { type: Number, required: true },
		max: { type: Number, required: true }
	}
});

var Country = mongoose.model('ShippingCountry', CountrySchema);
var Rates = mongoose.model('ShippingRates', RatesSchema);

// Export category model
module.exports = {
	Country: Country,
	Rates: Rates
};