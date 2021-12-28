const mongoose = require("mongoose");
require("../db/mongoose");
const todoSchema = new mongoose.Schema({
  task: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
});

const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;
