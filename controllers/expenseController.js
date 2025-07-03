const Expense = require("../model/Expenses");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const User = require("../model/User");
const mongoose = require("mongoose");

// Helper to get start/end of month
function getMonthRange(date) {
  const d = new Date(date);
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

// Add a new expense
const addExpense = async (req, res) => {
  const { amount, category, date, paymentMethod, notes } = req.body;
  if (!amount || !category || !date || !paymentMethod) {
    throw new CustomError.BadRequestError("Please provide all required fields");
  }
  // Get user and their budget for this category
  const user = await User.findById(req.user.userId);
  const budget = user.categoryBudgets[category] || 0;
  // Calculate total spent in this category this month (including this new expense)
  const { start, end } = getMonthRange(date);
  const expenses = await Expense.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(user._id),
        category,
        date: { $gte: start, $lte: end },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const currentTotal = (expenses[0]?.total || 0) + Number(amount);
  console.log(
    "[DEBUG] Budget:",
    budget,
    "AggTotal:",
    expenses[0]?.total || 0,
    "CurrentTotal:",
    currentTotal
  );
  let alert = null;
  if (budget > 0) {
    if (currentTotal >= budget) {
      alert = `Alert: You have crossed 100% of your ${category} budget for this month.`;
    } else if (currentTotal >= 0.8 * budget) {
      alert = `Warning: You have crossed 80% of your ${category} budget for this month.`;
    }
  }
  const expense = await Expense.create({
    user: req.user.userId,
    amount,
    category,
    date,
    paymentMethod,
    notes,
  });
  res.status(StatusCodes.CREATED).json({ expense, alert });
};

// Edit an expense
const editExpense = async (req, res) => {
  const { id } = req.params;
  const { amount, category, date, paymentMethod, notes } = req.body;
  // Get user and their budget for this category
  const user = await User.findById(req.user.userId);
  const budget = user.categoryBudgets[category] || 0;
  // Calculate total spent in this category this month (excluding the old expense, including the new)
  const oldExpense = await Expense.findOne({ _id: id, user: req.user.userId });
  if (!oldExpense) {
    throw new CustomError.NotFoundError("Expense not found");
  }
  const { start, end } = getMonthRange(date);
  const expenses = await Expense.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(user._id),
        category,
        date: { $gte: start, $lte: end },
        _id: { $ne: oldExpense._id },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const currentTotal = (expenses[0]?.total || 0) + Number(amount);
  console.log(
    "[DEBUG] Budget:",
    budget,
    "AggTotal:",
    expenses[0]?.total || 0,
    "CurrentTotal:",
    currentTotal
  );
  let alert = null;
  if (budget > 0) {
    if (currentTotal >= budget) {
      alert = `Alert: You have crossed 100% of your ${category} budget for this month.`;
    } else if (currentTotal >= 0.8 * budget) {
      alert = `Warning: You have crossed 80% of your ${category} budget for this month.`;
    }
  }
  const expense = await Expense.findOneAndUpdate(
    { _id: id, user: req.user.userId },
    { amount, category, date, paymentMethod, notes },
    { new: true, runValidators: true }
  );
  res.status(StatusCodes.OK).json({ expense, alert });
};

// Delete an expense
const deleteExpense = async (req, res) => {
  const { id } = req.params;
  const expense = await Expense.findOneAndDelete({
    _id: id,
    user: req.user.userId,
  });
  if (!expense) {
    throw new CustomError.NotFoundError("Expense not found");
  }
  res.status(StatusCodes.OK).json({ msg: "Expense deleted" });
};

// Get (filter/search) expenses
const getExpenses = async (req, res) => {
  const { category, paymentMethod, startDate, endDate, search } = req.query;
  const queryObject = { user: req.user.userId };
  if (category) queryObject.category = category;
  if (paymentMethod) queryObject.paymentMethod = paymentMethod;
  if (startDate || endDate) {
    queryObject.date = {};
    if (startDate) queryObject.date.$gte = new Date(startDate);
    if (endDate) queryObject.date.$lte = new Date(endDate);
  }
  if (search) {
    queryObject.$or = [
      { notes: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
      { paymentMethod: { $regex: search, $options: "i" } },
    ];
  }
  const expenses = await Expense.find(queryObject).sort({ date: -1 });
  res.status(StatusCodes.OK).json({ expenses });
};

module.exports = {
  addExpense,
  editExpense,
  deleteExpense,
  getExpenses,
};
