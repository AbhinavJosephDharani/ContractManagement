// models/Quote.js
const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceRequest", required: true },
    offeredPrice: { type: Number, required: true },   // Anna’s price
    timeWindow: { type: String, required: true },     // e.g. "2025-12-10 10am–1pm"
    noteFromAnna: String,
    noteFromClient: String, // last client counter note ("too expensive", etc.)
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quote", quoteSchema);
