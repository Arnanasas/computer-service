const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 998 },
});

counterSchema.statics.getNextSequence = async function (seriesPrefix) {
  const counter = await this.findOneAndUpdate(
    { _id: seriesPrefix },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

module.exports = mongoose.model("Counter", counterSchema);
