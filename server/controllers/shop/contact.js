var config = require('../../../config/app.json')
	,	val = require('../../helpers/validation')
	,	emailSender = require('../../email/email-sender');

// Export functions
module.exports = {

	// Get contact page
	getContact: function(req, res) {
		// Render contact page
		res.render('shop/themes/'+req.session.shop.theme+'/contact', {
			name: config.shop.name,
			title: 'À Propos',
			customer: req.session.customer,
			cart: req.session.cart,
			shop: req.session.shop
		});
	},

	// Get contact page
	postContact: function(req, res) {
		var exp = req.body.exp;

		if (!val.email(exp.email)){
			res.send({
				error:true,
	      message: 'Veuilllez indiquer un email valide.'
	    });
		}
		else if (!exp.message || exp.message == '') {
			res.send({
				success:false,
	      message: 'Le message ne peut pas être vide.'
	    });
		}
		else {
			emailSender.contactInShop(req.session.shop, exp, function(err){
				if (err) {
					res.send({
			      success:false,
			      message: err
			    });
				}
				else {
					res.send({
			      success:true,
			      message: 'Votre message a été envoyé.'
			    });
				}
			});
		}
	}
};
