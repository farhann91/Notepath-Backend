const express = require("express");
const User = require("../models/user");
const Task = require("../models/task");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");

// For the payment
const Mpesa = require("../Mpesa/Mpesa");
const request = require("request");

const sharp = require("sharp");
const multer = require("multer");

//Sending email with twilio @sendgridmail
const sgMail = require("@sendgrid/mail");
const { json } = require("express");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const router = new express.Router();

router.get("/", (req, res) => {
  res.send({ message: "we are home" });
});
router.get("/users", auth, async (req, res) => {
  // return res.send({ userDetails: req.role, id: req.userId });
  try {
    const users = await User.find();
    if (!users) {
      return res.status(400).send({ message: "No users available", users });
    }
    return res.status(200).send({ count: users.length, users });
  } catch (error) {
    return res
      .status(400)
      .send({ error_message: "Unabale to fetch users", error });
  }
});
router.post("/register", async (req, res) => {
  let { email, password, passwordAgain } = req.body;
  let hashed = await bcrypt.hash(password, 8);
  let otp = Math.floor(100000 + Math.random() * 900000);
  const user = new User({
    email,
    otp,
    password: hashed,
  });

  if (passwordAgain) {
    if (password !== passwordAgain) {
      return res.send({ error_message: "Passord do not match" });
    }
  }
  if (passwordAgain === "") {
    return res.send({ error_message: "Both password are required" });
  }

  // Error checking

  try {
    await user.save();

    //Send the OTP to the email Id provided
    const link = `http://localhost:3000/veryfyAccount/${email}`;
    const htmlElement = `<!DOCTYPE html><html><body"><div style=" width: 90%; height: auto; background: #FFFFFF; border: 0.5px solid gray; padding-top: 0;">
                  <h1 style="background: #000000; color: #FFFFFF; width: 100%; text-align: center; margin-top: 0"> Welcome to Notepath</h1>
                   <h1 style="background: #FFFFFF; width: 100%; text-align: center;"><img src="https://i.imgur.com/nT5lovf.png"  /></h1>
                   <h1 style="background: #FF7500; color: #FFFFFF; width: 100%; text-align: center;">Activate your account at Notepath</h1>
                   <p style="margin-left: 60px;"> <strong >Use the OTP below to gain access to the platform</strong></p> \n\n
                   <p style="margin-left: 60px;"> <strong >It will expire after <span style="color: blue;">24 Hours</span></strong></p> \n\n
                   <h2 style="color: red; margin-left: 60px;">${otp}</h2>
                   <p  style="margin-left: 60px;">Or click the link below and use the OTP above</p>
                   <h2 style="color: red; margin-left: 60px;"> ${link}</h2>
                   
                  </div></body></html>
    `;

    const msg = {
      to: user.email, // Change to your recipient
      from: "emzzingerry@gmail.com", // Change to your verified sender
      subject: "Verify Account",
      text: "Welcome to the service.\nVerify your account by clicking the link below\n\n",
      html: htmlElement,
    };
    await sgMail.send(msg);

    res.send({ user });
  } catch (error) {
    if (error.keyPattern) {
      return res.send({
        error_message: "Failed to save",
        error: "Email is already registered",
      });
    }
    if (error.errors.password) {
      return res.send({
        error_message: "Failed to save",
        error: "Password must be atleast 8 characters",
      });
    }
    res.send({
      error_message: "Failed to save",
      error,
    });
  }
});
//Verify account
router.post("/verifyAccount/:user", async (req, res) => {
  const { otp } = req.body;
  const { user } = req.params;

  // Get the user with the email
  const storedUser = await User.findOne({ email: user });
  if (!storedUser) {
    return res.send({ error_message: "User not available" });
  }
  // If no otp send from the user
  if (!otp) {
    return res.send({ error_message: "otp is not recongnised" });
  }
  // If the otp sent do not match the otp stored in the user
  if (otp !== storedUser.otp) {
    return res.send({ error_message: "otp is invalid" });
  }
  const _id = storedUser._id;

  // Find the user with the given email Id and update the active status to true
  const verifiedUser = await User.findByIdAndUpdate(
    _id,
    { active: true },
    { new: true }
  );

  // Once update return just the status to the user
  res.status(201).send({ verified: true });
});
router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //Using the schema builtin function to login the user
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("No such user");
    }

    // return res.send({ user });
    // Dehashing the password
    const response = await bcrypt.compare(password, user.password);
    if (!response) {
      throw new Error("Password missmatch");
    }

    //Taking the userId and attach it to the payload
    const userId = user._id;
    const role = user.role;

    const token = jwt.sign({ userId, role }, process.env.JWT_SECRET);

    // Check if the user is active
    if (!user.active) {
      return res.send({ error_message: "verify user", email: user.email });
    }

    // Checking if user has avatar or not
    let hasAvatar = false;
    if (user.avatar) {
      hasAvatar = true;
    }
    //Saving the token to the database
    user.tokens = user.tokens.concat({ token: token });
    user.save().then((user) => {
      return res.send({ user, role, token, hasAvatar });
    });
  } catch (error) {
    return res
      .status(400)
      .send({ error_message: "Wrong credentials, check and try again", error });
  }
});
router.post("/forgotPassword", async (req, res) => {
  const email = req.body.email;

  // Check email address availability in the database
  try {
    const user = await User.findOne({ email });
    const resetLink = `http://localhost:3000/resetpassword/?userId=${user._id}`;
    // return send({ user });
    if (!user) {
      return res.send({ error_message: "Sorry email does not exisit" });
    }
    res.send({
      message: "Thank you, you will recieve a link if the email exixts",
    });

    // Send the email

    const htmlElement = `<!DOCTYPE html><html><body"><div style=" width: 90%; height: auto; background: #FFFFFF; border: 0.5px solid gray; padding-top: 0;">
                  <h1 style="background: #000000; color: #FFFFFF; width: 100%; text-align: center; margin-top: 0">Notepath account recovery</h1>
                   <h1 style="background: #FFFFFF; width: 100%; text-align: center;"><img src="https://i.imgur.com/nT5lovf.png"  /></h1>
                   <h1 style="background: #FF7500; color: #FFFFFF; width: 100%; text-align: center;">Reset your password</h1>
                   <p  style="margin-left: 60px;">Click the link below or copy and paste it in a browser.</p>
                   <h2 style=" margin-left: 60px;">${resetLink}</h2>
                   
                  </div></body></html>`;

    const msg = {
      to: user.email, // Change to your recipient
      from: "emzzingerry@gmail.com", // Change to your verified sender
      subject: "Account recovery",
      text: "Welcome to the service.\nWe hope that you willl behave yourself\n\n",
      html: htmlElement,
    };
    await sgMail.send(msg);
  } catch (error) {
    res.send({ error_message: "Email address not registered", error });
  }
});
router.post("/resetPassword/", async (req, res) => {
  const userId = req.query.userId;
  const password = req.body.password;
  const password2 = req.body.passwordAgain;
  const hashed = await bcrypt.hash(password, 8);
  if (!userId) {
    return res.send({ error_message: "Sorry action not allowed" });
  }
  if (!password) {
    return res.send({ error_message: "Password cannot be empty" });
  }
  if (password !== password2) {
    return res.send({ error_message: "Password do not macth" });
  }
  if (password.length < 8) {
    return res.send({ error_message: "Password must be atleast 8 characters" });
  }

  const user = await User.findOneAndUpdate({ _id: userId, password: hashed });
  res.send({ message: "Password changed succsefully", user });
});
//Logout user
//Logout the user
router.post("/logout", auth, async (req, res) => {
  // return res.send({ currentToken, allUserTokens });
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.send({
      message: "logged out succesfully",
    });
  } catch (error) {
    res.send({ error });
  }
});
//Logout the user login instances
router.post("/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];

    await req.user.save();
    res.send({
      message: "logged out all instances succesfully",
      user: req.user,
    });
  } catch (error) {
    res.send({ error });
  }
});

