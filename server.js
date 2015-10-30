// Require express
var express = require('express')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , expressSession = require('express-session')
  , pjax = require('express-pjax')
  , errorHandler = require('errorhandler')
  , multer  = require('multer')
  , favicon = require('serve-favicon')
  , mongoStore = require('connect-mongo')(expressSession)
  , customdomain = require('./server/middleware/customdomain')
  , database = require('./server/data')
  , config = require('./config/app.json')
  , info = require('./package.json')
  , app = express();

GLOBAL.i18n = require('i18n');
GLOBAL._ = require('underscore');
GLOBAL.APIcountries = require('country-list')();
GLOBAL.APIcountries.states = require('./server/helpers/states-list');
GLOBAL.__displayPrice = require('./server/helpers/functions').displayPrice;
GLOBAL.__displayListing = require('./server/helpers/functions').displayListing;

i18n.configure({
    locales:['fr', 'en'],
    defaultLocale: 'fr',
    cookie: 'moneboutiquelan',
    directory: './server/locales',
});

var db_connection_config = ''
  , env = process.env.NODE_ENV || 'development';

// Check if mongo environment vars exist
if (env=='stagging' && (!process.env.MONGO_USER || !process.env.MONGO_PWD)) {
  console.log('');
  console.log('------------------------------');
  console.log('Please specify mongo env vars');
  console.log('------------------------------');
}

switch (env) {

  case 'development':
    app.locals.pretty = true;
    app.locals.S3url = config.S3.url;
    GLOBAL.siteurl = 'myshop.com';
    db_connection_config = config.connection;
    db_connection_config = 'mongodb://localhost:27017/myshop';
    //db_connection_config = 'mongodb://dbdev:dbpasswd@ds037451.mongolab.com:37451/myshop';
    break;

  case 'stagging':
    app.locals.S3url = config.S3.url;
    GLOBAL.siteurl = 'placebe.fr';
    db_connection_config = 'mongodb://'+process.env.MONGO_USER+':'+process.env.MONGO_PWD+'@ds037451.mongolab.com:37451/myshop';
    break;

  case 'production':
    app.locals.S3url = config.S3.url;
    GLOBAL.siteurl = 'moneboutique.com';
    db_connection_config = '';
    break;

  default:
    break;
}

// Start message
console.log('');
console.log('Mon eBoutique.fr Started! => ' + env);
console.log('');

// Connect to database
database.startup(db_connection_config);
console.log('Connecting to database...');

// Configure Express
  // Set up jade
app.set('views', __dirname + '/server/views');
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 3000);

// Define public assets
app.use(express.static(__dirname + '/public'));
//app.use(subdomain({ base : 'myshop.com:'+app.get('port'), removeWWW : true }));
app.use(pjax());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(i18n.init);
app.use(errorHandler());
app.use(multer({ dest: __dirname +'/public/uploads/'}))


// Set up sessions
app.use(expressSession({
  store: new mongoStore({url:db_connection_config}), // auto_reconnect: true => fix bug
  cookie: { maxAge: new Date().getTime() + 60 * 4 },// 2h
  secret: config.cookie_secret,
  saveUninitialized: true,
  resave: true
}));

//app.use(customdomain()); // IMPORTANT => After creating session!


// Require router, passing passport for authenticating pages
require('./server/shop-router')(app);

// Listen for requests
app.listen(app.get('port'));

console.log('Node is listening on port ' + app.get('port'));

// Handle all uncaught errors
process.on('uncaughtException', function(err) {
  console.log(err);
});
