const express = require("express");
const Todo = require("../models/todo");
const auth = require("../middlewares/auth");

const router = express.Router();

// Creating a todo
router.post("/todos", auth, async (req, res) => {
  const newtask = req.body.task;

  try {
    const task = new Todo({ task: newtask, owner: req.userId });
    await task.save();
    return res.send({ task });
  } catch (error) {
    res.send({ error_message: "Unable to create task", error });
  }
});

// Fetching todos
router.get("/todos", auth, async (req, res) => {
  try {
    const todos = await Todo.find({ owner: req.userId });
    return res.status(200).send({ message: "Fetched", todos });
  } catch (error) {
    return res
      .status(400)
      .send({ error_message: "Unabale to fetch todos", error });
  }
});

//Fetching a single todo
router.get("/todos/:id", auth, async (req, res) => {
  const _id = req.params.id;

  // Find that single Id in the database
  const task = await Todo.findOne({ _id });
  if (!task) {
    return res.status(301).send({ error_message: "Task not found" });
  }
  res.status(200).send({ task });
});

// Delete todos
router.delete("/todos/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const todo = await Todo.findByIdAndDelete({ _id });
    if (!todo) {
      return res.status(200).send({ error_message: "Todo not found" });
    }
    return res.status(200).send({ message: "Todo deleted", todo });
  } catch (error) {
    return res
      .status(400)
      .send({ error_message: "Unabale to Delete todos", error });
  }
});

// Updating a todo
router.patch("/todos/:id", auth, async (req, res) => {
  const task = req.body.task;
  const _id = req.params.id;

  try {
    const todo = await Todo.findByIdAndUpdate(_id, { task }, { new: true });
    if (!todo) {
      return res.status(400).send({ error_message: "unable to find the todo" });
    }
    return res.status(201).send({ message: "todo updated succesfully", todo });
  } catch (error) {
    return res
      .status(400)
      .send({ error_message: "unable to update the todo", error });
  }
});

module.exports = router;
