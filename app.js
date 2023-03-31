const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const app = express();

//Setting ejs engine
app.set("view engine", "ejs");

//middleware
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//connecting mongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/login")
  .then(() => console.log("Mongo connected"));

//Creating Schema
const userSchema = new mongoose.Schema({
  name: String,
  password: String,
});

//Creating Model
const userModel = mongoose.model("User", userSchema);

//main

//authentication function
const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  console.log(token);
  if (token) {
    const decoded = jwt.verify(token, "ksdgfsdhgfiuy");
    req.user = await userModel.findById(decoded._id);
    next();
  } else {
    res.render("login");
  }
};

// Home route get function
app.get("/", isAuthenticated, (req, res) => {
  res.render("logout", { name: req.user.name });
});

// login form post function
app.post("/login", async (req, res) => {
  const { name, password } = req.body;
  let user = await userModel.findOne({ name });
  if (!user) {
    return res.redirect("/register");
  }
  user = await userModel.create({ name, password });
  const token = jwt.sign({ _id: user._id }, "ksdgfsdhgfiuy");
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});

// register route get function
app.get("/register", (req, res) => {
  res.render("register");
});

// register route post function
app.post("/register", async (req, res) => {
  const { name, password } = req.body;
  let user = await userModel.findOne({ name });
  if (user) {
    return res.redirect("/logout");
  }
  user = await userModel.create({ name, password });
  const token = jwt.sign({ _id: user._id }, "ksdgfsdhgfiuy");
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});


// logout get function
app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("Server started at port 3000");
});
