var express = require("express");
var router = express.Router();

module.exports = (mongoose) => {
  const ObjectId = mongoose.Types.ObjectId;
  const Todo = mongoose.model(
    "todos",
    new mongoose.Schema(
      {
        title: String,
        complete: Boolean,
        deadline: {
          type: Date,
          default: () => {
            const tommorrow = new Date();
            tommorrow.setDate(tommorrow.getDate() + 1);
            return tommorrow;
          },
        },
        executor: ObjectId,
      },
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
      const query = {};
      if (Array.isArray(title)) {
        query.title = { $in: title.map((t) => new RegExp(t, "i")) };
      } else if (typeof title === "string" && title.trim() !== "") {
        query.title = new RegExp(title, "i");
      }
      if (complete !== "") query.complete = complete === "true";
      if (executor) query.executor = executor;
      if (startDeadline || endDateDeadline) {
        query.deadline = {};
        if (startDeadline && endDateDeadline) {
          query.deadline = {
            $gte: new Date(startDeadline).toISOString(),
            $lte: new Date(endDateDeadline).toISOString(),
          };
          query.deadline = {
            $gte: new Date(startDeadline),
            $lte: new Date(endDateDeadline),
          };
        } else if (startDeadline) {
          query.deadline = { $gte: new Date(startDeadline).toISOString() };
          query.deadline = { $gte: new Date(startDeadline) };
        } else if (endDateDeadline) {
          query.deadline = { $lte: new Date(endDateDeadline).toISOString() };
          query.deadline = { $lte: new Date(endDateDeadline) };
        }
      }
      if (executor) query.executor = executor;

      const sortOrder = sortMode === "asc" ? 1 : -1;
      const total = await Todo.countDocuments(query);
      const pages = Math.ceil(total / parseInt(limit));
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const rows = await Todo.find(query)
        .collation({ locale: "en", strength: 1 })
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
      console.error("Error fetching todos:", error);
      res.status(500).json("Internal Server Error");
    }
    // });

    //   const sortOrder = sortMode === "asc" ? 1 : -1;
    //   const total = await Todo.countDocuments(filter);
    //   const pages = Math.ceil(total / parseInt(limit));
    //   const offset = (parseInt(page) - 1) * parseInt(limit);
    //   const rows = await Todo.find(filter)
    //     .collation({ locale: "en", strength: 1 })
    //     .sort({ [sortBy]: sortOrder })
    //     .limit(parseInt(limit))
    //     .skip(offset);

    //   res.status(200).json({
    //     data: rows,
    //     total,
    //     pages: pages,
    //     page: parseInt(page),
    //     limit: parseInt(limit),
    //   });
    // } catch (error) {
    //   console.error("Error fetching todos:", error);
    //   res.status(500).json({ message: "Internal Server Error" });
    // }

    // GET BY ID
    router.get("/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const result = await Todo.find({ executor: id });
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
        res.status(201).json({
          _id: result._id,
          title: result.title,
          complete: result.complete,
          deadline: result.deadline,
          executor: result.executor,
        });
      } catch (error) {
        console.error("Error creating todo:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    // DELETE
    router.delete("/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const result = await Todo.deleteOne({ _id: id });
        res.status(201).json(result);
      } catch (error) {
        console.error("Error updating todo:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    // UPDATE
    router.put("/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const { title, complete, deadline } = req.body;
        const result = await Todo.findByIdAndUpdate(
          id,
          { title, complete, deadline },
          { new: true }
        );
        res.status(201).json(result);
      } catch (error) {
        console.error("Error updating todo:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });
  });

  return router;
};
