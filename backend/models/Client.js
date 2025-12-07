const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  address: String,
  phone: String,
  email: String,
});

module.exports = mongoose.model("Client", clientSchema);
