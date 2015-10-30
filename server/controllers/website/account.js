var config = require('../../../config/app.json')
	,	dbUser = require('../../data/user')
	,	dbShop = require('../../data/shop')
	,	dbAccount = require('../../data/account')
	,	emailSender = require('../../email/email-sender')
	,	errHelper = require('../../helpers/error_display');

module.exports = {

	getSignup: function(req, res) {
		res.render('website/account/signup', {
			bodyclass: 'signup'
		});
	},

	getLogin: function(req, res) {
		res.render('website/account/login', {
			bodyclass: 'login'
		});
	},

	postLogin: function(req, res) {

		if (req.body.shop && req.body.shop.url) {

      dbShop.getShopBySeo(req.body.shop.url, function(err, shop) {
        if(err || !shop) {
          res.json({success: false, message: 'Cette boutique ne semble pas exister, veuillez réessayer.'});
        }
        else {
          var loginUrl = shop.custom_domain ? 'http://'+shop.custom_domain+'/admin/login' : 'http://'+shop.url+'.'+GLOBAL.siteurl+'/admin/login';
          res.json({success: true, loginUrl: loginUrl});
        }
      });

    }
    else {
      res.json({success: false});
    }

	},

	getAccountValidation: function (req, res) {
		var code = req.params.code.split("-");

		var userValidationCode = code[0],
			shopValidationCode = code[1];

		var renderView = 'website/account/validated'
		dbAccount.validateAccount(userValidationCode, shopValidationCode, function(err, user, shop){
			if(err){
				res.render(renderView, {err: errHelper.display(err)});
			}
			else{
				res.render(renderView, {user: user, shop:shop});
			}

		});
	},

	postSignup: function(req, res) {
		var user = req.body.user
			,	shop = req.body.shop;

		user.password2 = user.password;
		shop.contact_email = user.email;

		var _removeErrorMesUseless = function(error){
			error = error.replace('Le champ contact_email est requis<br/>', '');
			res.send({success: false, message: error});
		};

		var _saveShop = function(newUser, shop){
			console.log('_saveShop')
			dbShop.saveShop(shop,
				// Error on saving
				function(err, newShop) {
					if (err) {
						dbUser.deleteUser({_id: newUser._id}, function(){
							res.send({success: false, message: err});
							_removeErrorMesUseless(errHelper.display(err));
						});
					}
					else {
						emailSender.signupUser(newUser, newShop, function(err){
							if (err) {
								res.send({success: false, message: err});
							}
							else {
								res.send({
									success: true,
									message: 'Votre magasin est bien enregistré, vous allez recevoir un mail de validation dans les prochaines minutes.'
								});
							}
						});
					}
				}
			);
		};
console.log('dbUser.saveUser')
		dbUser.saveUser(user,
			function(err, newUser) {
				console.log('dbUser.saveUser back')
				if (err) {
					res.send({success: false, message: err});
					//shop.id_owner = 0;
					//_saveShop(newUser, shop, errHelper.display(err))
					_removeErrorMesUseless(errHelper.display(err));
				}
				else {
					shop.id_owner = newUser._id;
					_saveShop(newUser, shop)
				}
			}
		);
	},

	// Handle posted register form
	/*postSignup: function(req, res) {
		var user = req.body.user
			,	shop = req.body.shop;

		//user.password2 = user.password;
		shop.contact_email = user.email;

		var _removeErrorMesUseless = function(error){
			error = error.replace('Le champ contact_email est requis<br/>', '');
			res.send({success: false, message: error});
		};

		var _saveShop = function(newUser, shop, errNewUser){
			dbShop.saveShop(shop,
				//Error on saving
				function(err, newShop) {
					if (err || errNewUser) {
						if(!errNewUser)
							errNewUser = '';
						if (err)
							errNewUser = '<br/>' + errNewUser;

						dbUser.deleteUser({_id: newUser._id}, function(){
							_removeErrorMesUseless(errHelper.display(err)+errNewUser);
						});
					}
					else {
						emailSender.signupUser(newUser, newShop, function(err){
							if (err)
								res.send({success: false, message: err});
							else
								res.send({
									success: true,
									message: 'Votre magasin est bien enregistré, vous allez recevoir un mail de validation dans les prochaines minutes.'
								});
						});
					}
				}
			);
		};

		dbUser.saveUser(user,

			function(err, newUser) {
				if (err) {
					shop.id_owner = 0;
					_saveShop(newUser, shop, errHelper.display(err))
				}
				else {
					shop.id_owner = newUser._id;
					_saveShop(newUser, shop)
				}
			}
		);
	}*/

};
