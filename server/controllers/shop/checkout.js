var dbCustomer = require("../../data/customer.js")
	,	dbProduct = require("../../data/product.js")
	,	dbOrder = require("../../data/order.js")
	,	dbShipping = require("../../data/shipping.js")
	,	dbTax = require("../../data/tax.js")
	,	config = require("../../../config/app.json")
	, errHelper = require('../../helpers/error_display')
	,	fn = require('../../helpers/functions');

// Export functions
module.exports = {

  isOrderExist: function (req, res, next) {
    if (req.session.order) { return next(); }
    res.redirect('/checkout');
  },

  killCheckoutProcess: function (req, res, next) {
    req.session.order = null;
    next();
  },

  getCheckout: function (req, res) {
  	req.session.order = {};
  	req.session.order.step = 1;
    var shop = req.session.shop
    	,	page = fn.shopViewsPath(shop.theme, 'checkout/step1')
    	, countries = null
    	, rendering = {
				title: 'Checkout',
				shop: req.session.shop,
				cart: req.session.cart ? req.session.cart: null,
				customer: req.session.customer
			};
		//res.render(page, rendering);
		res.render(fn.shopViewsPath(shop.theme, 'checkout'), rendering);
	},

	getStep: function (req, res) {
    var shop = req.session.shop
    	,	customer = req.session.customer
    	,	page = fn.shopViewsPath(shop.theme, 'checkout/step'+req.params.step)
    	, countries = null
    	, rendering = {
				title: 'Checkout',
				shop: req.session.shop,
				cart: req.session.cart,
				customer: req.session.customer,
				possibleCountries: countries
			};

	  switch(parseInt(req.params.step)) {
			case 2: console.log('2');
					if(req.session.order.step == 1){
						req.session.order.step = 2;
					  dbShipping.getShopCountries(shop._id, function(err, countries){
			    		rendering.possibleCountries = countries;
							res.render(page, rendering);
						});
					}
					else
						res.redirect('/checkout')
			  break;

			case 3: console.log('3');
					if(req.session.order.step == 2){
						req.session.order.step = 3;
						req.session.order.cart = req.session.cart;
						req.session.order.customer = customer;
					  dbShipping.getCountryRatesBetweenCriteria(shop._id, customer.shipping.address.country, req.session.order.cart.total, function(err, rates){
					  	console.log(rates);
			    		rendering.rates = rates;
							res.render(page, rendering);
						});
					}
					else
						res.redirect('/checkout')
			  break;

			case 4: console.log('4');
					if(req.session.order.step == 3){
						req.session.order.step = 4;

						req.session.order.customer = customer;
						var codeCountry = customer.shipping.address.country;
						if (codeCountry == 'CA' || codeCountry == 'US')
							codeCountry += '-'+customer.shipping.address.province;

					  dbTax.getCountryRates(shop._id, codeCountry, function(err, rates){
			    		var taxes = fn.calculTax(req.session.order.cart.total, rates, req.session.order.shippingRate);
			    		req.session.order.taxes = taxes.rateDetails;
			    		req.session.order.ttc = taxes.ttc;
			    		req.session.order.ht = taxes.ht;
			    		req.session.order.subtotal = taxes.subtotal;

			    		rendering.cart = req.session.order.cart
			    		rendering.taxes = taxes.rateDetails;
							res.render(page, rendering);
						});
					}
					else
						res.redirect('/checkout')
			  break;
			default:
				res.render(page, rendering);
				break;
		}
	},

	postCheckoutShippingRate: function(req, res) {
		// validation de la step 3
		if(req.session.order && req.session.order.step && req.session.order.step == 3) {
			var rate = req.body.ship? req.body.ship.rate: null
				,	idShop = req.session.shop._id;

			dbShipping.getRate(idShop, rate, function(err, rateDb){
	  		if (rateDb && rateDb._id == rate && rateDb.shop_id == idShop) {
	  			req.session.order.shippingRate = rateDb;
	  			req.session.order.shippingComments = req.body.ship.comments ? req.body.ship.comments:'';
	  			res.redirect('/checkout/step/4');
	  		}
	  		else {
	  			res.redirect('/checkout/step/3');
	  		}
			});
		}
		else {
			res.redirect('/checkout')
		}
	},

	// Handle posted order
	sendCheckoutOrder: function(req, res) {


		if(req.session.order && req.session.order.step && req.session.order.step == 4) {
			var order = req.session.order;
			delete order.step;
			order.shop_id = req.session.shop._id;
			order.customercode = req.session.customer.customercode;
			order.status = 'pending';

			dbOrder.saveOrder(order, function(err, newOrder){
				if(err){
					console.log(err);
					res.redirect('/checkout')
				}
				else {
					dbProduct.updateStockAfterOrder(newOrder, function(err){
						req.session.order = null;
						req.session.cart = null;
						var page = fn.shopViewsPath(req.session.shop.theme, 'checkout/stepSuccess');
			    	res.render(page, {shop: req.session.shop, order: newOrder});
					});
				}
			});

		}
		else {
			res.redirect('/checkout')
		}
		/*
		dbOrder.saveOrder(order, function(err, newOrder){
			if(err){
				res.send(err);
			}
			else {
				req.session.order = order;
				res.render(page, {
					order: newOrder,
					shop: req.session.shop,
					title: 'Your Order',
					customer: req.session.customer,
					cart: req.session.cart,
				});
			}
		});
		*/
	},

	// Handle posted order
	cancelCheckoutOrder: function(req, res) {
		req.session.order = null;
		res.redirect('/');
	}
};
