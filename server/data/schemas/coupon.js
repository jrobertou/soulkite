// Require mongoose and mongoose schema
var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

// Define product schema
var CouponSchema = new Schema({
  
  shop_id: { type: String, required: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  start_date: { type: Date, required: false },
  end_date: { type: Date, required: false },
  apply_to: { type: String, enum: ['all', 'at_least', 'category', 'product'], required: true },
  apply_to_data: { type: String, required: false },
  discount_type: { type: String, enum: ['flat', 'percentage', 'free_shipping'], required: true },
  discount_type_data: { type: Number, required: false }

});

// Export product model
module.exports = mongoose.model('Coupon', CouponSchema);