var dbProduct = require('../data/product')
  , dbCat = require('../data/category');

module.exports = {

	createUrl: function(string) {
    return this.removeDiacritics(string);
	},

  createProductSeo: function(string, n, callback) {
    var n = n==0 ? '' : n++;
    var tmpurl = this.removeDiacritics(string+' '+n);
    dbProduct.findProductBySEO(tmpurl, function(err, product) {
      if (product) {
        return arguments.callee(string, n==0?1:n)
      }
      callback(tmpurl);
    });
  },

  removeDiacritics: function(chaine) {

      function preg_replace(array_pattern, array_pattern_replace, my_string) {
        var new_string = String (my_string);
        for (i=0; i<array_pattern.length; i++) {
            var reg_exp = RegExp(array_pattern[i], "gi");
            var val_to_replace = array_pattern_replace[i];
            new_string = new_string.replace (reg_exp, val_to_replace);
        }
        return new_string;
      }

      var new_string = "";
      var pattern_accent = new Array("é", "è", "ê", "ë", "ç", "à", "â", "ä", "î", "ï", "ù", "ô", "ó", "ö");
      var pattern_replace_accent = new Array("e", "e", "e", "e", "c", "a", "a", "a", "i", "i", "u", "o", "o", "o");

      if (chaine && chaine != "") {
        new_string = preg_replace(pattern_accent, pattern_replace_accent, chaine);
      }

      var new_string = new_string.replace(/[^a-zA-Z0-9]/g,' ').replace(/\s+/g,"-").toLowerCase();
      /* remove first dash */
      if(new_string.charAt(0) == '-') new_string = new_string.substring(1);
      /* remove last dash */
      var last = new_string.length-1;
      if(new_string.charAt(last) == '-') new_string = new_string.substring(0, last);
     
      return new_string;

  }
}