// Require needed modules
var mongoose = require('mongoose');

// Export functions
module.exports = {

  // Connect to database
  startup: function(dbToUse) {

  // Connect mongoose and select db
  mongoose.connect(dbToUse);

  // Add listener for opened connection
  mongoose.connection.on('open', 
    function() {
      console.log('Connected to database!');
    });
  },

  // Close DB connection
  closeDB: function() {
    mongoose.disconnect();
  }
};