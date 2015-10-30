var config = require("../../config/app.json")
  , fs = require('fs')
  , gm = require('gm')
  , AWS = require('aws-sdk')
  , async = require('async');

// Export functions
var fn = {

  shopViewsPath: function(theme, viewname) {
    return 'shop/themes/basic/'+viewname;
    if (config.themes.indexOf(theme) > -1) {
      return 'shop/themes/'+theme+'/'+viewname;
    }
    else {
      return 'shop/themes/basic/'+viewname;
    }

  },

  roundToTwo: function (num) {
    return +(Math.round(num + "e+2")  + "e-2");
  },

  findKey: function(obj, key, value) {
    var _key = -1;

    _.each(obj, function (v, k) {
      if (v[key] === value)
        _key = k;
    });

    return _key;
  },

  displayPrice: function(currency, price) {
    price = parseFloat(price).toFixed(2);
    switch(currency) {
      case "EUR":
          return price+'€';
        break;

      case "USD":
          return '$'+price;
        break;

      default:
          return price+' '+currency;
        break;
    }
  },

  displayListing: function(list) {
    var str = '';
    _.each(list, function(val){ str += val+', '; });
    str = str.substring(0, str.length-2);
    return str;
  },

  parsePrice: function(price) {
    return parseFloat(price.replace(',', '.'));
  },

  isProperty: function(o, key){
    for (var key2 in o){
      if (key === key2)
        return true;
    }
    return false;
    //return -1 != _.keys(o).indexOf(key);
  },

  websiteViewsPath: function(viewname) {
    return 'website/'+viewname;
  },

  adminViewsPath: function(viewname) {
    return 'shop/admin/'+viewname;
  },

  uniqid: function(prefix, more_entropy) {
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +    revised by: Kankrelune (http://www.webfaktory.info/)
    // %        note 1: Uses an internal counter (in php_js global) to avoid collision
    // *     example 1: uniqid();
    // *     returns 1: 'a30285b160c14'
    // *     example 2: uniqid('foo');
    // *     returns 2: 'fooa30285b1cd361'
    // *     example 3: uniqid('bar', true);
    // *     returns 3: 'bara20285b23dfd1.31879087'
    if (typeof prefix === 'undefined') {
      prefix = "";
    }

    var retId;
    var formatSeed = function (seed, reqWidth) {
      seed = parseInt(seed, 10).toString(16); // to hex str
      if (reqWidth < seed.length) { // so long we split
        return seed.slice(seed.length - reqWidth);
      }
      if (reqWidth > seed.length) { // so short we pad
        return Array(1 + (reqWidth - seed.length)).join('0') + seed;
      }
      return seed;
    };

    // BEGIN REDUNDANT
    if (!this.php_js) {
      this.php_js = {};
    }
    // END REDUNDANT
    if (!this.php_js.uniqidSeed) { // init seed with big random int
      this.php_js.uniqidSeed = Math.floor(Math.random() * 0x75bcd15);
    }
    this.php_js.uniqidSeed++;

    retId = prefix; // start with prefix, add current milliseconds hex string
    retId += formatSeed(parseInt(new Date().getTime() / 1000, 10), 8);
    retId += formatSeed(this.php_js.uniqidSeed, 5); // add seed hex string
    if (more_entropy) {
      // for more entropy we add a float lower to 10
      retId += (Math.random() * 10).toFixed(8).toString();
    }

    return retId;
  },

  basename: function(path) {
    return path.replace(/\\/g,'/').replace( /.*\//, '' );
  },

  dirname: function(path) {
    return path.replace(/\\/g,'/').replace(/\/[^\/]*$/, '');;
  },

  getKeyByValue: function(arr, value) {
    var self = this;
    for(var prop in arr) {
      if (self.isProperty(arr, prop)) {
        if (arr[prop] === value)
          return prop;
      }
    }
  },

  calculTax: function(totalCart, arrRate, objShipping) {
    var roundToTwo = this.roundToTwo;
    arrRate = _.groupBy(arrRate, 'includedInPrice');
    var rateDetails = []
      , subPrice = totalCart
      , ht = 0
      , ttc = subPrice + objShipping.price;

    if(arrRate[true] && arrRate[true].length) {
      for ( var i = arrRate[true].length - 1, imax = 0; i >= imax; --i){
        var rate = arrRate[true][i]
          , val = (rate.percent/100) * subPrice;
        subPrice -= val;
        rateDetails.push({name: rate.name, percent: rate.percent, value: roundToTwo(val), important: false});
      }
    }

    if (subPrice != totalCart){
      ht = subPrice;
      rateDetails.unshift({name: "Tax free", percent: null, value: roundToTwo(subPrice), important: false});
    }

    rateDetails.push({name: "Sub-total", percent: null, value: roundToTwo(totalCart), important: true});
    rateDetails.push({name: 'Shipping cost <i class="small">('+objShipping.name+')</i>', percent: null, value: objShipping.price, important: false});

    if(arrRate[false] && arrRate[false].length) {
      for ( var i = 0, imax = arrRate[false].length; i < imax; ++i){
        var rate = arrRate[false][i]
          , val = (rate.percent/100) * ttc;
        ttc += val;
        rateDetails.push({name: rate.name, percent: rate.percent, value: roundToTwo(val), important: false});
      }
    }

    rateDetails.push({name: "Total", percent: null, value: roundToTwo(ttc), important: true});

    return {ttc:ttc.toFixed(2), ht:ht.toFixed(2), subtotal:roundToTwo(totalCart), rateDetails:rateDetails};
  },

  resizeImage: function(files, callback) { file

    var file = files.original; // The initial image

    async.forEach(Object.keys(files), function(key, c) {
      var f = files[key];
      if (typeof f.height != 'undefined')
        if (f.width===null) {
          gm(config.uploadPath+file.path).quality(90).resize(f.height, f.width).write(config.uploadPath+f.path, c);
        }
        else {
          gm(config.uploadPath+file.path).quality(90).resize(f.height, f.width).crop(f.height, f.width, 0, 0).write(config.uploadPath+f.path, c);
        }
      else c();
    }, function(err) {
      if (err) console.log(err);
      callback(err);
    });

  },

  uploadToS3: function(image, next) {

    AWS.config.loadFromPath('./config/aws.json');
    var s3bucket = new AWS.S3({params: {Bucket: config.S3.bucket}});

    // For each paths
    async.forEach(Object.keys(image.files), function(key, callback) {
      var f = image.files[key];
      // Read the file
      fs.readFile(config.uploadPath+f.path, function (err, data) {
        if (err) console.log(err);
        var data = { Key: fn.basename(f.path), Body: data, ACL: 'public-read' };
        // Put the photo on S3
        s3bucket.putObject(data, function (err) {
          if (err) console.log(err);
          // Delete the image
          fs.unlink(config.uploadPath+f.path, function(err) {
            if (err) console.log(err);
            callback(err);
           });
        });
      });
    }, function(err) {
      if (err) console.log(err);
      next(err);
    });
  }
};

module.exports = fn;
