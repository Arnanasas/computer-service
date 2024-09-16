const User = require("../../models/User");
const verify = require("./authVerify");
const Service = require("../../models/Service");
const Comment = require("../../models/Comment");
const moment = require("moment"); // Import the moment library for date formatting
const Product = require("../../models/Product");
const Category = require("../../models/Category"); // Assuming you're using the Category model
const Storage = require("../../models/Storage"); //

const dayjs = require("dayjs");

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
        query = { status: "Sutaisyta, pranešta" };
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

    const service = await Service.findOne({ id: serviceId });

    const paymentId =
      (service && service.paymentId) ||
      (req.body.paymentMethod
        ? await getNewPaymentId(req.body.paymentMethod)
        : null);

    // Find the service by ID and update it
    const updatedService = await Service.findOneAndUpdate(
      { id: serviceId },
      { ...req.body, paymentId }, // Use the incoming data to update the service
      { new: true } // Return the updated document
    );
    if (!updatedService) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.status(200).json({ ...updatedService._doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/services", verify, async (req, res) => {
  try {
    const serviceData = req.body;

    // Calculate the number of devices fixed on the current date
    const currentDate = moment().format("YYMMDD");
    const devicesFixedToday = await Service.count({
      id: { $regex: `^${currentDate}` },
    });

    let lastPhoneNumberDigit = serviceData.number.slice(-1);

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

router.get("/sales-data", verify, async (req, res) => {
  try {
    const salesData = await getMonthlySalesData();
    res.json(salesData);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;

const getNewPaymentId = async (paymentMethod) => {
  const highestPaymentService = await Service.findOne({ paymentMethod })
    .sort("-paymentId")
    .limit(1);
  console.log("highest", highestPaymentService);
  if (!highestPaymentService) return 1;
  return (highestPaymentService.paymentId || 0) + 1;
};

async function getMonthlySalesData() {
  return Service.aggregate([
    {
      $addFields: {
        yearMonth: {
          $concat: [
            { $toString: { $year: "$paidDate" } },
            "-",
            { $toString: { $month: "$paidDate" } },
          ],
        },
      },
    },
    {
      $group: {
        _id: "$yearMonth",
        totalProfit: { $sum: "$profit" }, // Summing the profit field instead of numericPrice
      },
    },
    {
      $project: {
        _id: 0,
        yearMonth: "$_id",
        totalProfit: 1, // Projecting totalProfit
      },
    },
    { $sort: { yearMonth: 1 } },
  ]);
}

function calculatePercentageChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Endpoint to get dashboard data
router.get("/dashboard-stats", async (req, res) => {
  try {
    // Get current and last month
    const currentMonthStart = dayjs().startOf("month").toDate();
    const lastMonthStart = dayjs()
      .subtract(1, "month")
      .startOf("month")
      .toDate();
    const lastMonthEnd = dayjs().subtract(1, "month").endOf("month").toDate();

    // 1. Clients This Month
    const clientsThisMonth = await Service.countDocuments({
      paidDate: { $gte: currentMonthStart },
    });

    // Clients Last Month
    const clientsLastMonth = await Service.countDocuments({
      paidDate: { $gte: lastMonthStart, $lte: lastMonthEnd },
    });

    // 2. Average Profit Per Client (This Month)
    const totalProfitThisMonth = await Service.aggregate([
      { $match: { paidDate: { $gte: currentMonthStart } } },
      { $group: { _id: null, totalProfit: { $sum: "$profit" } } },
    ]);

    const totalProfitLastMonth = await Service.aggregate([
      { $match: { paidDate: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
      { $group: { _id: null, totalProfit: { $sum: "$profit" } } },
    ]);

    // Handle cases where no data exists for total profit
    const profitThisMonth = totalProfitThisMonth[0]?.totalProfit || 0;
    const profitLastMonth = totalProfitLastMonth[0]?.totalProfit || 0;

    const averageProfitPerClientThisMonth =
      clientsThisMonth > 0 ? profitThisMonth / clientsThisMonth : 0;
    const averageProfitPerClientLastMonth =
      clientsLastMonth > 0 ? profitLastMonth / clientsLastMonth : 0;

    // Calculate percentage changes
    const clientsPercentageChange = calculatePercentageChange(
      clientsThisMonth,
      clientsLastMonth
    );
    const profitPercentageChange = calculatePercentageChange(
      averageProfitPerClientThisMonth,
      averageProfitPerClientLastMonth
    );

    // Determine status (up or down)
    const clientsStatus = clientsThisMonth > clientsLastMonth ? "up" : "down";
    const profitStatus =
      averageProfitPerClientThisMonth > averageProfitPerClientLastMonth
        ? "up"
        : "down";

    // Prepare the response
    const response = [
      {
        label: "Klientų šį mėnesį",
        icon: "ri-shopping-bag-3-line",
        value: clientsThisMonth,
        percent: Math.abs(clientsPercentageChange.toFixed(1)),
        status: clientsStatus,
      },
      {
        label: "Vidutinis pelnas per klientą",
        icon: "ri-briefcase-4-line",
        value: `${averageProfitPerClientThisMonth.toFixed(2)} €`,
        percent: Math.abs(profitPercentageChange.toFixed(1)),
        status: profitStatus,
      },
    ];

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// Inventoriaus valdymas

// POST /api/products - Create a new product
router.post("/products", async (req, res) => {
  try {
    // Extract data from the request body
    const {
      name,
      description,
      model,
      category,
      stock,
      price,
      storage,
      partNumber,
    } = req.body;

    // Validation: Check if the required fields are provided
    if (!name || !category || !price || !storage || !partNumber) {
      return res
        .status(400)
        .json({ error: "All required fields must be filled" });
    }

    // Check if the category and storage exist in the database by name
    const categoryName = await Category.findOne({ name: category });
    const storageName = await Storage.findOne({ locationName: storage });

    if (!categoryName) {
      return res.status(400).json({ error: "Invalid category name" });
    }

    if (!storageName) {
      return res.status(400).json({ error: "Invalid storage location name" });
    }

    // Create a new product
    const newProduct = new Product({
      name,
      description,
      model,
      category: categoryName._id,
      stock: stock || 0, // Default to 0 if stock is not provided
      price,
      storage: storageName._id,
      partNumber,
    });

    // Save the product to the database
    const savedProduct = await newProduct.save();

    // Respond with the created product
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/categories", async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = new Category({ name, description });

    await category.save();
    res
      .status(201)
      .json({ message: "Category created successfully", category });
  } catch (error) {
    res
      .status(500)
      .send({ error: "Failed to create category", details: error });
  }
});

// POST route to create a new storage
router.post("/storages", async (req, res) => {
  try {
    const { locationName, description } = req.body;
    const storage = new Storage({ locationName, description });

    await storage.save();
    res.status(201).json({ message: "Storage created successfully", storage });
  } catch (error) {
    res.status(500).send({ error: "Failed to create storage", details: error });
  }
});

module.exports = router;
