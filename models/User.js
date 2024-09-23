const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  phone_number: { type: String, required: true },
  password: { type: String, required: true },
  profile_picture: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  total_earnings: { type: Number, default: 0 },
  bank_account_number: { type: String },
  bank_code: { type: String },
  my_tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],

  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },

  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
