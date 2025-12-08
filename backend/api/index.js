const serverless = require("serverless-http");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("../config/db");
const authRoutes = require("../routes/auth");
const requestRoutes = require("../routes/requests");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", storage: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);

module.exports = app;
module.exports.handler = serverless(app);
