const mongoose = require("mongoose");

const opt = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
};
mongoose.connect(process.env.MONGODB_URL, opt, (err) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  console.log("Connection  to the database established succesfully");
});

module.exports = mongoose;
