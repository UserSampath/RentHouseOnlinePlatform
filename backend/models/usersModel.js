const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const { Role } = require("../utils/Constant");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  userRole: {
    type: String,
    enum: [Role.HouseOwner, Role.customer],
  },
});
userSchema.statics.signup = async function (
  fullName,
  email,
  password,
  contactNumber,
  userRole
) {
  if (!fullName || !email || !password || !userRole || !contactNumber) {
    throw Error("All fields must be provided");
  }
  if (!validator.isEmail(email)) {
    throw Error("Email not valid");
  }
  if (!validator.isStrongPassword(password)) {
    throw Error("Password not strong enough");
  }
  const fullNamecheck = await this.findOne({ fullName });

  if (fullNamecheck) {
    throw Error("fullName already in use");
  }
  const exists = await this.findOne({ email });

  if (exists) {
    throw Error("Email already in use");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const user = await this.create({
    fullName,
    email,
    password: hash,
    contactNumber,
    userRole,
  });

  return user;
};

userSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error("All fields must be filled");
  } else if (!password) {
    throw Error(" Password must be filled");
  } else if (!email) {
    throw Error("Email must be filled");
  }
  const user = await this.findOne({ email });
  if (!user) {
    throw Error("Incorrect email");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw Error("Incorrect password");
  }
  if (password && !validator.isLength(password, { min: 8 })) {
    res.status(400);
    throw new Error("Password must be at least 6 characters long");
  }

  return user;
};
module.exports = mongoose.model("User", userSchema);
