const express = require("express");
const Task = require("../models/task");
const mongoose = require("mongoose");
const auth = require("../middlewares/auth");

const router = new express.Router();

router.post("/tasks", auth, async (req, res) => {
  const newtask = req.body.task;
  const status = req.body.status;

  try {
    const task = new Task({ task: newtask, owner: req.userId, status });
    await task.save();
    return res.send({ message: "Task created succesfully", task });
  } catch (error) {
    res.send({ error_message: "Unable to create task", error });
  }
});

// Reading all the tasks for given user
router.get("/tasks", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ owner: req.userId });
    res.status(200).send({ status: "ok", count: tasks.length, tasks });
  } catch (error) {
    res
      .status(400)
      .send({ error_message: "Could not fetch tasks at the moment" });
  }
});

// Editing a task
router.patch("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  const task = req.body.task;

  // return res.send({ _id, task });

  try {
    const upDatedtask = await Task.findByIdAndUpdate(_id, { task });
    if (!upDatedtask) {
      return res
        .status(400)
        .send({ error_message: "Cound not find the given task" });
    }
    res
      .status(301)
      .send({ status: "ok", message: "Task succesfully updated", upDatedtask });
  } catch (error) {
    return res
      .status(400)
      .send({ error_message: "Could not update given task", error });
  }
});
// Deleting a task
router.delete("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;

  // return res.send({ _id, task });

  try {
    const task = await Task.findByIdAndDelete(_id);
    if (!task) {
      return res
        .status(400)
        .send({ error_message: "Cound not find the given task" });
    }
    res
      .status(301)
      .send({ status: "ok", message: "Task succesfully Deleted", task });
  } catch (error) {
    return res
      .status(400)
      .send({ error_message: "Could not update given task", error });
  }
});
// Deleting all tasks for a user
router.delete("/tasks", auth, async (req, res) => {
  try {
    const tasks = await Task.deleteMany({ owner: req.userId });
    if (!tasks) {
      return res
        .status(400)
        .send({ error_message: "Cound not find the user with that given Id" });
    }
    res
      .status(301)
      .send({ status: "ok", message: "Tasks succesfully Deleted", tasks });
  } catch (error) {
    return res
      .status(400)
      .send({ error_message: "Could not delete the tasks", error });
  }
});

module.exports = router;
