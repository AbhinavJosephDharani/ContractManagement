const serverless = require('serverless-http')
const app = require('../index')

module.exports = serverless(app)
const serverless = require("serverless-http");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("../config/db");
const authRoutes = require("../routes/auth");
const requestRoutes = require("../routes/requests");

// Connect to DB
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Vercel health route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", storage: true });
});

// USE FULL PREFIXES HERE
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);

module.exports = app;
module.exports.handler = serverless(app);
