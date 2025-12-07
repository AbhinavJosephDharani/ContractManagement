// routes/orders.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Quote = require("../models/Quote");
const ServiceRequest = require("../models/ServiceRequest");

// POST /api/orders/create/:quoteId
router.post("/create/:quoteId", async (req, res) => {
  try {
    const { quoteId } = req.params;

    const quote = await Quote.findById(quoteId).populate("request");
    if (!quote) return res.status(404).json({ error: "Quote not found" });

    if (quote.status !== "accepted")
      return res.status(400).json({ error: "Quote not accepted yet" });

    // Create order
    const order = await Order.create({
      request: quote.request._id,
      quote: quote._id,
      status: "open",
    });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

module.exports = router;
