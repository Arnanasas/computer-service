const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    serviceId: String,
    comment: String,
    createdBy: String,
    isPublic: Boolean,
    seenBy: [String],
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
