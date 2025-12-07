const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    serviceAddress: String,
    cleaningType: String,
    rooms: Number,
    preferredDate: String,
    preferredTime: String,
    budget: Number,
    notes: String,
    photoUrls: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);
