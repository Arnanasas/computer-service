const Comment = require("../models/Comment");

const createComment = async ({ serviceId, comment, createdBy, isPublic }) => {
  try {
    // Create a new comment
    const newComment = new Comment({
      serviceId,
      comment,
      createdBy,
      isPublic,
      seenBy: [createdBy], // The creator has obviously seen their own comment
    });

    // Save the comment to the database
    const savedComment = await newComment.save();

    // Retrieve all comments for the service, sorted by newest first
    const comments = await Comment.find({ serviceId }).sort({ createdAt: -1 });

    return comments;
  } catch (error) {
    console.error("Error posting comment:", error); // Log the detailed error
    throw new Error("Failed to post the comment.");
  }
};

module.exports = {
  createComment,
};
