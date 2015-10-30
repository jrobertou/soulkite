var mongoose = require('mongoose')
  , User = require('./schemas/user');

module.exports = {

  saveUser: function(userInfo, callback) {
    var newUser = new User (userInfo);
    newUser.save(function(err) {
      callback(err, newUser);
    });
  },

  deleteUser: function(user, callback) {
    var query = User.remove(user, 1);
    query.exec(function(err) {
      callback(err);
    });
  },

  logUser: function(email, password, callback) {
		User.authenticate( email, password, function(err, user) {
      if (user){
        callback(err, {
          _id : user._id,
          name : user.name,
          email: user.email,
          date: user.date,
          validated: user.validated
        });
      }
      else
  		  callback(err, null);
		});
  }
};