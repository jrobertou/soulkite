var main = require('./controllers/website/main')
	,	account = require('./controllers/website/account');

// Function to only allow acess if authenticated
function ensureAuthenticated(req, res, next) {
		if (req.isAuthenticated()) { return next(); }
		// Redirect if not authenticated
		res.redirect('/account/login');
};

module.exports = function(app) {

  // Accueil
	app.get('/', main.getHomePage);

  // Connexion
  app.get('/connexion', account.getLogin);
  app.post('/connexion', account.postLogin);

  // Inscription
	app.get('/creer-son-ecommerce', account.getSignup);
	app.post('/creer-son-ecommerce', account.postSignup);

  // Validation de compte
	app.get('/validation/:code/', account.getAccountValidation);

};
