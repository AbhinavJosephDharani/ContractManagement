// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceRequest", required: true },
    quote: { type: mongoose.Schema.Types.ObjectId, ref: "Quote", required: true },

    status: {
      type: String,
      enum: ["open", "in-progress", "completed", "cancelled"],
      default: "open",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
