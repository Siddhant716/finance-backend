const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
  getCategoryBudgets,
  updateCategoryBudgets,
  getAllUsersWithExpenses,
  getMyExpensesDetails,
} = require("../controllers/userController");

router
  .route("/")
  .get(authenticateUser, authorizePermissions("admin"), getAllUsers);

router.route("/showMe").get(authenticateUser, showCurrentUser);
router.route("/updateUser").patch(authenticateUser, updateUser);
router.route("/updateUserPassword").patch(authenticateUser, updateUserPassword);

router
  .route("/all-with-expenses")
  .get(
    authenticateUser,
    authorizePermissions("admin"),
    getAllUsersWithExpenses
  );

router
  .route("/category-budgets")
  .get(authenticateUser, getCategoryBudgets)
  .patch(authenticateUser, updateCategoryBudgets);

router
  .route("/my-expenses-details")
  .get(authenticateUser, getMyExpensesDetails);

router.route("/:id").get(authenticateUser, getSingleUser);

module.exports = router;
