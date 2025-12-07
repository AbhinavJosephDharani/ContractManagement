// routes/quotes.js
const express = require("express");
const router = express.Router();
const Quote = require("../models/Quote");
const ServiceRequest = require("../models/ServiceRequest");

// POST /api/quotes/:requestId  (Anna creates quote)
router.post("/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const { offeredPrice, timeWindow, noteFromAnna } = req.body;

    const request = await ServiceRequest.findById(requestId);
    if (!request) return res.status(404).json({ error: "Request not found" });

    const quote = await Quote.create({
      request: requestId,
      offeredPrice,
      timeWindow,
      noteFromAnna,
    });

    request.status = "quoted";
    await request.save();

    res.status(201).json(quote);
  } catch (err) {
    res.status(500).json({ error: "Failed to create quote" });
  }
});

// POST /api/quotes/:quoteId/client-response
// body: { action: "accept" | "reject" | "counter", noteFromClient }
router.post("/:quoteId/client-response", async (req, res) => {
  try {
    const { quoteId } = req.params;
    const { action, noteFromClient } = req.body;

    const quote = await Quote.findById(quoteId).populate("request");
    if (!quote) return res.status(404).json({ error: "Quote not found" });

    quote.noteFromClient = noteFromClient || "";

    if (action === "accept") {
      quote.status = "accepted";
      quote.request.status = "accepted";
      await quote.request.save();

      // create order here or in /orders route – your choice
    } else if (action === "reject") {
      quote.status = "rejected";
      quote.request.status = "rejected";
      await quote.request.save();
    } else if (action === "counter") {
      // still pending but we log the note
      quote.status = "pending";
    }

    await quote.save();
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: "Failed to update quote" });
  }
});

module.exports = router;
