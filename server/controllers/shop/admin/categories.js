// Require needed modules
var config = require('../../../../config/app.json')
  , dbCategory = require('../../../data/category')
  , dbProduct = require('../../../data/product')
  , errHelper = require('../../../helpers/error_display');

// Export functions
module.exports = {

  getTopNav: function(req, res) {

    //res.renderPjax('website/404');
    dbCategory.getAllCategories(req.session.user.shop._id, function(err, categories){
      var err = null;
      if(err)
        err = errHelper.display(err);

      //console.log(categories);

      res.renderPjax('shop/admin/categories', {
        page: {title: 'Categories', level: 0, parent: 0, actionTitle: 'Nouvelle catégorie'},
        categories: categories,
        //categoriesAll: categories,
        menuActive: 'categories',
        user: req.session.user,
        err: err
      });
    });
  },

  deleteCategory: function(req, res) {
    var idDelete = req.params.id
      , parentId = req.params.parent;

    dbCategory.deleteCategory(req.session.user.shop._id, idDelete, function(err){
      if(err){
        console.log(err);
        res.redirect('/admin/categories');
      }
      else {
        dbProduct.removeProductCategory(req.session.user.shop._id, idDelete, function(err){
          if(err){
            console.log(err);
            res.redirect('/admin/categories');
          }
          else {
            if (parentId && parentId != 0)
              res.redirect('/admin/category/'+parentId)
            else
              res.redirect('/admin/categories')
          }
        });
      }
    });
  },

  getCategoryDetails: function(req, res) {
    var parentId = req.params.id;

    dbCategory.getCategoryById(req.session.user.shop._id, parentId, function(err, category) {
      var err = null;
      if(err)
        err = errHelper.display(err);

      dbCategory.getCategoriesByParent(req.session.user.shop._id, parentId, function(err, categories){
        var err = null;
        if(err)
          err = errHelper.display(err);

        res.renderPjax('shop/admin/categories', {
          page: {title: 'Categories » '+category.name, level: 1, parent: parentId, actionTitle: 'Nouvelle sous catégorie'},
          categories: categories,
          menuActive: 'categories',
          user: req.session.user,
          err: err
        });
      });
    });

  },

  postCategory: function(req, res) {
    var trycategory = req.body.category;
    trycategory.shop_id = req.session.user.shop._id;

    dbCategory.saveCategory(trycategory, function(err, newCat){
      var err = null;
      if(err)
        console.log(err);
      if (newCat.parentId && newCat.parentId != 0)
        res.redirect('/admin/category/'+newCat.parentId)
      else
        res.redirect('/admin/categories')
    });
  },

  postEditCategory: function(req, res) {
    var magcategory = req.body.category;
    magcategory.shop_id = req.session.user.shop._id;
    magcategory._id = req.params.id;

    dbCategory.updateCategory(magcategory, function(err, majCat){
      if(err)
        console.log(err);

      res.json({success:true,redirectUrl:'/admin/categories'});
      /*if (majCat.parentId && majCat.parentId != 0)
        res.redirect('/admin/category/'+majCat.parentId)
      else
        res.redirect('/admin/categories')*/
    });
  },

  getAllCategories: function(req, res){
    dbCategory.getAllCategories(req.session.user.shop._id, function(err, collection){
      res.send({collection:collection, err: err})
    });
  }
};
