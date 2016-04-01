module.exports = function(req, res) {
    console.log("environmentController");

    var data = {
        env:       req.configs.env,
        apiHost:   req.configs.apiHost,
        awsBucket: req.configs.awsBucket,
    };

    console.log('Sending environment data...: '+JSON.stringify(data));
    return req.utils.sendData(data,req,res); 
}
