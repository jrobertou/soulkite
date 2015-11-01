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


		req.session.shop = {
		  "_id" : "54c663e0d0fa2022d77323f1",
		  "name" : "Soulkite",
		  "url" : "soulekite",
		  "theme" : "basic",
		  "paypal_email" : "jeremy.robertou@paypal.com",
		  "contact_email" : "jeremy.robertou@gmail.com",
		  "id_owner" : "54c663e0d0fa2022d77323f0",
		  "custom_settings" : {
		      "map_showing" : "true",
		      "company_promotion" : "Notre expertise CRM est reconnue comme l'une des plus poussée sur le marché français, avec des partenaires de renoms comme SugarCRM, et SageCRM Solutions (nous sommes certifiés SageCRM et Saleslogix).",
		      "company_phone_number" : "+33 5 56 54 34 54",
		      "company_details" : "SARL le porge & fils",
		      "company_address" : null,
		      "banner_showing" : "true"
		  },
		  "validated" : false,
		  "validation_code" : "F3cka1InZz6Dmuty",
		  "currency" : "USD",
		  "language" : "fr",
		  "date" : "2015-01-26T15:57:20.685Z",
		  "__v" : 0
		};
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
