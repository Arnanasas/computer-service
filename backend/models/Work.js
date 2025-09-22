const mongoose = require("mongoose");

const workSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    defaultPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

workSchema.index({ name: 1 });

module.exports = mongoose.model("Work", workSchema);