// Get all the registered users in the database
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.send({ message: "Here is your data", users });
  } catch (error) {
    res.send({ error_message: "Could not fetch users", error });
  }
});

//Get a single user::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.get("/users/:userId", auth, (req, res) => {
  const _id = req.params.userId;
  User.findOne({ _id })
    .then((user) => {
      if (!user) {
        return res.send({ error: "No user found" });
      }
      res.send({ user });
    })
    .catch((error) => res.send({ error }));
});

//Deleting a user::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.delete("/users", auth, async (req, res) => {
  // const authorised = req.userId; //Self deleting
  const id = req.userId;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.send({ error: "No user found" });
    }
    //If the user exists, then go find all the attences associated with them and delete them too
    await Task.deleteMany({ owner: id });
    res.send({ status: "User and their tasks deleted", user });
  } catch (error) {
    res.send({ error });
  }
});

//Deleting all the users:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
router.delete("/users", auth, async (req, res) => {
  try {
    await User.deleteMany({}).then((users) => {
      res.send({ status: "All users have been succesully deleted", users });
    });
  } catch (error) {
    res.send({ error });
  }
});

// Simulate payment
router.post("/simulate", (req, res) => {
  const phone = req.body.phone;
  const amount = req.body.amount;

  // return res.send({ phone });
  const consumer_key = process.env.CONSUMER_KEY;
  const consumer_secret = process.env.CONSUMER_SECRET;
  const mpesa = new Mpesa(consumer_key, consumer_secret);

  mpesa
    .access_token()
    .then(function (response) {
      const url =
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
      const auth = "Bearer " + response.data.access_token;

      const timestamp = "00000000000000";
      const BusinessShortCode = 174379;
      const passKey =
        "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
      const password = new Buffer.from(
        `${BusinessShortCode}${passKey}${timestamp}`
      ).toString("base64");
      //The request
      request(
        {
          method: "POST",
          url: url,
          headers: {
            Authorization: auth,
          },
          json: {
            BusinessShortCode: "174379",
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: amount,
            PartyA: phone,
            PartyB: "174379",
            PhoneNumber: phone,
            CallBackURL: "https://emzzin-mapesa.herokuapp.com/stk_callback",
            AccountReference: "Notepath Subscription",
            TransactionDesc: "Subscription for Notepath cloud services",
          },
        },
        function (error, response, body) {
          if (error) {
            return res.send({
              error,
              timestamp,
              error_message: "error.errorMessage",
            });
          }
          res.send({ body, timestamp });
        }
      );
    })
    .catch(function (error) {
      res.send({ error });
    });
});

// Creating support for uploading profile image
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image"));
    }
    cb(undefined, true);
  },
});

// Creating an upload
router.post(
  "/users/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 150, height: 150 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send({ message: "image saved" });
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

// Deleting profile image from the database
router.delete("/users/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

// Serve the profile image
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (error) {
    res.status(400).send();
  }
});

module.exports = router;
