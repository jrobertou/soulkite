// Require needed modules
var dbProduct = require('../../data/product')
  , fn = require('../../helpers/functions');

// Export functions
module.exports = {

  isCartExist: function (req, res, next) {
    if (req.session.cart) { return next(); }
    // Redirect if not cart
    res.redirect('/');
  },

  getCart: function (req, res) {
    var shop = req.session.shop;
    var page = fn.shopViewsPath(shop.theme, 'cart');

    res.render(page, {
      shop: req.session.shop,
      title: 'Your Cart',
      cart: req.session.cart ? req.session.cart: null,
      customer: req.session.customer,
    });
  },

  // Add product to cart
  addProduct: function(req, res) {
    console.log(req.body)
    var req_product = req.body.product;
    req_product.qty = parseInt(req_product.qty);
    var variant_id = req_product.variant_id;

    //console.log(variant_id)

    // Variants keys are to be equals to match an existing product
    /*if (typeof req_product.variants !== 'undefined') {
      var variant = _.uniq(req_product.variants);
      if (variant.length > 1) {
        res.json({
          success: false,
          message: "Impossible d'ajouter ce produit au panier."
        });
      }
    }*/

    try {
      // Get product from database for given id
      dbProduct.findProductByID(req.session.shop._id, req_product.id, function(err, product) {
        if (err) {console.log(err)}

        if (!variant_id) {
          res.json({
            success: false,
            //message: "Impossible d'ajouter ce produit au panier.",
            redirectUrl: "/product/"+product.slug+"?alert=choose_variant"
          });
          return;
        }

        //console.log(variant_id)
        //console.log(JSON.stringify(Object.keys(product.variants.data)));

        // Si la variante n'existe pas
        var variant_data_keys = Object.keys(product.variants.data);
        if (variant_data_keys.indexOf(variant_id) == -1) {
          res.json({
            success: false,
            message: "Impossible d'ajouter ce produit au panier."
          });
          return;
        }
        /*if (typeof req_product.variants !== 'undefined') {
          var pickArray;

          // Test if variants in POST are equal with other variant in product variants array
          _.each(product.variants.data, function(variant, key){
            pickArray = _.pick(variant, _.keys(req_product.variants));
            if (_.isEqual(pickArray, req_product.variants))
              variant_id = key;
          });

          if (!variant_id) {
            res.json({
              success: false,
              message: "Impossible d'ajouter ce produit au panier."
            });
            return;
          }
        }*/

        // Initalise cart
        if (!req.session.cart) {
          req.session.cart = {
            products: {},
            count: 0,
            subtotal: 0,
            total: 0
          };
        }

        //var variant_id = variant_id ? variant_id : '';
        var product_uniq_key = product._id+'_'+variant_id;

        // Check if product already in cart
        if (!req.session.cart.products[product_uniq_key]) {

          if (variant_id && typeof product.variants.options.length) {
            variant = { id: variant_id, data: [] };
            _.each(product.variants.options, function(v, k) {
              variant.data.push({
                name: v.name,
                value: product.variants.data[variant_id][v.slug]
              });
            });

            //console.log(JSON.stringify(variant));
          }
          else {
            variant = null;
          }

          // Add product if not
          req.session.cart.products[product_uniq_key] = {
            id: product._id,
            name: product.name,
            price: product.variants.data[variant_id].price,
            slug: product.slug,
            quantity: req_product.qty,
            thumbnail: product && product.thumbnail ? product.thumbnail.s200.path : null,
            variant: variant
          };

        } else {

          // Increment count if already added
          req.session.cart.products[product_uniq_key].quantity += req_product.qty;
        }

        // Total cart
        req.session.cart.count = 0;
        req.session.cart.subtotal = 0;
        _.each(req.session.cart.products, function (product) {
          req.session.cart.count = req.session.cart.count + product.quantity;
          req.session.cart.subtotal = req.session.cart.subtotal + (product.price * product.quantity);
        });
        req.session.cart.total = req.session.cart.subtotal;

        var shop = req.session.shop;
        var page = fn.shopViewsPath(shop.theme, 'cartmenu');
        res.render(page, { cart: req.session.cart, shop: shop }, function(err, html) {

          // Respond with JSON
          res.json({
            success: true,
            message: "Produit ajouté avec succès !",
            html: html
          });

        });

      });
    }
    catch(err) {
      console.log(err);
      res.json({
        success: false,
        message: "Une erreur est survenue. Veuillez réessayer."
      });
    }

  },

  // Remove product from cart
  removeProduct: function(req, res) {

    // Check item count
    if (Object.keys(req.session.cart.products).indexOf(req.params.id) !== -1) {
      // Remove product
      delete req.session.cart.products[req.params.id];

      // Total cart
      recomputeTotals(req);

      // Remove cart if empty
      if (req.session.cart.count === 0) {
        delete req.session.cart;
      }

      res.json({ success: true });
    }
    else {
      res.json({ success: false });
    }

  },

  // Remove product from cart
  updateProduct: function(req, res) {

    var quantity = req.body.quantity;

    // Check item count
    if (Object.keys(req.session.cart.products).indexOf(req.params.id) !== -1) {
      if (quantity>0) {
        // Update quantity
        req.session.cart.products[req.params.id].quantity = parseInt(quantity);
      }
      else {
        delete req.session.cart.products[req.params.id];
      }

      // Total cart
      recomputeTotals(req);

      res.json({ success: true });
    }
    else {
      res.json({ success: false });
    }

  },

  recomputeTotals: function() {
    // Total cart
    req.session.cart.count = 0;
    req.session.cart.total = 0;
    _.each(req.session.cart.products, function (product) {
      req.session.cart.count = req.session.cart.count + product.quantity;
      req.session.cart.total = req.session.cart.total + (product.price * product.quantity);
    });
  }

};

var recomputeTotals = function(req) {
  // Total cart
  req.session.cart.count = 0;
  req.session.cart.total = 0;
  _.each(req.session.cart.products, function (product) {
    req.session.cart.count = req.session.cart.count + product.quantity;
    req.session.cart.total = req.session.cart.total + (product.price * product.quantity);
  });
}
