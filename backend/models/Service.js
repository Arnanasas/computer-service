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

  paidDate: Date,
  paymentMethod: String,
  paymentId: Number,
  clientType: String,
  companyName: String,
  companyCode: Number,
  service: String,
  pvmCode: Number,
  address: String,
});

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;
