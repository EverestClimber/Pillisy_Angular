/*
 * Serve JSON to our AngularJS client
 */

exports.name = function (req, res) {
	console.log('I got called bob');

	res.json({
	    name: 'Bob'
	});
};