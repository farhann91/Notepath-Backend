const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    index: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    },
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
  },
  role: {
    type: String,
    default: "basic",
    lowercase: true,
  },
  otp: {
    type: String,
  },
  active: {
    type: Boolean,
    default: false,
  },
  avatar: {
    type: Buffer,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

//Selecting what the user should expose everytime its sent to the user
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.tokens;
  delete userObject.password;
  delete userObject.avatar;
  return userObject;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
