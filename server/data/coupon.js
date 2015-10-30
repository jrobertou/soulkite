var mongoose = require('mongoose')
  , Coupon = require("./schemas/coupon")
  , fn = require('../helpers/functions');

module.exports = {

  save: function(couponInfo, callback) {

    var newCoupon = new Coupon(couponInfo);

    newCoupon.save(function(err) {
      if (err) console.log(err);
      callback(err, newCoupon);
    });

  },

  delete: function(shop_id, id, callback) {
    Coupon.remove({_id : id, shop_id: shop_id}).exec(function(err) {  
      callback(err);
    });
  },
  
  edit: function(shop_id, cid, couponInfo, callback) {

    this.findCouponByID(shop_id, cid, function(err, couponDb) {
      if (couponDb && couponDb._id.toString() == cid.toString()) {
        for(var key in couponInfo) {
          if(fn.isProperty(couponDb, key)){
            couponDb[key] = couponInfo[key];
            couponDb.markModified(key);
          }
        }

        couponDb.save(function(err) {
          callback(err, couponDb);
        });
      }
      else {
        callback(err, couponDb);
      }
      
    });
  },

  getAll: function(shop_id, callback) {
    Coupon.find({shop_id:shop_id}).sort({date: -1}).exec(function(err, coupons) {
      callback(err, coupons);
    });
  },

  get: function(shop_id, id, callback) {
    Coupon.findOne({shop_id: shop_id, _id : id}).exec(function(err, coupon) { 
      callback(err, coupon);
    });
  }

};