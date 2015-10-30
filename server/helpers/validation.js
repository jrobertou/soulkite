module.exports = {
	email: function(value) {
		if (!value || value == '')
			return false;
		
	  var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
	  return emailRegex.test(value);
	},
	url: function(value) {
	  var urlRegex = /^([a-z0-9]{3,30})?$/;
	  return urlRegex.test(value);
	},
	notEmpty: function(value) {
	  return (value && value != '')
	},
	isTrue: function(value) {
	  return (value && value === true)
	}
}