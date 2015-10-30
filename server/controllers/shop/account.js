var dbUser = require('../../data/user.js')
	, config = require('../../../config/app.json')
	, dbCustomer = require('../../data/customer.js')
	, dbShipping = require('../../data/shipping.js')
	, errHelper = require('../../helpers/error_display.js')
	,	emailSender = require('../../email/email-sender')
	, fn = require('../../helpers/functions');

module.exports = {

	ensureAuthenticated: function (req, res, next) {
		if (req.session.customer) { return next(); }
		// Redirect if not authenticated
		res.redirect('/login');
	},

	getSignup: function (req, res) {
		if(!req.session.customer) {

			dbShipping.getShopCountries(req.session.shop._id, function(err, countries){
				res.render(fn.shopViewsPath(req.session.shop.theme, 'account/signup'), {
					shop: req.session.shop,
					logged: false,
					cart: req.session.cart,
					checkoutProcess: req.params.checkout,
					possibleCountries: countries
				});
			});
		} else {
			// Redirect if logged in
			res.redirect('/myaccount');
		}
	},

	postSignup: function(req, res) {

		var customer = req.body.customer
			, checkTerms = fn.isProperty(customer, 'checkTerms')
			, finalRedirectUrl = req.params.checkout? '/checkout/step/2':'/';

		customer.checkTerms = checkTerms?true:false;
		customer.shipping.name = customer.name.last + " " + customer.name.first;

		customer.billing = customer.shipping;
		customer.shop_id = req.session.shop._id;

		dbCustomer.saveCustomer(customer, function(err, newCustomer) {
			if (err) {
				res.send({success: false, message: errHelper.display(err)})
			}
			else {
				req.session.customer = newCustomer;
				res.send({success: true, redirect:finalRedirectUrl});
			}
		});
	},

	getLogin: function(req, res) {
		res.render(fn.shopViewsPath(req.session.shop.theme, 'account/login'), {
			shop: req.session.shop,
			title: 'Login',
			customer: req.session.customer,
			cart: req.session.cart,
			checkoutProcess: req.params.checkout,
			uid: req.params.uid,
			shop: req.session.shop
		});
	},

	getForgotPassword: function(req, res) {
		res.render(fn.shopViewsPath(req.session.shop.theme, 'account/forgot_password'), {
			shop: req.session.shop,
			title: 'Forgot Password',
			cart: req.session.cart,
			checkoutProcess: req.params.checkout,
			uid: req.params.uid,
			shop: req.session.shop
		});
	},

	getResetPassword: function(req, res) {
		res.render(fn.shopViewsPath(req.session.shop.theme, 'account/reset_password'), {
			shop: req.session.shop,
			title: 'Reset Password',
			cart: req.session.cart,
			checkoutProcess: req.params.checkout,
			uid: req.params.uid,
			shop: req.session.shop
		});
	},

	postForgotPassword: function(req, res) {
		var render = {
			shop: req.session.shop,
			title: 'Forgot Password',
			cart: req.session.cart,
			checkoutProcess: req.params.checkout,
			uid: req.params.uid,
			shop: req.session.shop
		};
		dbCustomer.generateForgotPassword(req.session.shop._id, req.body.email, function(err, customer){
			if(err || !customer || req.body.email != customer.email){
				render.err = "Email not found.";
				res.render(fn.shopViewsPath(req.session.shop.theme, 'account/forgot_password'),render);
			}
			else {
				emailSender.forgotPassword(customer, req.session.shop, function(err){
					if (err)
						render.err = err;
					else
						render.message = "An email was sent in your address to reset your password";

					res.render(fn.shopViewsPath(req.session.shop.theme, 'account/forgot_password'), render);
				});

			}
		});
	},

	postResetPassword: function(req, res) {
		var render = {
			shop: req.session.shop,
			title: 'Reset Password',
			cart: req.session.cart,
			checkoutProcess: req.params.checkout,
			uid: req.params.uid,
			shop: req.session.shop
		};

		dbCustomer.resetPassword(req.session.shop._id, req.params.code, req.body.password, req.body.passwordrepeat, function(err, customer){
			if(err){
				render.err = err;
				res.render(fn.shopViewsPath(req.session.shop.theme, 'account/reset_password'),render);
			}
			else {
				render.message = "Your password has been reset, you can use it now.";
				res.render(fn.shopViewsPath(req.session.shop.theme, 'account/reset_password'), render);
			}
		});
	},

	postLogin: function(req, res) {
		var shop = req.session.shop
			, finalRedirectUrl = req.params.checkout? '/checkout/step/2':'/'
			, obj = {
				customercode: shop._id + req.body.email,
				email: req.body.email,
				password: req.body.password
			};

		dbCustomer.logCustomer(obj, function(err, customer){
			if(err) {
				res.render(fn.shopViewsPath(shop.theme, 'account/login'), {
					title: 'Login',
					customer: req.session.customer,
					cart: req.session.cart,
					checkoutProcess: req.params.checkout,
					uid: req.params.uid,
					shop: req.session.shop,
					err: err
				});
			}
			else {
				req.session.customer = customer;
				res.redirect(finalRedirectUrl);
			}
		});
	},

	getAccount: function(req, res){
		res.render(fn.shopViewsPath(req.session.shop.theme, 'account/myaccount'), {
			title: 'My Account',
			customer: req.session.customer,
			cart: req.session.cart,
			uid: req.params.uid,
			shop: req.session.shop,
		});
	},

	updateAccount: function(req, res){

		var customer = req.body.customer
			, checkTerms = fn.isProperty(customer, 'terms')
			, newsletter = fn.isProperty(customer, 'newsletter')
			, finalRedirectUrl = req.params.checkout? '/checkout/step/3':'account/myaccount';

		customer.checkTerms = checkTerms?true:false;
		customer.newsletter = newsletter?true:false;

		dbCustomer.updateCustomer(req.session.shop._id, req.session.customer._id, customer, function(err, customer) {
			if (err) {
				res.send({success: false, message: errHelper.display(err)})
			}
			else {
				req.session.customer = customer;
				res.send({success: true, redirectUrl:finalRedirectUrl});
			}
		});
	},

	getLogout: function(req, res){
		req.session.customer = null;
		req.session.order = null;
		req.session.destroy;
		res.redirect('/');
	}
};
