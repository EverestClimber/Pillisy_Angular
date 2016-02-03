/** Pillsy API 
 *  @author  Chuks Onwuneme
 *  @version 1.0
 *  @package: Pillsy Enterprise Web App
 */
'use strict';

// set up ========================
var express          = require('express');
var compress         = require('compression'); 
var app              = express();   
var favicon          = require('serve-favicon');   
var cors             = require('cors');                            // create our app w/ express
var morgan           = require('morgan');             // log requests to the console (express4)
var bodyParser       = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride   = require('method-override'); // simulate DELETE and PUT (express4)
var configs          = require('./configs/configs');       // Get configuration file
var utils            = require('./configs/utils');
var socketController = require('./controllers/socket/socketController');
var http             = require('http'); 
var helmet           = require('helmet');                  // https://github.com/evilpacket/helmet
var path             = require('path');    
var winston          = require('winston');
var fallback         = require('express-history-api-fallback')
var logger           = new (winston.Logger)({
                        transports: [
                            new (winston.transports.Console)(),
                        ],
                        exitOnError: false
                    });  

// configuration =================
var root = __dirname + '/public';
app.use(express.static(root));
//app.use(fallback('index.html', { root: root }));
app.use(favicon(path.join(root, 'favicon.ico')));

//app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users

// log all requests to the console =======
app.use(morgan('dev', {
    stream: {
        write: function(str) {
            logger.info(str);
        }
    }
}));

// use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json({limit: '50mb'}));                      // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(methodOverride());

//use gzip for compression
app.use(compress());

// proxy ========================
app.enable('trust proxy');
app.set('trust proxy', 1) // trust first proxy 

// set JSON properties ==========
app.set('json spaces', 3);
app.set('json replacer', null);


// Security Settings ============
app.disable('x-powered-by');          // Don't advertise our server type
//app.use(csrf());                      // Prevent Cross-Site Request Forgery
app.use(helmet.xssFilter());          // sets the X-XSS-Protection header
app.use(helmet.frameguard('deny'));   // Prevent iframe clickjacking
app.use(helmet.hsts({
    maxAge: 10886400000,     // Must be at least 18 weeks to be approved by Google
    includeSubdomains: true, // Must be enabled to be approved by Google
    preload: true,
    force: true
}));

app.use(helmet.ieNoOpen());          // X-Download-Options for IE8+
app.use(helmet.noSniff());            // Sets X-Content-Type-Options to nosniff
app.use(helmet.noCache());
app.use(helmet.dnsPrefetchControl({ allow: false }));    //allow this on web apps because turning off prefetch hurts performance

var corsOptions = {
    origin:         '*',
    methods:        ['GET','PUT','POST','DELETE','OPTIONS'],
    allowedHeaders: ['Content-type','Expires','Last-Modified','Cache-Control','X-Access-Token','X-Key'],
    exposedHeaders: ['Set-Cookie','Origin','X-HTTP-Method-Override','Accept','x-xsrf-token','x-csrf-token','X-Requested-With']
};

app.all('/*', cors(corsOptions), function(req, res, next){
    console.log('app - This is CORS-enabled middle for all origins, method is: '+req.method);

    if (req.method == 'OPTIONS') {
        console.log('app - method was OPTIONS...');

        res.status(200).end();
    } 
    else {
        console.log('app - next middleware...');

        req.configs = configs;
        req.utils   = utils;
        next();
    }
});

// memdump trace ================
if ((configs.env == 'development') || (configs.env == 'development_local')){
    console.log('app - collect memdumps on dev environment...');

    var memwatch = require('memwatch-next');
    var heapdump = require('heapdump');

    memwatch.on('leak', function(info) {
        console.error('app - detected leak...'+info);

        var dateFormat = require('dateformat');
        var date_now   = dateFormat(new Date(),'yyyy-mm-dd_HH:MM:ss');
        var file_path  = __dirname  + '/../heapdumps/PillsyEnterpriseApp';
        var filename   = date_now +'_Pillsy_'+process.pid + '.heapsnapshot';
        var file       = file_path + filename;
        var diffFile   = file_path + "_"+date_now +'.txt';

        heapdump.writeSnapshot(file, function(err){
            if (err) console.error(err);
            else console.error('Wrote snapshot: ' + file);
        });
    });
}

// routes ========================
// Report CSP violations (*ABOVE* CSURF in the middleware stack)
// Browsers will post violations to this route
// https://mathiasbynens.be/notes/csp-reports
app.post('/csp', bodyParser.json(), function (req, res) {
    // TODO - requires production level logging
    if (req.body) {
        // Just send to debug to see if this is working
        debug('CSP Violation: ' + JSON.stringify(req.body));
    } 
    else {
        debug('CSP Violation: No data received!');
    }
    
    res.status(204).end();
});

//The list of routes for our application
app.use('/', require('./routes/index'));

// send to angular application ==================
app.get('*', function(req, res) {
    res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    console.log('app - no route found middlewares...create and route error');

    var err = new Error('Route not found');
    err.status = 404;
      
    next(err);
});

// error handlers
// development error handler will print stacktrace
// production error handler will not print stacktrace
app.use(function(err, req, res, next) {
    console.log("app - Server error is: "+JSON.stringify(err));

    if (!err.status){
        err.status = 500;
    }

    var data = {
        "status":  err.status,
        "msg":     err.message,
        "error":   err,
        "Server":  'X-Powered-By: Pillsy',
    };

    return req.utils.sendData(data,req,res); 
});

/**
* Create Express app, HTTP server and socket.io listener
*/
var server = app.listen(configs.port);

server.on('error', function(error){
    console.log('app - '+ new Date()+' - Express server running on process '+process.pid+' error: '+error);
});

server.on('listening', function(){
    console.log('app - '+ new Date()+' - Express server running on process '+process.pid+' is now listening on port ' +configs.port);
});

var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
    console.log('IO Client connected...');

    socketController(io, socket);
});

