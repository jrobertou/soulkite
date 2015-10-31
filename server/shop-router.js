var account = require('./controllers/shop/account')
	,	main = require('./controllers/shop/main')
	,	contact = require('./controllers/shop/contact')
	,	product = require('./controllers/shop/product')
	,	cart = require('./controllers/shop/cart')
	,	category = require('./controllers/shop/category')
	,	checkout = require('./controllers/shop/checkout');

var admin = require('./controllers/shop/admin/main')
	,	adminLogin = require('./controllers/shop/admin/login')
	,	adminSetting = require('./controllers/shop/admin/settings')
	,	adminCategories = require('./controllers/shop/admin/categories')
	,	adminProduct = require('./controllers/shop/admin/products')
	,	adminCoupons = require('./controllers/shop/admin/coupons')
	,	adminOrder = require('./controllers/shop/admin/order');

var multer  = require('multer')
	,	upload = multer({ dest: __dirname +'/public/uploads/'});

var dbShop = require('./data/shop');

module.exports = function(app) {

	/*
	 * Shop Routes
	 */

	// Main routes
	app.get('/', main.shopCommonTasks, main.getHome);
	//app.get('/:page', main.shopCommonTasks, main.getHome);

	app.get('/contact', main.shopCommonTasks, contact.getContact);
	app.post('/contact', main.shopCommonTasks, contact.postContact);


	app.get('/lessons/team', main.shopCommonTasks, contact.getTeam);
	app.get('/blog', main.shopCommonTasks, contact.getBlog);

	// Category
	app.get('/category/:seo', main.shopCommonTasks, category.getBySEO);
	app.get('/category/:seo/:page', main.shopCommonTasks, category.getBySEO);

	// Product
	app.get('/product/:seo', main.shopCommonTasks, product.getBySEO);

	// Cart
	app.post('/cart/add', main.shopCommonTasks, checkout.killCheckoutProcess, cart.addProduct);
	app.put('/cart/:id', main.shopCommonTasks, checkout.killCheckoutProcess, cart.updateProduct);
	app.delete('/cart/:id', main.shopCommonTasks, checkout.killCheckoutProcess, cart.removeProduct);

	// Acount
	app.get('/myaccount', main.shopCommonTasks, account.ensureAuthenticated, account.getAccount);
	app.post('/myaccount/update', main.shopCommonTasks, account.ensureAuthenticated, account.updateAccount);
	app.get('/logout', main.shopCommonTasks, account.ensureAuthenticated, account.getLogout);
	app.get('/signup', main.shopCommonTasks, account.getSignup);
	app.post('/signup', main.shopCommonTasks, account.postSignup);
	app.get('/login', main.shopCommonTasks, account.getLogin);
	app.post('/login', main.shopCommonTasks, account.postLogin);
	app.get('/account/forgot-password', main.shopCommonTasks, account.getForgotPassword);
	app.post('/account/forgot-password', main.shopCommonTasks, account.postForgotPassword);
	app.get('/account/reset-password/:code', main.shopCommonTasks, account.getResetPassword);
	app.post('/account/reset-password/:code', main.shopCommonTasks, account.postResetPassword);

	// Cart
	app.get('/shopping-cart', main.shopCommonTasks, cart.getCart);

	// Checkout
	app.get('/checkout', checkout.getCheckout);
	//app.get('/checkout', main.shopCommonTasks, cart.isCartExist, checkout.getCheckout);
	app.get('/checkout/step/:step', main.shopCommonTasks, account.ensureAuthenticated, checkout.isOrderExist, checkout.getStep);
	app.post('/checkout/shippingrate', main.shopCommonTasks, account.ensureAuthenticated, checkout.isOrderExist, checkout.postCheckoutShippingRate);
	app.get('/checkout/sendorder', main.shopCommonTasks, account.ensureAuthenticated, checkout.isOrderExist, checkout.sendCheckoutOrder);
	app.get('/checkout/cancelorder', main.shopCommonTasks, account.ensureAuthenticated, checkout.isOrderExist, checkout.cancelCheckoutOrder);

	/*
	 * Admin Routes
	 */

	var adminCleverRedirect = adminLogin.cleverRedirect
		,	adminEnsureAuthenticated = adminLogin.ensureAuthenticated;

	app.get('/admin', main.shopCommonTasks, adminCleverRedirect, adminLogin.getLogin);
	app.get('/admin/login', main.shopCommonTasks, adminCleverRedirect, adminLogin.getLogin);
	app.post('/admin/login', main.shopCommonTasks, adminLogin.postLogin);

	app.get('/admin/dashboard', main.shopCommonTasks, adminEnsureAuthenticated, admin.getDashboard);

	app.get('/admin/orders', main.shopCommonTasks, adminEnsureAuthenticated, adminOrder.getOrders);
	app.get('/admin/order/:id', main.shopCommonTasks, adminEnsureAuthenticated, adminOrder.getDetailsOrder);

	app.get('/admin/settings', main.shopCommonTasks, adminEnsureAuthenticated, adminSetting.getSettingsUser);
	app.get('/admin/settings/pages', main.shopCommonTasks, adminEnsureAuthenticated, adminSetting.getSettingsPages);
	app.get('/admin/settings/shipping', main.shopCommonTasks, adminEnsureAuthenticated, adminSetting.getSettingsShipping);
	app.get('/admin/settings/theme', main.shopCommonTasks, adminEnsureAuthenticated, adminSetting.getSettingsTheme);
	app.get('/admin/logout', main.shopCommonTasks, adminEnsureAuthenticated, adminLogin.getLogout);

	app.post('/admin/custom/settings', main.shopCommonTasks, adminEnsureAuthenticated, adminSetting.postCustomSettings);
	app.post('/admin/settings/shipping/addcountry', main.shopCommonTasks, adminEnsureAuthenticated, adminSetting.postShippingNewCountry);
	app.get('/admin/settings/shipping/deletecountry/:id/:code', main.shopCommonTasks, adminEnsureAuthenticated, adminSetting.getShippingDeleteCountry);
	app.post('/admin/settings/shipping/:country/addrate', main.shopCommonTasks, adminEnsureAuthenticated, adminSetting.postShippingNewRate);
	app.get('/admin/settings/shipping/:country/deleterate/:id', main.shopCommonTasks, adminEnsureAuthenticated, adminSetting.getShippingDeleteRate);

	app.get('/admin/settings/tax', main.shopCommonTasks, adminEnsureAuthenticated, adminSetting.getSettingsTax);
	app.post('/admin/settings/tax/addcountry', main.shopCommonTasks, adminEnsureAuthenticated, adminSetting.postTaxNewCountry);
	app.get('/admin/settings/tax/deletecountry/:id/:code', main.shopCommonTasks, adminEnsureAuthenticated, adminSetting.getTaxDeleteCountry);
	app.post('/admin/settings/tax/:country/addtax', main.shopCommonTasks, adminEnsureAuthenticated, adminSetting.postTaxNewRate);
	app.get('/admin/settings/tax/:country/deletetax/:id', main.shopCommonTasks, adminEnsureAuthenticated, adminSetting.getTaxDeleteRate);


	app.get('/admin/categories', main.shopCommonTasks, adminEnsureAuthenticated, adminCategories.getTopNav);
	app.post('/admin/category/add', main.shopCommonTasks, adminEnsureAuthenticated, adminCategories.postCategory);
	app.post('/admin/category/edit/:id', main.shopCommonTasks, adminEnsureAuthenticated, adminCategories.postEditCategory);
	app.get('/admin/category/:id', main.shopCommonTasks, adminEnsureAuthenticated, adminCategories.getCategoryDetails);
	app.get('/admin/category/delete/:parent/:id', main.shopCommonTasks, adminEnsureAuthenticated, adminCategories.deleteCategory);
	app.get('/admin/categories/all', main.shopCommonTasks, adminEnsureAuthenticated, adminCategories.getAllCategories);

	app.get('/admin/products', main.shopCommonTasks, adminEnsureAuthenticated, adminProduct.getAll);
	app.get('/admin/products/filter/:filtertype', main.shopCommonTasks, adminEnsureAuthenticated, adminProduct.getAll);
	app.get('/admin/products/add', main.shopCommonTasks, adminEnsureAuthenticated, adminProduct.getAddProduct);
	app.post('/admin/products/add', main.shopCommonTasks, adminEnsureAuthenticated, adminProduct.postProduct);
	app.get('/admin/products/edit/:pid', main.shopCommonTasks, adminEnsureAuthenticated, adminProduct.getProduct);
	app.post('/admin/products/edit/:pid', main.shopCommonTasks, adminEnsureAuthenticated, adminProduct.postEditProduct);
	app.get('/admin/products/delete/:pid', main.shopCommonTasks, adminEnsureAuthenticated, adminProduct.getDeleteProduct);
	app.post('/admin/products/groupedaction', main.shopCommonTasks, adminEnsureAuthenticated, adminProduct.postActionOnProductsList);

	app.post('/admin/products/image-upload', main.shopCommonTasks, adminEnsureAuthenticated, upload.single('file'), adminProduct.postUploadHandler);
	app.post('/admin/product/maj-featured', main.shopCommonTasks, adminEnsureAuthenticated, adminProduct.postUpdateFeatured);

	app.get('/admin/coupons', main.shopCommonTasks, adminEnsureAuthenticated, adminCoupons.getAll);

};
