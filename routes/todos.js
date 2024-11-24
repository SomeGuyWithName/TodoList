var express = require('express');
var { ObjectId } = require('mongodb');
var router = express.Router();

/* GET todos. */
router.get('/todos', function(req, res, next) {
  res.render('todoList');
});

module.exports = router;
