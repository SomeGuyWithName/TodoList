var express = require('express');
var router = express.Router();

module.exports = (mongoose) => {
  const ObjectId = mongoose.Types.ObjectId;
  const Todos = mongoose.model('todos', new mongoose.Schema({
    title: String,
    complete: Boolean,
    deadline: Date,
    executor: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
  }, { versionKey: false }))


/* GET todos. */
router.get('/todos', function(req, res, next) {
  res.render('todoList');
});

return router;

}