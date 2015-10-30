// Require needed modules
var dbProduct = require('../../data/product')
	,	dbCategory = require('../../data/category')
	, dbImage = require('../../data/image')
	,	config = require("../../../config/app.json")
	,	fn = require('../../helpers/functions');

// Export functions
module.exports = {

	// Show a product from url request
	getBySEO: function(req, res) {

		// Get Shop data from req
		var shop = req.session.shop;

		// Fing requested product
		dbProduct.findProductBySEO(shop._id, req.params.seo, function(err, product) {

			// Catch product not found
			if (err) {

				var page = fn.shopViewsPath(shop.theme, '404');
				res.render(page, {
					shop: req.session.shop,
					title: err.message,
					customer: req.session.customer,
					cart: req.session.cart
				});

			}
			else {

				dbImage.getImageByProduct(product._id, function(err, images) { //console.log(JSON.stringify(images));

	        if (err) {console.log(err);}

	        product.images = images;

	        var alert = '';
	        if (req.query.alert) {
	        	_.each(product.variants.options, function(v){
	        		alert += v.name.toLowerCase()+', ';
	        	});
	        	alert = alert.substring(0, alert.length-2);
	      	}
	        //req.query.alert

					var page = fn.shopViewsPath(shop.theme, 'product-single');

					//console.log(JSON.stringify(req.session.cart))

					// Render product view
					res.render(page, {
						shop: req.session.shop,
						title: product.name,
						customer: req.session.customer,
						cart: req.session.cart,
						product: product,
						alert: alert,
						config: config
					});

				});
			}
		});
	}

};
