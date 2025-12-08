require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
console.log("🔥 RUNNING INDEX.JS FROM:", __dirname);

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

app.get("/", (req, res) => {
  res.send(`
    <h1>Backend API is Running ✔</h1>
    <p>Available routes:</p>
    <ul>
      <li>/api/health</li>
      <li>/api/auth</li>
      <li>/api/requests</li>
    </ul>
  `);
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", storage: true });
});

// API routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/requests", require("./routes/requests"));
// (quotes, orders, bills later)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port http://localhost:${PORT}`));
