// Require needed modules
var dbUser = require('../../../data/user')
  , dbShop = require('../../../data/shop')
  , config = require('../../../../config/app.json');

// Export functions
module.exports = {

  // Function to only allow acess if authenticated
  ensureAuthenticated: function (req, res, next) {
    if (req.session.user) {
      i18n.setLocale(req, 'fr');
      return next();
    }
    // Redirect if not authenticated
    res.redirect('/admin/login');
  },

  cleverRedirect: function (req, res, next) {
    if ( req.session.user )
      res.redirect('/admin/dashboard');
    else if (req.path != '/admin/login')
      res.redirect('/admin/login');
    else
      return next();
    return false;
  },

  getLogin: function(req, res) {
    res.render('shop/admin/login');
  },

  postLogin: function(req, res) {

    if (req.body.email && req.body.password) {
      dbUser.logUser(req.body.email, req.body.password, function(err, user) {
        if (!err && user) {
          dbShop.getShop(user._id, function(err, shop) {
            if (!err && shop) {
              req.session.user = user;
              req.session.user.shop = shop;
              //res.redirect('/admin/dashboard');
              res.json({success: true, redirectUrl: '/admin/dashboard'});
            }
            else {
              res.json({success: false, message: 'Les identifiants entrés sont incorrects.'});
            }
          });
        }
        else {
          res.json({success: false, message: 'Les identifiants entrés sont incorrects.'});
        }
      });

    }
    else {
      res.json({success: false});
    }

  },

  getLogout: function(req, res) {
    req.session.user = null;
    req.session.destroy;
    res.redirect('/admin/dashboard');
  }
};
