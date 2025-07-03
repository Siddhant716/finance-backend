const User = require("../model/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require("../utils");
const Expense = require("../model/Expenses");

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  console.log(req.user);
  const user = await User.findOne({ _id: req.params.id }).select("-password");
  if (!user) {
    throw new CustomError.NotFoundError(
      `No user found with id ${req.params.id}`
    );
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new CustomError.BadRequestError("Please provide all required fields");
  }
  const user = await User.findOneAndUpdate(
    { _id: req.user.userId },
    { email, name },
    { new: true, runValidators: true }
  );
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError(
      "Please provide the old password and the new password"
    );
  }
  const user = await User.findOne({ _id: req.user.userId });
  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }
  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Succcess! Password Updated" });
};

// Get category budgets for the authenticated user
const getCategoryBudgets = async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.status(200).json({ categoryBudgets: user.categoryBudgets });
};

// Update category budgets for the authenticated user
const updateCategoryBudgets = async (req, res) => {
  const { categoryBudgets } = req.body;
  if (!categoryBudgets || typeof categoryBudgets !== "object") {
    return res.status(400).json({ msg: "Invalid categoryBudgets payload" });
  }
  const user = await User.findById(req.user.userId);
  Object.keys(categoryBudgets).forEach((cat) => {
    if (user.categoryBudgets.hasOwnProperty(cat)) {
      user.categoryBudgets[cat] = categoryBudgets[cat];
    }
  });
  await user.save();
  res.status(200).json({ categoryBudgets: user.categoryBudgets });
};

// Get all users with their details, all expenses, and total expenses
const getAllUsersWithExpenses = async (req, res) => {
  const users = await User.find({});
  const results = [];
  for (const user of users) {
    const expenses = await Expense.find({ user: user._id });
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    results.push({
      user,
      expenses,
      totalExpenses,
    });
  }
  res.status(200).json({ users: results });
};

// Get the authenticated user's details, all expenses, and total expenses
const getMyExpensesDetails = async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }
  const expenses = await Expense.find({ user: user._id });
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  res.status(200).json({ user, expenses, totalExpenses });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
  getCategoryBudgets,
  updateCategoryBudgets,
  getAllUsersWithExpenses,
  getMyExpensesDetails,
};
