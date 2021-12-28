const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config({ path: "./config/.env" });
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");
const todoRouter = require("./routers/todo");

// importing the database connection
require("./db/mongoose");

// Importing the user nmodel
const User = require("./models/user");

const app = express();
app.use(cors());
app.use(express.json());

//The public directory path
const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

// Setting the port
const port = process.env.PORT;

// """"""""""""""""""""""""""""""""""""""""""USERS ROUTES"""""""""""""""""""""""""""""""
app.use(userRouter);

// """"""""""""""""""""""""""""""""""""""""""TASKS ROUTES"""""""""""""""""""""""""""""""
app.use(taskRouter);
// """"""""""""""""""""""""""""""""""""""""""TODOS ROUTES"""""""""""""""""""""""""""""""
app.use(todoRouter);

app.listen(port, () => {
  console.log("server up and running on port", port);
});
