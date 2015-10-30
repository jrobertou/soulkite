// Require needed modules
var config = require('../../../../config/app.json')
  , dbCoupons = require('../../../data/coupon')
  , seo = require('../../../helpers/seo')
  , fn = require('../../../helpers/functions')
  , errHelper = require('../../../helpers/error_display.js')
  , mongoose = require('mongoose');

// Export functions
module.exports = {

 getAll: function(req, res) {

    dbCoupons.getAll(req.session.user.shop._id, function(err, coupons) {
      if (err) console.log(err);

      res.render('shop/admin/coupons', {
        title: 'tagline',
        menuActive: 'coupons',
        user: req.session.user,
        coupons: coupons
      });

    });

  }

};
