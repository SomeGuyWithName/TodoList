var express = require('express');
var router = express.Router();
const path = require('path');

// module.exports = function (db) {
  /* GET users . */
  router.get('/', function(req, res, next) {
    
    res.render('list');
  });

module.exports = router;



