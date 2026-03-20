const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    seriesNumber: { type: String, required: true, unique: true },
    sequenceNumber: { type: Number, required: true },
    seriesPrefix: { type: String, required: true, enum: ["CRD", "GRN"] },
    paymentMethod: { type: String, required: true, enum: ["kortele", "grynais"] },
    serviceId: { type: String, required: true, ref: "Service" },
    amount: { type: Number, required: true, min: 0 },
    paidDate: { type: Date, default: Date.now },
    clientType: { type: String },
    clientName: { type: String },
    companyName: { type: String },
    companyCode: { type: Number },
    pvmCode: { type: String },
    address: { type: String },
    serviceName: { type: String },
    pdfPath: { type: String },
  },
  { timestamps: true }
);

paymentSchema.index({ serviceId: 1 });
paymentSchema.index({ seriesPrefix: 1, sequenceNumber: 1 }, { unique: true });

module.exports = mongoose.model("Payment", paymentSchema);
