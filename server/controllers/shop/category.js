// Require needed modules
var dbCategory = require('../../data/category')
  , dbProduct = require('../../data/product')
  , fn = require('../../helpers/functions')
	,	config = require('../../../config/app.json')

// Export functions
module.exports = {

	// Show a category from url request
  getBySEO: function(req, res) {

    // Get Shop data from req
    var shop = req.session.shop;

    // Fing requested product
    dbCategory.findCategoryBySEO(req.session.shop._id, req.params.seo, function(err, category) {

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

        // Page
        var page = typeof req.params.page == 'undefined' ? 1 : req.params.page;
        var nb_per_page = 9;
        var current_url = '/category/'+req.params.seo+'/';

        dbProduct.getProductsByCatInPage(shop._id, category._id, nb_per_page, page, function(err, products, products_pages) { //console.log(JSON.stringify(images));

          if (err) {console.log(err);}

          var page = fn.shopViewsPath(shop.theme, 'category');

          products_pages.current_url = current_url;

          // Render product view
          res.render(page, {
            shop: req.session.shop,
            title: category.name,
            customer: req.session.customer,
            cart: req.session.cart,
            category: category,
            //current_cat:
            products: products,
            products_pages: products_pages,
            config: config
          });

        });
      }
    });
  }

};
