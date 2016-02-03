
var config     = {};
var env        = process.env.NODE_ENV;
var diffConfig = {};
var pkg        = require('../package.json');

// From package.json
config.name        = pkg.name;
config.version     = pkg.version;
config.description = pkg.description;
config.company     = pkg.company;
config.author      = pkg.author;
config.keywords    = pkg.keywords;
config.engine      = pkg.engines.node || pkg.engines.iojs;

/**
* Application Configuration
*/
config.name = 'Pillsy Enterprise Web Application';
config.env  = process.env.NODE_ENV;

var apiHost;

switch(config.env){
	case 'development_local':
	  	apiHost = 'http://localhost:3000';
	   	break;
	
	case 'development':
	   	apiHost = 'https://dev.pillsy.com';
	   	break;

	case 'staging':
	   	apiHost = 'https://staging.pillsy.com';
	   	break;

	case 'production':
	   	apiHost = 'https://api.pillsy.com';
	   	break;

	default:
	   	apiHost = 'http://localhost:3000';
}

/**
* Server Configuration
*/
config.apiHost = apiHost;
config.port    = process.env.PORT || 3200;

/**
 * Session Configuration
 */
var hour = 3600000;
var day  = (hour * 24);
var week = (day * 7);

// Session
config.session                   = {};
config.session.secret            = process.env.SESSION_SECRET || 'my big secret';
config.session.name              = 'sid';  // Generic - don't leak information
config.session.proxy             = false;  // Trust the reverse proxy for HTTPS/SSL
config.session.resave            = false;  // Forces session to be saved even when unmodified
config.session.saveUninitialized = false; // forces a session that is "uninitialized" to be saved to the store
config.session.cookie            = {};
config.session.cookie.httpOnly   = true;   // Reduce XSS attack vector
config.session.cookie.secure     = false;  // Cookies via HTTPS/SSL
config.session.cookie.maxAge     = process.env.SESSION_MAX_AGE || week;

module.exports = config;
