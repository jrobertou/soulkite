var mongoose = require('mongoose')
  , Shop = require('./schemas/shop');

module.exports = {

  saveShop: function(shopInfo, callback) {
    var newShop = new Shop (shopInfo);
    newShop.save(function(err) {
      callback(err, newShop);
    });
  },

  deleteShop: function(shop, callback) {
    var query = Shop.remove(shop, 1);
    query.exec(function(err) {
      callback(err);
    });
  },
  
  getShop: function(ownerId, callback) {
    var query = Shop.findOne({id_owner : ownerId});
    query.exec(function(err, shop) {
      if (shop){
        callback(err, shop);
      }
      else
        callback(err, null);
    });
  },

  getShopById: function(_id, callback) {
    var query = Shop.findOne({_id : _id});
    query.exec(function(err, shop) {  
      if (shop){
        callback(err, shop);
      }
      else
        callback(err, null);
    });
  },

  getShopBySeo: function(seo, callback) {
    var query = Shop.findOne({url : seo});
    query.exec(function(err, shop) {  
      if (shop) callback(err, shop);
      else callback(err, null);
    });
  },

  getShopByCustomDomain: function(domain, callback) {
    var query = Shop.findOne({custom_domain : domain});
    query.exec(function(err, shop) {  
      if (shop) callback(err, shop);
      else callback(err, null);
    });
  },

  updateShop: function(_id, key, value, callback) {
    this.getShopById(_id, function(err, shop){
      shop[key] = value;
      shop.save(function(err) {
        callback(err, shop);
      });
    });
  }

};