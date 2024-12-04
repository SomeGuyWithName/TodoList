var express = require('express');
var router = express.Router();

module.exports = (mongoose) => {
  const ObjectId = mongoose.Types.ObjectId;
  const User = mongoose.model(
    'todos',
    new mongoose.Schema(
      {
        title: { type: String, required: true },
        complete: { type: Boolean, default: false },
        deadline: { type: Date },
        executor: { type: ObjectId, ref: 'users' },
      },
      { versionKey: false }
    )
  );

router.get('/', async function (req, res) {
  const {
    page = 1,
    limit = 10,
    title = "",
    complete = "false",
    startDeadline = "",
    endDateDeadline = "",
    sortBy = '_id',
    sortMode = 'desc',
    executor = "",
  } = req.query;

  try {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const filter = {
      ...(title ? { title: { $regex: title, $options: 'i' } } : {}),
      ...(complete ? { complete: complete === 'true' } : {}),
      ...(executor ? { executor: executor } : {}),
      ...(startDeadline && endDateDeadline
        ? { deadline: { $gte: new Date(startDeadline), $lte: new Date(endDateDeadline) } }
        : {}),
    };

    const sortOrder = sortMode === 'asc' ? 1 : -1;
    const total = await User.countDocuments(filter);
    const pages = Math.ceil(total / parseInt(limit));
    const rows = await User.find(filter)
      .collation({ locale: 'en', strength: 1 })
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(offset);

    res.status(200).json({
      data: rows,
      total,
      pages,
      page: parseInt(page),
      limit: parseInt(limit),
      offset,
    });
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }

  router.get('/:id', async function (req, res) {
    const { id } = req.params;
    try {
      const todo = await User.findById(id);
      if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
      }
      res.status(200).json(todo);
    } catch (error) {
      console.error('Error fetching todo:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.post('/', async function (req, res) {
    const { title, complete, deadline, executor } = req.body;
    const todo = new User({ title, complete, deadline, executor });
    try {
      await todo.save();
      res.status(201).json({ message: 'Todo created successfully' });
    } catch (error) {
      console.error('Error creating todo:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.update('/:id', async function (req, res) {
    const { id } = req.params;
    const { title, complete, deadline, executor } = req.body;
    try {
      const todo = await User.findById(id);
      if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
      }
      todo.title = title;
      todo.complete = complete;
      todo.deadline = deadline;
      todo.executor = executor;
      await todo.save();
      res.status(200).json({ message: 'Todo updated successfully' });
    } catch (error) {
      console.error('Error updating todo:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.delete('/:id', async function (req, res) {
    const { id } = req.params;
    try {
      const todo = await User.findByIdAndDelete(id);
      if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
      }
      res.status(200).json({ message: 'Todo deleted successfully' });
    } catch (error) {
      console.error('Error deleting todo:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
});


return router;
}