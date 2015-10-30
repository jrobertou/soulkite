// Require needed modules
var config = require('../../../../config/app.json')
  , dbProduct = require('../../../data/product')
  , dbImage = require('../../../data/image')
  , dbCat = require('../../../data/category')
  , seo = require('../../../helpers/seo')
  , fn = require('../../../helpers/functions')
  , fs = require('fs')
  , gm = require('gm')
  , AWS = require('aws-sdk')
  , errHelper = require('../../../helpers/error_display.js')
  , mongoose = require('mongoose');

// Export functions
module.exports = {

 getAll: function(req, res) {

    dbProduct.getAllProducts(req.session.user.shop._id, function(err, products) {
      dbCat.getArrayIdAllCategories(req.session.user.shop._id, function(err, categories) {
        // Render home page
        switch(req.params.filtertype) {
          case 'category':
              var filter = 'category';
              products  = _.sortBy(products, 'cat_id');
            break;

          case 'price':
              var filter = 'price';
              products  = _.sortBy(products, 'price');
            break;

          case 'stock':
              var filter = 'stock';
              products  = _.sortBy(products, 'stock');
            break;

          case 'featured':
              var filter = 'featured';
              products  = _.sortBy(products, 'featured')
                           .reverse();
            break;

          default:
              var filter = 'all';
            break;
        }

        res.render('shop/admin/products', {
          title: 'tagline',
          menuActive: 'products',
          filter: filter,
          user: req.session.user,
          products: products,
          categories: categories
        });
      });
    });

  },

  getAddProduct: function(req, res) {
    var product = {};

    var shop_id = req.session.user.shop._id;

    dbCat.getAllCategories(shop_id, function(err, categories) {
    //console.log(JSON.stringify(categories));

      if (err)
        console.log(err);
        // Render home page
        res.renderPjax('shop/admin/product', {
          user: req.session.user,
          product: product,
          categories: categories,
          menuActive: 'products'
        });
    });
  },


  postUpdateFeatured: function(req, res) {
    var val = req.body.featured == "true"? true:false
      , _id = req.body._id;
    dbProduct.findProductByID(req.session.user.shop._id, _id, function(err, prod){
      if(err)
        res.send({success:err})
      if(!err && _id == prod._id){
        dbProduct.updateFeatured(req.session.user.shop._id, _id, val, function(err){
          if(err)
            res.send({success:err, noDisplayResult:true})
          else
            res.send({success:true, noDisplayResult:true})
        });
      }
      else
        res.send({success:false, noDisplayResult:true})
    });

  },

  postProduct: function(req, res) {

    var self = this;

    var pid = req.params.pid
      , product = req.body.product
      , variants = req.body.variant
      , options = req.body.options;

    var img_ids = product && product.img_id ? product.img_id : [];

    // Treat posts vars
    var json = _treatProductReq(product, variants, options);
    if (json.success) {

      product = json.product;
      product.shop_id = req.session.user.shop._id;
      //product.thumbnail = {};

      // Save product in database
      dbProduct.saveProduct(product, function(err, newProduct) {
        if (err) {
          console.log(err);
          res.json({success: false, message: errHelper.display(err)});
          return;
        }
        dbImage.saveProductImages(newProduct.shop_id, newProduct._id, img_ids, function(err) {
          if (err)
            console.log(err);
          json.redirectUrl = '/admin/products';
          res.json(json);
        });
      });
    }
    else {
      res.json(json);
    }

  },

  postEditProduct: function(req, res) {

    var self = this;

    var pid = req.params.pid
      , product = req.body.product
      , variants = req.body.variant
      , options = req.body.options;

    // Treat posts vars
    var json = _treatProductReq(product, variants, options);
    if (json.success) {

      product = json.product;

      product.featured = product && product.featured;
      var img_ids = product && product.img_id ? product.img_id : [];

      // Save product in database
      dbProduct.editProduct(req.session.user.shop._id, pid, product, function(err, editedProduct) {
        if (err) {
          console.log(err);
          res.json({success: false, message: errHelper.display(err)});
          return;
        }
        dbImage.saveProductImages(req.session.user.shop._id, pid, img_ids, function(err) {
          if (err)
            console.log(err);
          json.redirectUrl = '/admin/products';
          res.json(json);
        });
      });
    }
    else {
      res.json(json);
    }
  },

  getProduct: function(req, res) {

    var pid = req.params.pid;
    var shop_id = req.session.user.shop._id;

    dbProduct.findProductByID(shop_id, pid, function(err, product) {

      if (err)
        console.log(err);

      dbImage.getImageByProduct(pid, function(err, images) { //console.log(JSON.stringify(images));

        if (err)
          console.log(err);

        dbCat.getAllCategories(shop_id, function(err, categories) { //console.log(JSON.stringify(categories));

          if (err)
            console.log(err);

          product.images = images;
          res.renderPjax('shop/admin/product', {
            user: req.session.user,
            product: product,
            categories: categories,
            config: config,
            menuActive: 'products'
          });
        });
      });
    });
  },

  getDeleteProduct: function(req, res) {
    dbProduct.deleteProductByID(req.session.user.shop._id, req.params.pid, function(err) {
      res.redirect('/admin/products');
    });
  },


  postActionOnProductsList: function(req, res) {

    var action = req.body.action
      , _idProducts = req.body.idprod;

    switch (action) {
      case 'stockToZero':
        dbProduct.stockToZeroByIDLIST(req.session.user.shop._id, _idProducts, function() {
          res.redirect('/admin/products');
        });
      break;
      case 'delete':
        dbProduct.deleteProductByIDLIST(req.session.user.shop._id, _idProducts, function() {
          res.redirect('/admin/products');
        });
      break;
      default :
        action = false;
      break;
    }

    if(!action)
      res.redirect('/admin/products');
  },

  postUploadHandler: function(req, res) {

    var fileCode = fn.uniqid('',true)
      , ext = req.file.originalname.split('.').pop()
      , file = {}
      , files = {};

    fs.readFile(req.file.path, function (err, data) {

      file = {
        'path': fileCode+"."+ext
      }

      fs.writeFile(config.uploadPath+file.path, data, function (err) {
        files['original'] = file;
        var sizes = [[50,50],[200,null],[400,null]];

        sizes.forEach(function(value) {

          var h = value[0]
            , w = value[1]
            , path = w===null ? fileCode+"_"+h+"."+ext : fileCode+"_"+h+"squared."+ext;

          files['s'+h] = {
            'height': h,
            'width': w,
            'path': path
          }
        });

        fn.resizeImage(files, function(err) {

          if (err)
            console.log(err);

          var image = { 'product_id': 0, 'files': files };

          dbImage.saveImage(image, function(err, newImage) {
            if (err) {console.log(err);}
            res.json({ 'success': true, img_id: newImage._id });
          });
          /*
          fn.uploadToS3(files, function(err) {
            if (err) console.log(err);
            console.log('Upload OK');

            res.json({ 'success' : true });
          });*/
        });
      });
    });
  }
};

