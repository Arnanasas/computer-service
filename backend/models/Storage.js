const mongoose = require("mongoose");

const storageSchema = new mongoose.Schema({
  locationName: {
    type: String,
    required: true,
  },
  description: String,
});

module.exports = mongoose.model("Storage", storageSchema);
