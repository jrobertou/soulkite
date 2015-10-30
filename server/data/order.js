var mongoose = require('mongoose')
  , Order = require('./schemas/order');

module.exports = {

  saveOrder: function(order, callback) {
    var neworder = new Order (order);
    neworder.save(function(err) {
      callback(err, neworder);
    });
  },
  
  getOrderById: function(shop_id, orderId, callback) {
    var query = Order.findOne({shop_id: shop_id, _id:orderId});
    query.exec(function(err, order) {
      callback(err, order);
    });
  },
  
  getAllOrders: function(shop_id, callback) {
    var query = Order.find({shop_id:shop_id}).sort({date: -1});
    query.exec(function(err, orders) {
      callback(err, orders);
    });
  }
};