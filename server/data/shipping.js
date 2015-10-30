var mongoose = require('mongoose')
  , Shipping = require("./schemas/shipping");

module.exports = {

  saveCountryShipping: function(shop_id, country, callback) {
    var newCountryShipping = new Shipping.Country ({shop_id: shop_id, shippingCode: shop_id+country, country_name: country});
    newCountryShipping.save(function(err) {
      callback(err, newCountryShipping);
    });
  },

  getAllShippings: function(shop_id, callback) {
    Shipping.Country
      .find({shop_id: shop_id})
      .exec(function (err, countries) {
        if (err || !countries)
          callback(err, countries);
        Shipping.Rates
          .find({shop_id: shop_id})
          .exec(function (err, rates) {
            rates = _.groupBy(rates, '_country');
            callback(err, { countries: countries, rates: rates });
          });
      });
  },

  getShopCountries: function(shop_id, callback) {
    Shipping.Country
      .find({shop_id: shop_id}, { country_name: 1, _id:0 })
      .exec(function (err, countries) {
        if (err || !countries)
          callback(err, countries);
        
        callback(null, countries);
      });
  },

  getCountryRatesBetweenCriteria: function(shop_id, countryCode, price, callback) {
    price = parseFloat(price);
    console.log(shop_id +' '+ countryCode +' '+ price)
    Shipping.Rates
      .find({shop_id: shop_id, _country: countryCode, rangeMin: {"$lt": price}, rangeMax: {"$gte": price}})
      .exec(function (err, rates) {
        callback(err, rates);
      });
  },


  getRate: function(shop_id, _id, callback) {
    Shipping.Rates
      .findOne({shop_id: shop_id, _id: _id})
      .exec(function (err, rate) {
        callback(err, rate);
      });
  },

  saveRateShipping: function(shop_id, countryCode, rate, callback) {
    rate.shop_id = shop_id;
    rate._country = countryCode;
    var newRate = new Shipping.Rates(rate);
    newRate.save(function (err) {
        callback(err, newRate);
    });
  },

  deleteRateShippingById: function(shop_id, country_id, _id, callback) {
    Shipping.Rates.remove({shop_id: shop_id, _country: country_id, _id : _id})
      .exec(function(err) {  
        callback(err);
      });
  },

  deleteRateShipping: function(shop_id, country, callback) {
    Shipping.Rates.remove({shop_id: shop_id, _country: country})
      .exec(function(err) {  
        callback(err);
      });
  },

  deleteCountryShipping: function(shop_id, _id, code, callback) {
    this.deleteRateShipping(shop_id, code, function(err){
      if(err)
        callback(err);
      Shipping.Country.remove({shop_id: shop_id, _id : _id, country_name: code})
        .exec(function(err) {  
          callback(err);
        });
    });
  }
};