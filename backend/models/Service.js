const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  id: String,
  name: String,
  number: String,
  deviceModel: String,
  deviceSerial: String,
  devicePassword: String,
  failure: String,
  price: String,
  hasCharger: Boolean,
  status: String,
  isContacted: Boolean,
});

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;
