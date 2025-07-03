const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Food",
        "Rent",
        "Shopping",
        "Entertainment",
        "Transport",
        "Utilities",
        "Health",
        "Other",
      ],
    },
    date: {
      type: Date,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: [
        "Cash",
        "UPI",
        "Credit Card",
        "Debit Card",
        "Net Banking",
        "Other",
      ],
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Expense", expenseSchema);
