// models/BillResponse.js
const mongoose = require("mongoose");

const billResponseSchema = new mongoose.Schema(
  {
    bill: { type: mongoose.Schema.Types.ObjectId, ref: "Bill", required: true },

    sender: {
      type: String,
      enum: ["client", "anna"],
      required: true,
    },

    message: { type: String },

    amountAdjustment: {
      type: Number,
      default: 0 // Anna can offer discount / adjustment
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("BillResponse", billResponseSchema);
