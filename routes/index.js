var express = require('express');
var path = require('path');
var router = express.Router();
var viewBasePath = path.join(path.resolve(__dirname, '..'), 'public/html');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(viewBasePath + '/index.html');
});

module.exports = router;
