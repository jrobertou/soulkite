var mongoose = require('mongoose')
  , Tax = require("./schemas/tax");

module.exports = {

  saveCountryTax: function(shop_id, country, callback) {
    var newCountryTax = new Tax.Country ({shop_id: shop_id, taxCode: shop_id+country, country: country});
    newCountryTax.save(function(err) {
      callback(err, newCountryTax);
    });
  },

  getAllTaxes: function(shop_id, callback) {
    Tax.Country
      .find({shop_id: shop_id})
      .exec(function (err, countries) {
        if (err || !countries)
          callback(err, countries);
        Tax.Rates
          .find({shop_id: shop_id})
          .sort( '-includedInPrice' )
          .exec(function (err, rates) {
            rates = _.groupBy(rates, '_country');
            callback(err, { countries: countries, rates: rates });
          });
      });
  },

  getCountryRates: function(shop_id, countryCode, callback) {
    Tax.Rates
      .find({shop_id: shop_id, _country: countryCode})
      .sort('-includedInPrice')
      .exec(function (err, rates) {
        callback(err, rates);
      });
  },

  saveRate: function(shop_id, countryCode, rate, callback) {
    rate.shop_id = shop_id;
    rate._country = countryCode;
    var newRate = new Tax.Rates(rate);
    newRate.save(function (err) {
        callback(err, newRate);
    });
  },

  deleteRateById: function(shop_id, country_id, _id, callback) {
    Tax.Rates.remove({shop_id: shop_id, _country: country_id, _id : _id})
      .exec(function(err) {  
        callback(err);
      });
  },

  deleteRatesByCountry: function(shop_id, country, callback) {
    Tax.Rates.remove({shop_id: shop_id, _country: country})
      .exec(function(err) {  
        callback(err);
      });
  },

  deleteCountry: function(shop_id, _id, code, callback) {
    this.deleteRatesByCountry(shop_id, code, function(err){
      if(err)
        callback(err);
      Tax.Country.remove({shop_id: shop_id, _id : _id, country: code})
        .exec(function(err) {  
          callback(err);
        });
    });
  }
};