var _treatProductReq = function(product, variants, options) {

  var json = {success: true};
  var authorizeKeysData = {
    '_id':            {required: false, type: 'string'},
    'sku':            {required: false, type: 'string'},
    'price':          {required: true, type: 'price'},
    'regular_price':  {required: true, type: 'price'},
    'stock':          {required: true, type: 'int'},
    'weight':         {required: false, type: 'float'},
    'dimensions':     {required: false, type: 'string'},
    'order':          {required: true, type: 'int'}
  };
  var authorizeKeys = Object.keys(authorizeKeysData);
  var addedOptions = [];
  var option_array = []
  var variantsArr = {};
  for (var k in options) {
    authorizeKeys.push(k);
    addedOptions.push(k);
    option_array.push({
      slug: k,
      name: options[k],
      list: []
    });
  }
  console.log(JSON.stringify(variants));
  // FIRST: Check if post vars are correct
  loop_check:
  for(var index in variants) {
    var post_keys = Object.keys(variants[index]);

    // Incorrect query
    if (authorizeKeys.length !== post_keys.length) {
      json = {
        success: false,
        message: 'Demande incorrecte.'
      }
      break;
    }

    for(var key_name in authorizeKeysData) {
      var variant = authorizeKeysData[key_name];

      if (variants[index][key_name]) {
        switch(variant.type) {
          case 'price':
            variants[index][key_name] = fn.parsePrice(variants[index][key_name]);
          break;
          case 'int':
            variants[index][key_name] = parseInt(variants[index][key_name]);
          break;
          case 'float':
            variants[index][key_name] = parseFloat(variants[index][key_name]);
          break;
        }
      }

      if ( post_keys.indexOf(key_name) == -1 || (variant.required && variants[index][key_name]=='') ) {
        json = {
          success: false,
          message: 'Le champ "'+key_name+'" est incorrect ou vide.'
        }
        break loop_check;
      }
    }

  }

  // If all is correct continue
  if (json.success) {

    for(var index in variants) {

      for (var j in variants[index]) {

        // Si la clé est valide
        if (authorizeKeys.indexOf(j) !== -1) {

          // Si c'est une option ajouté par l'utilisateur
          if (addedOptions.indexOf(j) !== -1) {

            var _key = fn.findKey(option_array, 'slug', j);
            if (_key !== -1) {
              if (option_array[_key].list.indexOf(variants[index][j]) == -1)
                option_array[_key].list.push(variants[index][j]);
            }

          }

        }

      }

      var vid = variants[index]._id;
      if (!vid) {
        var uniqid = mongoose.Types.ObjectId();
        variants[index]._id = uniqid;
        variantsArr[uniqid] = variants[index];
      }
      else {
        variantsArr[vid] = variants[index];
      }

    }

    product.variants = {}
    product.variants.options = option_array;
    product.variants.data = variantsArr;
    product = _computeProductData(product);

    json.product = product;
  }

  return json;
}

_computeProductData = function(product) {

  var key = Object.keys(product.variants.data)[0];

  if (key) {

    var minPrice = product.variants.data[key].price;
    var minRegularPrice = product.variants.data[key].regular_price;
    var maxStock = product.variants.data[key].stock;

    for(var index in product.variants.data) {
      if (product.variants.data[index].price < minPrice) {
        minPrice = product.variants.data[index].price;
        minRegularPrice = product.variants.data[index].regular_price;
      }
      if (product.variants.data[index].stock > maxStock) {
        maxStock = product.variants.data[index].stock;
      }
    }

    product.variants.price_min = minPrice;
    product.variants.regular_price_min = minRegularPrice;
    product.variants.stock_max = maxStock;

  }

  return product;
}
