var mongoose = require('mongoose')
  , Customer = require('./schemas/customer')
  , fn = require('../helpers/functions');

module.exports = {

  saveCustomer: function(customer, callback) {
    var newCustomer = new Customer (customer);
    newCustomer.save(function(err) {
      callback(err, newCustomer);
    });
  },

  getCustomerByEmail: function(shopId, id, callback) {
    var customercode = shopId + email;
    var query = Shop.findOne({shop_id : shopId, customercode: customercode});
    query.exec(function(err, shop) {  
      if (shop){
        callback(err, shop);
      }
      else
        callback(err, null);
    });
  },

  getCustomerById: function(shopId, id, callback) {

    var query = Customer.findOne({shop_id : shopId, _id: id});
    query.exec(function(err, customer) {  
      if (customer){
        callback(err, customer);
      }
      else
        callback(err, null);
    });
  },

  updateCustomer: function(_idShop, _id, customerChange, callback) {
    this.getCustomerById(_idShop, _id, function(err, cust){
      for(var key in customerChange){
        if(fn.isProperty(cust, key))
          cust[key] = customerChange[key]
      }
      cust.save(function(err) {
        callback(err, cust);
      });
    });
  },

  deleteCustomer: function(customer, callback) {
    Customer.remove(customer, 1)
      .exec(function(err) {
        callback(err);
      });
  },

  logCustomer: function(customerInfo, callback) {
    Customer.authenticate( customerInfo, function(err, customer) {
      if (customer){
        callback(null, customer);
      }
      else
        callback(err, null);
    });
  },

  generateForgotPassword: function(_idShop, email, callback) {

    Customer.findOne({ customercode: _idShop+email }, function (err, cus){
      if(err || !cus || cus.email != email || cus.shop_id != _idShop){
        callback(err, null)
      }
      else{
        cus.forgot_password = new mongoose.Types.ObjectId();
        cus.save(function(err) {
          if(err)
            console.log(err)
          //console.log(mongoose.Types.ObjectId(cus.forgot_password).getTimestamp())
          callback(err, cus);
        });
      }
    });
  },

  resetPassword: function(shop_id, code, passwd, confirmation, callback) {

    if ( code && code.length === 24){
      var timecode = mongoose.Types.ObjectId(code).getTimestamp();
      if( (Date.now() - timecode) > 43200000) { //12h en ms
        callback(new Error("You have wait so for reset your password, please ask again a new reset password email."), null);
      }
      else {
        Customer.findOne({ shop_id: shop_id,  forgot_password: code }, function (err, cus){
          if(err){
            callback(err, null)
          }
          else{
            if (!cus || (cus && cus.length === 0)) {
              callback(new Error("User not found, please ask again a new reset password email."), null);
            }
            else {
              cus.password = passwd;
              cus.password2 = confirmation;
              delete cus.salt;
              delete cus.hash;
              cus.forgot_password = null;
              cus.save(function(err) {
                if(err)
                  console.log(err)
                callback(err, cus);
              });
            }
          }
        });
      }
    }
    else {
      callback(new Error("Your request is invalid, please ask again a new reset password email."), null);
    }
  }
};