// Require needed modules
var config = require('../../../../config/app.json');

// Export functions
module.exports = {

  getDashboard: function(req, res) {
    res.renderPjax('shop/admin/dashboard', {
      menuActive: 'dashboard',
      user: req.session.user
    });
  },

  getSettings: function(req, res) {
    res.renderPjax('shop/admin/settings', {
      menuActive: 'settings',
      user: req.session.user
    });
  }
};
