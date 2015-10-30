
var bcrypt = require('bcrypt');

var salt = bcrypt.genSaltSync(10);
var hash = bcrypt.hashSync('test', salt);

console.log(salt);console.log(hash)
