// Require mongoose and mongoose schema
var mongoose = require('mongoose')
  , monguurl = require('monguurl')
  , Schema = mongoose.Schema;

// Define product schema
var ProductSchema = new Schema({
  
  shop_id: {type: String, required: true },
  cat_id: {type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: false },
  slug: { type: String, index: { unique: true } },
  featured: { type: Boolean, required: false },
  date: { type: Date, default: Date.now },
  thumbnail: { type: Object, required: false },

  variants: {
    price_min: { type: Number, required: true }, // Prix minimum parmis les variantes
    regular_price_min: { type: Number, required: true }, // Prix regular minimum du prix minimum
    stock_max: { type: Number, required: true }, // Stock maximum parmis les variantes
    options: [
      new Schema({
        slug: { type: String, required: true }, // unique: true
        name: { type: String, required: true },
        list: { type: Object, required: true }
      }, 
      {_id: false})
    ],
    data: { type: Object, required: true }
  }
});

ProductSchema.plugin(monguurl({
  source: 'name',
  target: 'slug'
}));

// Export product model
module.exports = mongoose.model('Product', ProductSchema);