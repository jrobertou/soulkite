var nodemailer = require('nodemailer'),
    jade = require('jade'),
    path = require('path'),
    config = require('./mailer-config');
 

var Mailer = function Mailer(targetemail, jadeparam) {
  if (targetemail)
    this._targetemail = targetemail;

  if (jadeparam)
    this._jadeparam = jadeparam;

  this._path = config.templatePath;
};
 
Mailer.prototype = {
  
  smtp: function() {
    var server = config.server;
    return {
      host: server._host,
      port: server._port,
      domain: server._domain,
      auth: {
        user: server._username,
        pass: server._password
      }
    }
  },
 
  /**
   * _to: - Who the email is being sent to.
   * _sender: - Who the email is being sent from.
   * _subject: - The defauly email subject.
   * _reply_to: - The email address to reply to. 
   * 
   */
  data: function() {
    return {
        to: this._targetemail
      , subject: this._subject
      , sender: this._from? this._from : config.message._from
      , reply_to: this._reply_to? this._reply_to: config.message._reply_to
    }
  },
  
  send: function() {

    var data = this.data(),
      smtpConfig = this.smtp(),
      callback = this._callback;

    jade.renderFile(this._path + this._template, this._jadeparam, function(err, file) {
      if(err) console.log(err);
      data.html = file;
      var transport = nodemailer.createTransport("Mailjet", smtpConfig);

      transport.sendMail(data, function(error, response){
        if(error){
            console.log(error);
            callback(error, null);
        }
        else{
            console.log("Message sent: " + response.message);
            callback(null, data); 
        }
      });
      transport.close();
    });
  }
};


module.exports = {
  contactInShop: function (shop, exp, callback) {
    var mailer = new Mailer(shop.contact_email, {exp:exp});
    mailer._subject = exp.subject;
    mailer._template = 'contact-in-shop.jade';
    mailer._callback = callback;
    mailer._reply_to = exp.email;
    mailer.send();
    return mailer;
  },

  signupUser: function (user, shop, callback) {
    var mailer = new Mailer(user.email, {user:user, shop:shop});
    mailer._subject = 'Mon eBoutique.fr, enregistrement reussi';
    mailer._template = 'user-signup.jade';
    mailer._callback = callback;
    mailer.send();
    return mailer;
  },

  forgotPassword: function (customer, shop, callback) {
    var mailer = new Mailer(customer.email, {customer:customer, shop:shop});
    mailer._subject = shop.name + '- Reset Password';
    mailer._template = 'forgot-password.jade';
    mailer._callback = callback;
    mailer.send();
    return mailer;
  }
};