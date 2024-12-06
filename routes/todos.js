var express = require("express");
var router = express.Router();

module.exports = (mongoose) => {
  const ObjectId = mongoose.Types.ObjectId;
  const Todo = mongoose.model(
    "todos",
    new mongoose.Schema(
      { title: String, complete: Boolean, deadline: Date, executor: ObjectId },
      { versionKey: false }
    )
  );

  // ROUTER TODOS
  router.get("/", async (req, res) => {
    const {
      page = 1,
      limit = 10,
      title = "",
      complete = "false",
      startDeadline = "",
      endDateDeadline = "",
      sortBy = "_id",
      sortMode = "desc",
      executor = "",
    } = req.query;
    try {
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const filter = {
        ...(title ? { title: { $regex: title, $options: "i" } } : {}),
        ...(complete ? { complete: complete === "true" } : {}),
        ...(executor ? { executor: executor } : {}),
        ...(startDeadline && endDateDeadline
          ? {
              deadline: {
                $gte: new Date(startDeadline),
                $lte: new Date(endDateDeadline),
              },
            }
          : {}),
      };

      const sortOrder = sortMode === "asc" ? 1 : -1;
      const total = await Todo.countDocuments(filter);
      const pages = Math.ceil(total / parseInt(limit));
      const rows = await Todo.find(filter)
        .collation({ locale: "en", strength: 1 })
        .sort({ [sortBy]: sortOrder })
        .limit(parseInt(limit))
        .skip(offset);

      res.status(200).json({
        data: rows,
        total,
        pages: pages,
        page: parseInt(page),
        limit: parseInt(limit),
      });
    } catch (error) {
      console.error("Error fetching todos:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }

    const todosValidation = (req, res, next) => {
      const { title, complete, deadline, executor } = req.body;
      if (!title || !complete || !deadline || !executor) {
        return res
          .status(400)
          .json({
            message: "Title, complete, deadline and executor are required",
          });
      }
      if (
        typeof title !== "string" ||
        typeof complete !== "boolean" ||
        !deadline ||
        typeof executor !== "string"
      ) {
        return res
          .status(400)
          .json({
            message: "Title, complete, deadline and executor must be strings",
          });
      }
      if (
        title.trim() === "" ||
        complete === "" ||
        deadline.trim() === "" ||
        executor.trim() === ""
      ) {
        return res
          .status(400)
          .json({
            message: "Title, complete, deadline and executor cannot be empty",
          });
      }
      next();
    };

    // GET BY ID
    router.get("/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const result = await Todo.findOne({ _id: new ObjectId(id) });
        res.status(200).json(result);
      } catch (error) {
        console.error("Error fetching todo:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    // POST
    router.post("/", async (req, res) => {
      try {
        const { title, executor } = req.body;
        const result = await Todo.create({
          title,
          complete: false,
          executor: new ObjectId(executor),
        });
        res.status(201).json({_id: result._id, title: result.title, complete: result.complete, deadline: result.deadline, executor: result.executor});
      } catch (error) {
        console.error("Error creating todo:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    // PUT
    router.put("/:id", todosValidation, async (req, res) => {
      const { id } = req.params;
      const { title, complete, deadline, executor } = req.body;
      try {
        const todo = await Todo.findById(id);
        if (!todo) {
          return res.status(404).json({ message: "Todo not found" });
        }
        todo.title = title;
        todo.complete = complete;
        todo.deadline = deadline;
        todo.executor = executor;
        await todo.save();
        res.status(200).json({ message: "Todo updated successfully" });
      } catch (error) {
        console.error("Error updating todo:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    // DELETE
    router.delete("/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const result = await Todo.findOne({ _id: new ObjectId(id) });
        await Todo.deleteOne({ _id: new ObjectId(id) });
        if (!result) {
          return res.status(404).json({ message: "Todo not found" });
        }
        res.status(200).json({ message: "Todo deleted successfully" });
      } catch (error) {
        console.error("Error deleting todo:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });
  });

  return router;
};
