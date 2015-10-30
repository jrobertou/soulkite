// Require needed modules
var dbCategory = require('../../data/category')
	,	dbProduct = require('../../data/product')
	,	dbShop = require('../../data/shop')
	,	dbCat = require('../../data/category')
	,	config = require('../../../config/app.json')
	,	fn = require('../../helpers/functions');

// Export functions
module.exports = {

	/*
	 * Test if a shop exists and store its data
	 */
	shopCommonTasks: function(req, res, next) {

		if (req.session.shop && req.session.shop.categories) {
      i18n.setLocale(req, req.session.shop.language);
      return next();
    }
    else {
			//dbShop.getShopBySeo(req.params.shopurl, function(err, shop) {
			if (req.session && req.session.shop) {
				var shop = req.session.shop;
				var shop_id = shop._id;
				dbCat.getAllCategories(shop_id, function(err, categories) { //console.log(categories);
					shop.categories = categories;
					req.session.shop = shop;
					i18n.setLocale(req, shop.language);
      		return next();
		   	});
	   	}
	   	else {
				res.render(fn.websiteViewsPath('404'));
			}
		  //});
    }
	},

	// Get shop home page
	getHome: function(req, res) {

		// Get Shop data from req
		var shop = req.session.shop;
		i18n.setLocale(req, req.session.shop.language);

		// Page
		var page = 1;
		var nb_per_page = 9;

		// Get featured products
		dbProduct.getFeaturedProducts(shop._id, function(err, products) {

			var page = fn.shopViewsPath(shop.theme, 'home');

			// Render home page
			res.render(page, {
				title: config.shop.tagline,
				customer: req.session.customer,
				cart: req.session.cart,
				products: products,
				uid: req.params.uid,
				shop: req.session.shop
			});

			//console.log(JSON.stringify(req.session.shop.categories));

		});
	}
};
