var express = require('express');
var router = express.Router();

router.get('/v1/n/environment', require('./../controllers/environment/getEnvironmentVars'));
router.get('/v1/n/ndcdrug',     require('./../controllers/drugs/searchDrugs'));

module.exports = router;