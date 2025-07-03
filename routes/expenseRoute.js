const User = require("../model/Expenses");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");
const { authenticateUser } = require("../middleware/authentication");

// Define routes here (to be filled in next)

router
  .route("/")
  .post(authenticateUser, expenseController.addExpense)
  .get(authenticateUser, expenseController.getExpenses);

router
  .route("/:id")
  .patch(authenticateUser, expenseController.editExpense)
  .delete(authenticateUser, expenseController.deleteExpense);

module.exports = router;
