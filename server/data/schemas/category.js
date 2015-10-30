// Require mongoose and mongoose schema
var mongoose = require('mongoose')
  , monguurl = require('monguurl')
  , Schema = mongoose.Schema;

// Define category schema
var CategorySchema = new Schema({
    
  name: { type: String, required: true },
  shop_id: { type: String, required: true, index: true },
  level: { type: Number, required: true }, //0 == topnav
  place: { type: Number, required: true },
  parentId: { type: String, required: true }, // no parent == 0
  //seo: { type: String, required: true, unique: true }
  slug: { type: String, index: { unique: true } }
  
});

CategorySchema.plugin(monguurl({
  source: 'name',
  target: 'slug'
}));

// Export category model
module.exports = mongoose.model('Category', CategorySchema);