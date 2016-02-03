'use strict';

var winston = require('winston');
var logger  = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
    ],
    exitOnError: false
});

exports.sendData = function(data, req, res){
    logger.info("utils: sendData");

    var endTimeRaw = new Date();
    logger.info('utils: sendData - '+endTimeRaw+ " - response to client from IP: "+req.ip+" running on pid "+process.pid);

    var status;
    if (data.status){
        status = data.status;
    }
    else{
        status = 200;
    }

    res.status(status).json(data); 
}

exports.sendError = function(err, req, res){
    logger.info("utils: sendError");

    var endTimeRaw = new Date();
    logger.info('utils: sendData - '+endTimeRaw+ " - response to client from IP: "+req.ip+" running on pid "+process.pid);

    var data = {
        "status":  err.status,
        "msg":     err.message,
        "error":   err,
        "Server":  'X-Powered-By: Pillsy',
    };

    res.status(err.status).json(data); 
}
