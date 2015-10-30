var mongoose = require('mongoose')
  , User = require('./schemas/user')
  , Shop = require('./schemas/shop');

module.exports = {
  validateAccount: function(userCode, shopCode, callback) {
    var userQuery = User.findOne({validation_code : userCode}),
    shopQuery = Shop.findOne({validation_code : shopCode});

    userQuery.exec(function(err, user) {  
      if (err)
          callback(err, null, null);
      if(user){
        shopQuery.exec(function(err, shop) {
          if (err)
            callback(err, null, null);
          if(shop){
            User.update({_id: user._id}, {$set: {validated: true}}, false, false);
            Shop.update({_id: shop._id}, {$set: {validated: true}}, false, false);
            callback(null, user, shop);
          }
        });
      }
    });
  }
};
