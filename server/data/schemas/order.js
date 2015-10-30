// Require mongoose and mongoose schema
var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/*
customer: object ,
shippingRate: object,
shippingComments: string,
cart: object,
taxes: array,
ttc: 52.97292 number,
ht: 25.6 number,
subtotal: 32 number
*/

// Define user schema
var OrderSchema = new Schema({
  shop_id: {type: String, required: true, index: true },
  customercode: { type: String}, //idshop + email user collé
  status: { type: String, enum: ['pending', 'failed', 'completed', 'on-hold', 'cancelled', 'refunded'], default: 'pending' },
  shippingComments: { type: String, default: '' },
  date: { type: Date, default: Date.now },
	ht: {type: Number, required: true},
	ttc: {type: Number, required: true},
	taxes: {type: Array, required: true},
	customer: { type: Object, required: true},
	cart: { type: Object, required: true},
  shippingRate: { type: Object, required: true}
});

var Order = mongoose.model('Order', OrderSchema);

// Export user model
module.exports = Order;