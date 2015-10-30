module.exports = {
	randomString: function(length){
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz",
			randomstring = '',
			index = 0;

		for (var i=0; i<length; i++) {
			index = Math.floor(Math.random() * chars.length);
			randomstring += chars.substring(index,index+1);
		}
		return randomstring;
	}
}