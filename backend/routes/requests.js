const express = require("express");
const router = express.Router();
const upload = require("../cloud/multer");

const Client = require("../models/Client");
const ServiceRequest = require("../models/ServiceRequest");

router.get("/", async (req, res) => {
  const all = await ServiceRequest.find().populate("client");
  res.json(all);
});


// POST /api/requests
router.post("/", upload.array("photos", 5), async (req, res) => {
  console.log("📥 REQUEST RECEIVED");
  console.log("BODY:", JSON.stringify(req.body, null, 2));
  console.log("FILES:", JSON.stringify(req.files, null, 2));

  try {
    const {
      firstName,
      lastName,
      address,
      phone,
      email,
      cleaningType,
      rooms,
      preferredDate,
      preferredTime,
      budget,
      notes
    } = req.body;

    // find or create client
    let client = await Client.findOne({ email });
    if (!client) {
      client = await Client.create({
        firstName,
        lastName,
        address,
        phone,
        email,
      });
    }

// cloudinary file URLs (safe even if no images were uploaded)
const photoUrls = req.files?.map(f => f.path) || [];

    // create service request
    const request = await ServiceRequest.create({
      client: client._id,
      serviceAddress: address,
      cleaningType,
      rooms,
      preferredDate,
      preferredTime,
      budget,
      notes,
      photoUrls,
    });

    res.status(201).json(request);
  } catch (err) {
    console.error("❌ REQUEST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
