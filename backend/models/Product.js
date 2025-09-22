const mongoose = require("mongoose");

const ALLOWED_CATEGORIES = ["Other", "Phone", "PC"];

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ALLOWED_CATEGORIES,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: 1 });

module.exports = mongoose.model("Product", productSchema);
