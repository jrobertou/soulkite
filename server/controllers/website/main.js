// Export functions
module.exports = {
	// Get shop home page
	getHomePage: function(req, res) {
		// Render home page
		res.render('website/homepage', {
			bodyclass: 'home'
		});
	},

	getTourPage: function(req, res) {   
		res.render('website/tour');
	},

	getPricesPage: function(req, res) {   
		res.render('website/prices');
	},


};