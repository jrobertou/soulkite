var mongoose = require('mongoose')
  , Category = require("./schemas/category");

module.exports = {

  saveCategory: function(category, callback) {
    var newcat = new Category (category);
    newcat.save(function(err) {
      callback(err, newcat);
    });
  },

  updateCategory: function(majCat, callback) {
    this.getCategoryById(majCat.shop_id, majCat._id, function(err, category){
      if (err || !category)
        callback(err, null);

      if (majCat._id == category._id) {
        category.name = majCat.name;
        category.place = majCat.place;
        category.save(function(err) {
          callback(err, category);
        });
      }
      else {
        callback(new Error("categorie invalide"), null);
      }
    });
  },

  deleteCategory: function(shopId, id, callback) {
    Category.find({shop_id: shopId, parentId : id})
      .exec(function(err, children) {
        if (err)
          callback(err);
        else if (children.length)
          callback(new Error('You can\'t delete a category which have children'));
        else {
          Category.remove({shop_id: shopId, _id : id})
          .exec(function(err) {  
            callback(err);
          });
        }
      });
    
  },

  getCategoryById: function(shopId, id, callback){ 
    Category.findOne({shop_id: shopId, _id: id})
      .exec(function(err, category) { 
        callback(err, category);
      });
  },

  getCategoriesByLevel: function(shopId, level, callback){ 
    Category.find({shop_id: shopId, level : level}).sort( { place: 1 })
      .exec(function(err, categories) { 
        callback(err, categories);
      });
  },

  getCategoriesByParent: function(shopId, parent, callback){ 
    var query = Category.find({shop_id: shopId, parentId : parent}).sort( { place: 1 } );
    query.exec(function(err, categories) { 
      callback(err, categories);
    });
  },

  getAllCategories: function(shopId, callback){ 
    var query = Category.find({shop_id: shopId}).sort( { level: 1, place: 1 } );
    query.exec(function(err, categories) {
      if (categories.length){ 
        categories = _.groupBy(categories, 'parentId');
        categories = _.map(categories, function(o, key){return _.groupBy(o, 'parentId')}); //console.log(categories);
  
        var keysList = ['_id','slug','name','place','parentId','level','shop_id'];
  
        // First sort all the childs in the same array key for easy manipulating
        _.each(categories, function(value, key) {
          if (key>1) {
            var newKey = Object.keys(categories[key])[0]; 
            categories[1][newKey] = categories[key][newKey];
            delete categories[key];
          }
        });
  
        // Add the childs key for all the parent categories
        _.each(categories[0][0], function(value, key) {
          // Clean the mongod array (impossible to manipulate keys without that)
          var newArray = {}
          _.each(keysList, function(v, k) {
            newArray[v] = categories[0][0][key][v];
          });
  
          newArray.childs = [];
          if (categories[1] && categories[1][newArray._id]) {
            newArray.childs = categories[1][newArray._id];
          }
          categories[0][0][key] = newArray;
        });
        categories = categories[0][0];
      }
      categories = _.indexBy(categories, '_id');
      // Execute callback
      callback(err, categories);
    });
  },

  getArrayIdAllCategories: function(shopId, callback){ 
    var query = Category.find({shop_id: shopId}).sort( { level: 1, place: 1 } );
    query.exec(function(err, categories) {
      callback(err, _.indexBy(categories, '_id'));
    });
  },

  // Find category for url
  findCategoryBySEO: function(shop_id, seo, callback) {
    var query = Category.findOne({shop_id: shop_id, slug : seo});
    query.exec(function(err, category) {
      if (!category) 
        callback(new Error('Product not found!'));
      else
        callback(null, category);
    });
  },
};