module.exports = {

	message: {
    _from: "158745@supinfo.com"
  , _reply_to: "jeremy.robertou@supinfo.com"
	},
	
	server: {
	    _ssl: true
	  , _host: "in-v3.mailjet.com"
	  , _domain: "mailjet.com"
	  , _port: 587
	  , _use_authentication: "login"       
	  , _username: "83fc77ed1dc1c17aef26a5313913a619"            
	  , _password: "0d03f874a14b2f4aa606a5855d43fc04"
	},

	templatePath: __dirname + '/email-templates/'
}