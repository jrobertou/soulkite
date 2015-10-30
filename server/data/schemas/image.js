// Require mongoose and mongoose schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define product schema
var ImageSchema = new Schema({
  
  product_id: {type: String, required: true },
  files: { type: Object, required: true },
  order: { type: Number, default: 0 },
  host: { type: String, enum: ['server', 's3'], default: 'server' }

});

// Export product model
module.exports = mongoose.model('Image', ImageSchema);