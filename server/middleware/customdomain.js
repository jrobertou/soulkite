var dbShop = require("../data/shop")
  , fn = require('../helpers/functions');

module.exports = function () {
    return function (req, res, next) {

        var hostname = req.host;
        var protocol = req.socket.encrypted ? 'https' : 'http';

        // Redirect if hostname contains www.
        if (/^www/.test(hostname)) {
          res.redirect(protocol + '://' + hostname.replace(/^www\./, '') + req.url);
          return;
        }

        // Classic domain
        if (hostname == GLOBAL.siteurl) { //console.log('1');
          next();
        }
        // Subdomain
        else if (hostname.indexOf('.'+GLOBAL.siteurl) != -1 && req.subdomains.length === 1) { //console.log('2');
          var subdomain = req.subdomains[0];
          console.log('subdomain 1')
          if (req.session && req.session.shop && req.session.shop.url == subdomain) {
            //console.log('Shop already in session :) - 2');
            req.url = '/subdomain/' + subdomain + req.url;
            next();
            return;
          }

          dbShop.getShopBySeo(subdomain, function(err, shop) {
            if (!err && shop) {
              // Si un custom domain existe on redirige vers la bonne url
              if (shop.custom_domain) {
                res.redirect('http://' + shop.custom_domain + req.url);
                return;
              }
              req.session.shop = shop;
              req.url = '/subdomain/' + subdomain + req.url;
              next();
            }
            else {
              res.render(fn.websiteViewsPath('404'));
            }
          });
        }
        // Custom domain
        else {
                    console.log('subdomain 2')

          if (req.session && req.session.shop && req.session.shop.custom_domain == hostname) {
            //console.log('Shop already in session :) - 3');
            req.url = '/subdomain/' + req.session.shop.url + req.url;
            next();
            return;
          }

          dbShop.getShopByCustomDomain(hostname, function(err, shop) {
            if (!err && shop) {
              req.session.shop = shop;
              req.url = '/subdomain/' + shop.url + req.url;
              next();
            }
            else {
              res.render(fn.websiteViewsPath('404'));
            }
          });
        }
    }
}
