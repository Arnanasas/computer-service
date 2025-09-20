const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
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
    profit: Number,
    paidDate: Date,
    paymentMethod: String,
    paymentId: mongoose.Schema.Types.Mixed,
    clientType: String,
    companyName: String,
    companyCode: Number,
    service: String,
    pvmCode: String,
    address: String,
    isSigned: Boolean,
    signature: String,
    usedParts: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // Reference to the Product schema
        name: String, // Part name
        quantity: Number, // Number of parts used
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "editedAt" },
  }
);

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;
