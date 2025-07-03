const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const UserScheema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Provide name"],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please Provide email"],
    validate: {
      validator: validator.isEmail,
      message: "Please provide the valid email address",
    },
  },
  password: {
    type: String,
    required: [true, "Please Provide password"],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  categoryBudgets: {
    Food: { type: Number, default: 0 },
    Rent: { type: Number, default: 0 },
    Shopping: { type: Number, default: 0 },
    Entertainment: { type: Number, default: 0 },
    Transport: { type: Number, default: 0 },
    Utilities: { type: Number, default: 0 },
    Health: { type: Number, default: 0 },
    Other: { type: Number, default: 0 },
  },
});

UserScheema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserScheema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model("user", UserScheema);
