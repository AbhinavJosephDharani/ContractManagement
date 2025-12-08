const serverless = require("serverless-http");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("../config/db");
const authRoutes = require("../routes/auth");
const requestRoutes = require("../routes/requests");

// Connect to DB (works in Vercel too)
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Health for Vercel
app.get("/health", (req, res) => {
  res.json({ status: "ok", storage: true });
});

// REMOVE /api prefix here (Vercel adds /api for you)
app.use("/auth", authRoutes);
app.use("/requests", requestRoutes);

module.exports = app;
module.exports.handler = serverless(app);
