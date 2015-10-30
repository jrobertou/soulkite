var fn = require('./functions');

function addErr(addErr, sErr) {
	if(sErr.length)
		sErr += '<br/>'+addErr;
	else
		sErr = addErr;
	return sErr;
};

function mongoErr(err, sErr){
	var matching = {'$url_1': "L'url du magasin ", '$email_1': "L'email utilisateur "}
		,	returnE = ""
		,	endErr = " n'est pas disponible.";

	switch(err.code) {
		case 11000:
			returnE = err.err.split('E11000 duplicate key error index: ');
			returnE = returnE[returnE.length - 1].split('  dup key: { : "');
			returnE = returnE[0];
			var field = returnE[returnE.length - 1];
			field = field.split('" }');
			field = field[0];

			returnE = returnE.split('.');
			returnE = returnE[returnE.length - 1];
			if (fn.isProperty(matching, returnE)){
				returnE = matching[returnE]+endErr;
				sErr = addErr(returnE, sErr);
			}
			else{
				sErr = addErr(field + endErr, sErr);
			}
			break;
		default:
			sErr = addErr('Une erreur est survenue', sErr);
			break;
	}
	return sErr;
};

function validationErr(err, sErr){
	var beginningErr = 'Le champ '
		,	endErr = ' est requis'
		,	tmperr
		, key;


	var matching = {
		'name.first': 'prenom',
		'name.last': 'nom',
		'url': 'url magasin',
		'email': 'email',
		'paypal_email': 'email paypal',
		'shipping.address.pcd': 'code postal',
		'shipping.address.town': 'ville',
		'shipping.address.address1': 'adresse',
		'country_name': 'pays'
	};
	if(err && err.errors){
		for (var key in err.errors) {
			tmperr = err.errors[key];
      switch (err.errors[key].type) {
        case 'required':
         if (fn.isProperty(matching, key))
					sErr = addErr(beginningErr + matching[key] + endErr, sErr);
				else if(tmperr.path)
					sErr = addErr(beginningErr + key + endErr, sErr);
          break;
        case 'user defined':
          sErr = tmperr.message;
          break;
        default:
        	break;
      }
		}
	}
	return sErr;
};

module.exports = {

	display: function(err) {
		var sErr = '';
		if(err && fn.isProperty(err, 'name')) {
			switch (err.name) {
        case 'MongoError':
         	sErr = mongoErr(err, sErr);
          break;
        case 'ValidationError':
					sErr = validationErr(err, sErr);
          break;
        default:
        	sErr = err.toString().replace('Error: ', '');
        	break;
      }
		}
		else {
			if(err && err.toString())
				sErr = err.toString().replace('Error: ', '');
		}
		return sErr;
	}
}
