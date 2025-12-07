const express = require("express");
const router = express.Router();

// Hard-coded admin (for now)
const ADMIN_EMAIL = "anna@cleaning.local";
const ADMIN_PASSWORD = "admin123";

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    // for simplicity, token is fake
    const fakeToken = "admin-token-" + Date.now();
    return res.json({ token: fakeToken });
  }

  return res.status(401).json({ error: "Invalid email or password" });
});

module.exports = router;
