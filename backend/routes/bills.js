// routes/bills.js
const express = require("express");
const router = express.Router();
const Bill = require("../models/Bill");
const BillResponse = require("../models/BillResponse");
const Order = require("../models/Order");

// 1️⃣ Anna creates bill for an order
// POST /api/bills/:orderId
router.post("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { amount } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const bill = await Bill.create({
      order: orderId,
      amount,
      status: "pending",
    });

    res.status(201).json(bill);
  } catch (err) {
    res.status(500).json({ error: "Failed to create bill" });
  }
});

// 2️⃣ Client or Anna responds to bill
// POST /api/bills/respond/:billId
router.post("/respond/:billId", async (req, res) => {
  try {
    const { billId } = req.params;
    const { sender, message, amountAdjustment } = req.body;

    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ error: "Bill not found" });

    // Store response
    const response = await BillResponse.create({
      bill: billId,
      sender,
      message,
      amountAdjustment: amountAdjustment || 0,
    });

    // If Anna adjusts the bill → update bill amount
    if (sender === "anna" && amountAdjustment) {
      bill.amount += amountAdjustment; // can be + or -
      bill.status = "pending";
      await bill.save();
    }

    // If client disputes
    if (sender === "client" && message) {
      bill.status = "disputed";
      await bill.save();
    }

    // If client pays
    if (sender === "client" && message === "paid") {
      bill.status = "paid";
      await bill.save();
    }

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: "Failed to submit bill response" });
  }
});

module.exports = router;
