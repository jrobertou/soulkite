// Require needed modules
var config = require('../../../../config/app.json')
  , dbOrder = require('../../../data/order');

// Export functions
module.exports = {

  getOrders: function(req, res) {

  	dbOrder.getAllOrders(req.session.user.shop._id, function(err, orders){
      var back = 'Une erreure est survenue';
      if(err)
        console.log(err)
      else
        back = orders;

	    res.renderPjax('shop/admin/orders', {
	      orders: back,
	      menuActive: 'orders',
	      user: req.session.user
	    });
  	});
  },

  getDetailsOrder: function(req, res) {

    dbOrder.getOrderById(req.session.user.shop._id, req.params.id, function(err, order){
      if(err){
        console.log(err)
        res.redirect('admin/orders')
      }
      else
        back = order;

      res.renderPjax('shop/admin/order_details', {
        order: back,
        menuActive: 'orders',
        user: req.session.user
      });
    });
  }
};
