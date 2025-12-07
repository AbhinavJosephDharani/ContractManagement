// models/Bill.js
const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    amount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "paid", "disputed"],
      default: "pending",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bill", billSchema);
