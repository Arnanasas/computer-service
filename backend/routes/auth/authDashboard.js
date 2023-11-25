const User = require("../../models/User");
const verify = require("./authVerify");
const Service = require("../../models/Service");
const Comment = require("../../models/Comment");
const moment = require("moment"); // Import the moment library for date formatting

const router = require("express").Router();

router.get("/services/:filter", verify, async (req, res) => {
  try {
    const filter = req.params.filter;
    let query = {};

    switch (filter) {
      case "all":
        query = { status: { $ne: "Atsiskaityta" } };
        break;
      case "to-send":
        query = { status: "Neišsiųsta" };
        break;
      case "elsewhere":
        query = { status: "Taisoma kitur" };
        break;
      case "waiting":
        query = { status: "Laukiama klientų" };
        break;
      case "archive":
        query = { status: "Atsiskaityta" };
        break;
      default:
        return res.status(400).json({ error: "Invalid filter" });
    }

    const services = await Service.find(query);
    res.status(200).json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/service/:id", verify, async (req, res) => {
  try {
    const serviceId = req.params.id;
    const service = await Service.findOne({ id: serviceId });
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/services/:id", verify, async (req, res) => {
  try {
    const serviceId = req.params.id;

    // Find the service by ID and remove it
    const deletedService = await Service.findOneAndRemove({ id: serviceId });

    if (!deletedService) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.status(200).json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/services/:id", verify, async (req, res) => {
  try {
    const serviceId = req.params.id;

    // Find the service by ID and update it
    const updatedService = await Service.findOneAndUpdate(
      { id: serviceId },
      req.body, // Use the incoming data to update the service
      { new: true } // Return the updated document
    );

    if (!updatedService) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.status(200).json({ message: "Service updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/services", verify, async (req, res) => {
  try {
    const serviceData = req.body;

    // Calculate the number of devices fixed on the current date
    const currentDate = moment().format("YYMMDD");
    const lastServiceFixedToday = await Service.findOne(
      { id: { $regex: `^${currentDate}` } },
      {},
      { sort: { id: -1 } }
    );

    let lastPhoneNumberDigit, devicesFixedToday;

    if (lastServiceFixedToday) {
      devicesFixedToday = parseInt(lastServiceFixedToday.id.split("-")[1]);
      lastPhoneNumberDigit = lastServiceFixedToday.number.slice(-1);
    } else {
      devicesFixedToday = 0;
      lastPhoneNumberDigit = serviceData.number.slice(-1);
    }

    const customId = `${currentDate}${lastPhoneNumberDigit}-${
      devicesFixedToday + 1
    }`;

    const serviceWithId = { ...serviceData, id: customId };

    const service = new Service(serviceWithId);
    const savedService = await service.save();
    res.status(201).json(savedService);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/me", verify, (req, res) => {
  // req.user contains the decoded user from the JWT token

  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/comment", verify, async (req, res) => {
  try {
    // Extract data from the request body
    const { serviceId, comment, createdBy, isPublic } = req.body;

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

    const comments = await Comment.find({ serviceId: serviceId }).sort({
      createdAt: -1,
    }); // Sort by newest first
    res.status(200).json(comments);
  } catch (error) {
    // Handle any errors
    console.error("Error posting comment:", error); // Log the detailed error
    res
      .status(500)
      .json({ error: "Failed to post the comment.", details: error.message });
  }
});

// routes/dashboard.js or wherever you've defined your routes

router.put("/comment/:id/toggle-public", verify, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Toggle the isPublic field
    comment.isPublic = !comment.isPublic;
    await comment.save();

    res.json({ success: true, isPublic: comment.isPublic });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

router.get("/comments/:serviceId", verify, async (req, res) => {
  try {
    const { serviceId } = req.params;
    const comments = await Comment.find({ serviceId: serviceId }).sort({
      createdAt: -1,
    }); // Sort by newest first
    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments." });
  }
});

router.get("/serviceInfo", async (req, res) => {
  try {
    const { serviceId } = req.query;

    if (!serviceId) {
      return res.status(400).json({ message: "serviceId is required." });
    }

    const service = await Service.findOne({ id: serviceId });
    if (!service) {
      return res.status(404).json({ message: "Paslauga nerasta." });
    }

    const publicComments = await Comment.find({
      serviceId: serviceId,
      isPublic: true,
    });

    return res.status(200).json({
      service: service,
      comments: publicComments,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
