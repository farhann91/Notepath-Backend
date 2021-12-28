const mongoose = require("mongoose");

const time = new Date().toLocaleTimeString("en-US", {
  hour: "numeric",
  minute: "numeric",
  hour12: true,
});
const NewDate = new Date().toISOString().substr(0, 19).split("T")[0];
const taskSchema = new mongoose.Schema({
  task: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    default: NewDate,
  },
  time: {
    type: String,
    default: time,
  },
  owner: {
    type: String,
    required: true,
  },
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
