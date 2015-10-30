// Require needed modules
var dbShop = require('../../../data/shop')
  , dbShipping = require('../../../data/shipping')
  , dbTax = require('../../../data/tax')
  , config = require('../../../../config/app.json')
  , fn = require('../../../helpers/functions')
  , errHelper = require('../../../helpers/error_display');

// Export functions
var settings = {

  getSettingsUser: function(req, res) {
    res.renderPjax('shop/admin/settings/user', {
      menuActive: 'settings',
      submenuActive: 'user',
      user: req.session.user
    });
  },
  getSettingsPages: function(req, res) {
    res.renderPjax('shop/admin/settings/pages', {
      menuActive: 'settings',
      submenuActive: 'pages',
      user: req.session.user
    });
  },

  getSettingsTheme: function(req, res) {
    res.renderPjax('shop/admin/settings/theme', {
      menuActive: 'settings',
      submenuActive: 'theme',
      user: req.session.user
    });
  },

  postCustomSettings: function(req, res) {
    var formData = req.body
      , shop = req.session.user.shop
      , customSettings = req.session.user.shop.custom_settings
      , valUpdate = null
      , needUpdate = null;

    for (var key in formData) {
      if(fn.isProperty(customSettings, key)){
        customSettings[key] = formData[key];
        needUpdate = 'custom_settings';
        valUpdate = customSettings;
      } else if(fn.isProperty(shop, key)){
        valUpdate = formData[key];
        needUpdate = key;
      }
    }

    if(needUpdate)
      dbShop.updateShop(shop._id, needUpdate, valUpdate, function(err, shop){
        if(err){
          res.send({success:false, error: errHelper.display(err)});
        }
        else{
          req.session.user.shop = shop;
          res.send({success:true, shop:req.session.user.shop});
        }
      });
    else
      res.send({success:false, error:'Rien à mettre à jour'});
  },

  /*
   * ********************** SHIPPING PART **********************
   */

  getSettingsShipping: function(req, res) {
    dbShipping.getAllShippings(req.session.user.shop._id, function(err, collection){
      if(err)
        console.log(err);
      res.renderPjax('shop/admin/settings/shipping', {
        menuActive: 'settings',
        submenuActive: 'shipping',
        user: req.session.user,
        shipping: collection
      });
    });
  },

  postShippingNewCountry: function(req, res) {
    var country = req.body.country
      , shop = req.session.user.shop;

    dbShipping.saveCountryShipping(shop._id, country, function(err, shipping){
      if(err){
        if (country)
          country = APIcountries.getName(country);
        res.send({success:false, message: errHelper.display(err).replace('1', ' '+country)});
      }
      else{
        res.send({success:true, message: 'Bien ajouté', redirectUrl: '/admin/settings/shipping'});
      }
    });
  },

  postShippingNewRate: function(req, res) {
    var rate = req.body.rate
      , shop = req.session.user.shop;

    rate.price = fn.parsePrice(rate.price);
    rate.rangeMin = fn.parsePrice(rate.rangeMin);
    rate.rangeMax = fn.parsePrice(rate.rangeMax);
    rate.shippingDelay.min = fn.parsePrice(rate.shippingDelay.min);
    rate.shippingDelay.max = fn.parsePrice(rate.shippingDelay.max);

    dbShipping.saveRateShipping(shop._id, req.params.country, rate, function(err, shipping){
      if(err){
        res.send({success:false, message: errHelper.display(err)});
      }
      else{
        res.send({success:true, message: 'Bien ajouté', redirectUrl: '/admin/settings/shipping'});
      }
    });
  },

  getShippingDeleteRate: function(req, res) {

    dbShipping.deleteRateShippingById(req.session.user.shop._id, req.params.country, req.params.id, function(err){
      if(err)
        console.log(err)
      res.redirect('/admin/settings/shipping');
    });
  },

  getShippingDeleteCountry: function(req, res) {
    dbShipping.deleteCountryShipping(req.session.user.shop._id, req.params.id, req.params.code, function(err){
      if(err)
        console.log(err)
      res.redirect('/admin/settings/shipping');
    });
  },

  /*
   * ********************** TAX PART  **********************
   */
  getSettingsTax: function(req, res) {
    dbTax.getAllTaxes(req.session.user.shop._id, function(err, collection){
      if(err)
        console.log(err);
      res.renderPjax('shop/admin/settings/tax', {
        menuActive: 'settings',
        submenuActive: 'tax',
        user: req.session.user,
        tax: collection
      });
    });
  },

  postTaxNewCountry: function(req, res) {
    var shop = req.session.user.shop
      , countryCode = req.body.country ? req.body.country : '';
    countryCode += req.body.province ? '-'+req.body.province : '';


    dbTax.saveCountryTax(shop._id, countryCode, function(err, shipping){
      if(err){
        if (!req.body.province)
          countryCode = APIcountries.getName(countryCode);
        res.send({success:false, message: errHelper.display(err).replace('1 ', ' '+countryCode+'  ')});
      }
      else{
        res.send({success:true, message: 'Bien ajouté', redirectUrl: '/admin/settings/tax'});
      }
    });
  },

  getTaxDeleteRate: function(req, res) {

    dbTax.deleteRateById(req.session.user.shop._id, req.params.country, req.params.id, function(err){
      if(err)
        console.log(err)
      res.redirect('/admin/settings/tax');
    });
  },

  getTaxDeleteCountry: function(req, res) {
    dbTax.deleteCountry(req.session.user.shop._id, req.params.id, req.params.code, function(err){
      if(err)
        console.log(err)
      res.redirect('/admin/settings/tax');
    });
  },

  postTaxNewRate: function(req, res) {
    var rate = req.body.tax
      , shop = req.session.user.shop;

    rate.percent = fn.parsePrice(rate.percent);

    dbTax.saveRate(shop._id, req.params.country, rate, function(err, rate){
      if(err){
        res.send({success:false, message: errHelper.display(err)});
      }
      else{
        res.send({success:true, message: 'Bien ajouté', redirectUrl: '/admin/settings/tax'});
      }
    });
  }

};

module.exports = settings;
