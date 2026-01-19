const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    phoneRaw: { type: String, required: true },
    phoneE164: { type: String, required: true },
    message: { type: String, required: true },
    messageSid: { type: String, default: null },
    messageStatus: { type: String, default: null },
    errorCode: { type: String, default: null },
    errorMessage: { type: String, default: null },
    tokenBook: { type: String, required: true, unique: true, index: true },
    tokenStop: { type: String, required: true, unique: true, index: true },
    bookUrl: { type: String, required: true },
    stopUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ["sent", "booked", "stopped"],
      default: "sent",
      index: true,
    },
    sentAt: { type: Date, default: () => new Date() },
    bookedAt: { type: Date, default: null },
    stoppedAt: { type: Date, default: null },
    lastIp: { type: String, default: null },
    lastUserAgent: { type: String, default: null },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const Promotion = mongoose.model("Promotion", promotionSchema);
module.exports = Promotion;

