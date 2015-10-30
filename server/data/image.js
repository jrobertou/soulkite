var mongoose = require('mongoose')
  , Image = require("./schemas/image");
var async = require('async');
var fn = require('../helpers/functions');
var fs = require('fs');
var config = require('../../config/app.json');
var dbProduct = require('./product');

var dbImage = {

  saveImage: function(imageInfo, callback) {

    var newImage = new Image(imageInfo);

    newImage.save(function(err) {
      if (err)
        throw err;
      callback(null, newImage);
    });
  },

  getImage: function(imid, callback) {

    Image.findOne({_id : imid})
      .exec(function(err, image) {
        callback(null, image);
      });

  },

  editImage: function(imid, imageInfo, callback) {

    // Save into database
    Image.update({_id: imid}, {$set: imageInfo}, function(err) {
      if (err)
        throw err;
      // Execute callback passed from route
      callback(null, imageInfo);
    });
  },

  getImageByProduct: function(product_id, callback) {

    Image.find({product_id:product_id}).sort({order: 'asc'})
      .exec(function(err, images) {
        callback(err, images);
      });

  },

  /**
   * Sauvegarde les photos pour un produit
   **/
  saveProductImages: function(shop_id, productId, imageIds, next) {

    if (imageIds.length) {

      // On boucle sur les ids des photos
      async.forEach(imageIds, function(imid, callback) {
        // On récupère les infos de la photo
        dbImage.getImage(imid, function(err, image) {
          if (err) console.log(err);
          if (image !== null) {
            // On attend que les deux fonctions soient exécutées avant de renvoyer le callback
            async.parallel([
              // Si la photo est en local, on l'upload sur les serveurs S3
              function(callback_2) {
                if (image.host=='server') {
                  fn.uploadToS3(image, function(err) {
                    if (err) console.log(err);
                    Image.update({_id: imid}, {$set: { 'host': 's3' }}, function(err) {
                      if (err) console.log(err);
                      callback_2(err);
                    });
                  });
                }
                else callback_2(null); // Déjà sur S3, on renvoie le callback
              },
              function(callback_2) {
                var order = fn.getKeyByValue(imageIds, imid);
                Image.update({_id: imid}, {$set: { 'product_id': productId, 'order': order }}, function(err) {
                  if (err) console.log(err);
                  callback_2(err);
                });
              }
            ], function(err) {
              // On renvoie le callback au forEach
              callback(err);
            });
          }
          else {
            callback('Image not found in db')
          }
        });
      }, function(err) {

        if (err) console.log(err);
        var imid = imageIds[0];
        dbImage.getImage(imid, function(err, image) {
          if (err) console.log(err);
          dbProduct.editProduct(shop_id, productId, { 'thumbnail' : image.files }, function(err, editedProduct) {
            if (err) console.log(err);
            next(err);
          });
        });

      });

    }
    else {
      next(null);
    }
  }
};

module.exports = dbImage;
