module.exports = function(req, res) {
    console.log("searchDrugs");

    var sanitize   = require('mongo-sanitize');
    var request    = require('request');
    var underscore = require('underscore');
    var apiHost    = req.configs.apiHost;
    var query      = sanitize(req.query.query);
	var drugs      = [];

    if ( Boolean(query) ){
		console.log('searchDrugs - query is not empty...');

		var url = apiHost + "/v1/n/ndcdrug?query="+query;
		console.log('searchDrugs - calling url: '+url);

		request(url, function (err, response, body) {
			if (err){
				console.log('searchDrugs - err while retrieving drugs: '+err.message);

				return req.utils.sendError(err,req,res); 
			}
          	else {
          		console.log('searchDrugs - successfully retrieved drugs');
                
                drugs = JSON.parse(body).data;
                if (drugs){
                	if (drugs.length > 0){

                		var output = underscore.uniq(drugs, function(x){
						    return (x.pillsyName && x.strengthNumber);
						});

						drugs = output;

						drugs.forEach(function(drug){
						    drug.chemicalName = drug.pillsyName.substring(drug.pillsyName.lastIndexOf("(")+1,drug.pillsyName.lastIndexOf(")"));
						    drug.pillsyName   = drug.pillsyName.replace(/\(.*\)/, '');
						    drug.description  = drug.strengthNumber + drug.strengthUnit + ' '+drug.dosageDisplay;

						    console.log('searchDrugs - drugs[i].chemicalName - '+drug.chemicalName);
						});
                	}
                }

                returnDrugData();
            }
        });
	}
	else{
		console.log('searchDrugs - query is empty...');

		var err = new Error('You did not enter a search term');
		err.status = 500;

		return req.utils.sendError(err,req,res); 
	}

	function returnDrugData(){
		console.log("returnDrugData");

		var data = {msg: 'success', data: drugs };
    	return req.utils.sendData(data,req,res); 
	}
}
