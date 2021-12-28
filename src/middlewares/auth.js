const User = require("../models/user");
const jwt = require("jsonwebtoken");
const auth = async (req, res, next) => {
  try {
    //Checking if there is token in the header
    const payload = req.headers.authorization;
    const token = payload.replace("Bearer ", "");

    //Getting the payload part from the token
    const userData = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: userData.userId,
      "tokens.token": token,
    });
    if (!user) {
      throw new Error();
    }
    req.user = user;

    req.userId = user._id;
    req.role = user.role;
    req.token = token;
    req.tokens = user.tokens;
  } catch (error) {
    return res.send({ error: "Not authorised" });
  }
  next();
};
module.exports = auth;
