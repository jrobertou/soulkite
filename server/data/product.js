var mongoose = require('mongoose')
  , Product = require("./schemas/product")
  , Category = require("./schemas/category")
  , fn = require('../helpers/functions');

module.exports = {

  saveProduct: function(productInfo, callback) {

    var newProduct = new Product (productInfo);

    newProduct.save(function(err) {
      if (err)
        console.log(err);

      callback(err, newProduct);
    });

  },

  deleteProductByID: function(shop_id, id, callback) {
    Product.remove({_id : id, shop_id: shop_id})
      .exec(function(err) {  
        callback(err);
      });
  },

  deleteProductByIDLIST: function(shop_id, idlist, callback) {
    Product.remove({shop_id: shop_id, _id : { $in: idlist } })
      .exec(function(err) {  
        callback(err);
      });
  },

  stockToZeroByIDLIST: function(shop_id, idlist, callback) {
    Product.update( {shop_id: shop_id,  _id: { $in : idlist } }, { $set: { stock: 0 } }, { upsert: false, multi: true } )
      .exec(function(err) {  
        callback(err);
      });
  },
  
  editProduct: function(shop_id, pid, productInfo, callback) {

    this.findProductByID(shop_id, pid, function(err, productDb) {
      if (productDb && productDb._id.toString() == pid.toString()) {
        for(var key in productInfo) {
          if(fn.isProperty(productDb, key)){
            productDb[key] = productInfo[key];
            productDb.markModified(key);
          }
        }

        productDb.save(function(err) {
          callback(err, productDb);
        });
      }
      else {
        callback(err, productDb);
      }
      
    });
  },

  getAllProducts: function(shop_id, callback) {
    Product.find({shop_id:shop_id}).sort({date: -1})
      .exec(function(err, products) {
        callback(err, products);
      });
  },

  getFeaturedProducts: function(shop_id, callback) {
    Product.find({shop_id: shop_id, featured: true}).sort({date: -1})
      .exec(function(err, products) {
        callback(err, products);
      });
  },

  getAllProductsInPage: function(shop_id, nb_per_page, page, callback) {
    Product.find({shop_id: shop_id}).skip((page-1)*nb_per_page).limit(nb_per_page).sort({date: -1}).exec(function(err, products) { 
      Product.find({shop_id: shop_id}).count().exec(function(err, products_count) {
        var products_pages = {}
        products_pages.page = page;
        products_pages.count = products_count;
        products_pages.nb_per_page = nb_per_page;
        products_pages.nb_page = Math.ceil(products_count/nb_per_page);
        callback(err, products, products_pages);
      });
    });
  },

  getProductsByCat: function(shop_id, cat_id, callback) {
    Product.find({shop_id:shop_id, cat_id: cat_id}).sort({date: -1})
      .exec(function(err, products) {
        callback(err, products);
      });
  },

  getProductsByCatInPage: function(shop_id, cat_id, nb_per_page, page, callback) {
    Category.find({shop_id: shop_id, parentId: cat_id}).sort({place: 1}).select('_id').exec(function(err, cat_ids) {

      cat_ids = _.pluck(cat_ids, '_id');
      cat_ids.push(cat_id);
      //console.log(cat_ids);

      Product.find({shop_id: shop_id}).where('cat_id').in(cat_ids).skip((page-1)*nb_per_page).limit(nb_per_page).sort({date: -1}).exec(function(err, products) {
        Product.find({shop_id: shop_id}).where('cat_id').in(cat_ids).count().exec(function(err, products_count) {
          var products_pages = {}
          products_pages.page = page;
          products_pages.count = products_count;
          products_pages.nb_per_page = nb_per_page;
          products_pages.nb_page = Math.ceil(products_count/nb_per_page);
          callback(err, products, products_pages);
        });
      });
    });
  },

  // Find product for url
  findProductBySEO: function(shop_id, seo, callback) {
    Product.findOne({shop_id: shop_id, slug : seo})
      .exec(function(err, product) {
        if (!product) 
          callback(new Error('Product not found!'));
        else
          callback(null, product);
      });
  },

  findProductByID: function(shop_id, id, callback) {
    variants={};
    Product.findOne({shop_id: shop_id, _id : id})
      .exec(function(err, product) { 
        if(product && product._id) {
          //console.log(JSON.stringify(product));
          //console.log(' ');
          variants = _.sortBy(product.variants.data, function(p){return p.order;});
          variants = _.indexBy(variants, '_id');
          product.variants.data = variants;
          //var test = _.sortBy(test, function(p){return p.regular_price;});
          //console.log(JSON.stringify(variants));
          callback(err, product);
        }
        else {
          callback(new Error('Product not found'), product);
        }

      });
  },

  updateFeatured: function(shop_id, _id, value, callback) {
    Product.update({shop_id: shop_id, _id: _id}, {$set: {
      featured: value
    }}, function (err) {
      if (err)
        callback(err);
      callback(null);
    });
  },

  removeProductCategory: function(shop_id, cat_id, callback) {
    Product.update({shop_id: shop_id, cat_id:cat_id}, {$set: {cat_id: -1}}, { upsert: false, multi: true },
      function (err) {
         callback(err);
      callback(null);
    });
  },

  updateStockAfterOrder: function(order, callback){
    for (var key in order.cart.products){
      var product = order.cart.products[key];
      this.findProductByID(order.shop_id, product.id, function(err, productDb){
        var idUpdate = product.variant.id;

        if (idUpdate && productDb && productDb.variants && productDb.variants.data && productDb.variants.data[idUpdate]) {

          // Compute new stock for the variant
          productDb.variants.data[idUpdate].stock = productDb.variants.data[idUpdate].stock - parseInt(product.quantity);
          productDb.markModified('variants.data');

          // Compute new stock max for the product
          var product_compute = _computeProductData(productDb);
          productDb.variants.stock_max = product_compute.variants.stock_max
          productDb.markModified('variants.stock_max');

          productDb.save(function(err) {
            callback(err, productDb);
          });
        }
        else
          callback(null, null)
      });
    }   
  }
};