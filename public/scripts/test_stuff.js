var creds = {
	firstname: 'Otto',
	lastname:  'Sipe',
	email:     'ottosipe@gmail.com',
	password:  'otto'
};

creds = JSON.stringify(creds);
creds = new Buffer(creds).toString('base64');

Log.i('createTester - creds: '+creds);