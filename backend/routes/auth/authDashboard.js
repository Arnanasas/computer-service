const User = require("../../models/User");
const verify = require("./authVerify");
const Service = require("../../models/Service");
const Comment = require("../../models/Comment");
const moment = require("moment"); // Import the moment library for date formatting
const Product = require("../../models/Product");
const Category = require("../../models/Category"); // Assuming you're using the Category model
const Storage = require("../../models/Storage"); //
const { createComment } = require("../../services/commentService");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const upload = multer({ dest: "uploads/" });

const dayjs = require("dayjs");

const router = require("express").Router();

router.get("/services/:filter", verify, async (req, res) => {
  try {
    const filter = req.params.filter;
    let query = { isDeleted: { $ne: true } }; // Exclude deleted services by default
    let sortOption = {};

    // Set filter query based on the filter parameter
    switch (filter) {
      case "all":
        query = {
          ...query, // Keep the isDeleted filter
          status: { $nin: ["Atsiskaityta", "Sutaisyta, pranešta", "jb"] },
        };
        break;
      case "to-send":
        query = { ...query, status: "Neišsiųsta" };
        break;
      case "elsewhere":
        query = { ...query, status: "Taisoma kitur" };
        break;
      case "waiting":
        query = { ...query, status: "Sutaisyta, pranešta" };
        break;
      case "archive":
        query = {
          ...query,
          status: "Atsiskaityta",
          paidDate: { $exists: true },
        };
        sortOption = { paidDate: -1 }; // Sort by paidDate, newest to latest
        break;
      case "archive-notpaid":
        query = {
          ...query,
          status: "Atsiskaityta",
          paidDate: { $exists: false },
        };
        break;
      case "jb":
        query = { ...query, status: "jb" };
        sortOption = { paidDate: -1 }; // Sort by paidDate, newest to latest
        break;
      case "deleted": // Add a new filter to view deleted services
        query = { isDeleted: true };
        sortOption = { deletedAt: -1 }; // Sort by deletion date, newest first
        break;
      default:
        return res.status(400).json({ error: "Invalid filter" });
    }

    // Add search functionality
    const { phone, serviceId } = req.query;

    // Phone search - search in phone number field (supports partial match from the end)
    if (phone && phone.trim() !== "") {
      query.number = { $regex: phone.trim() + "$", $options: "i" }; // Match phone numbers ending with the search term
    }

    // Service ID search - search in service ID field (supports partial match)
    if (serviceId && serviceId.trim() !== "") {
      query.id = { $regex: serviceId.trim(), $options: "i" }; // Case-insensitive partial match in "id" field
    }

    // Extract page and limit from query parameters with default values
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Count total documents for the current filter query
    const totalServices = await Service.countDocuments(query);

    // Fetch services with pagination and sorting
    const services = await Service.find(query)
      .sort(sortOption) // Apply sorting if applicable
      .skip(skip) // Skip previous pages' items
      .limit(limit) // Limit the number of items per request
      .exec();

    // Calculate total pages
    const totalPages = Math.ceil(totalServices / limit);

    // Send paginated response
    res.status(200).json({
      services,
      pagination: {
        totalServices,
        totalPages,
        currentPage: page,
        pageSize: services.length,
      },
    });
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

const path = require("path");

router.delete("/services/:id", verify, async (req, res) => {
  try {
    const serviceId = req.params.id;

    // Find all services with this ID (there shouldn't be duplicates, but just in case)
    const services = await Service.find({ id: serviceId });

    if (!services || services.length === 0) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Log deletion for services with specific statuses
    for (const service of services) {
      if (service.status === "Atsiskaityta" || service.status === "jb") {
        const logMessage = `Service with ID ${serviceId}, status ${
          service.status
        }, price ${
          service.price
        }, and deletion date ${new Date().toISOString()} was deleted.\n`;
        const logFilePath = path.join(__dirname, "deletion.log");
        fs.appendFileSync(logFilePath, logMessage, "utf8");
      }
    }

    // Mark all services with this ID as deleted
    const updateResult = await Service.updateMany(
      { id: serviceId },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      }
    );

    res.status(200).json({
      message: "Service(s) marked as deleted successfully",
      count: updateResult.modifiedCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/services/:id", verify, async (req, res) => {
  try {
    const serviceId = req.params.id;

    const service = await Service.findOne({ id: serviceId });

    let paymentId = service ? service.paymentId : null;

    // Check if paymentMethod changes from "kortele" to "grynais" or vice versa
    if (
      service &&
      req.body.paymentMethod &&
      service.paymentMethod !== req.body.paymentMethod &&
      (service.paymentMethod === "kortele" ||
        service.paymentMethod === "grynais") &&
      (req.body.paymentMethod === "kortele" ||
        req.body.paymentMethod === "grynais")
    ) {
      paymentId = await getNewPaymentId(req.body.paymentMethod);
    } else if (!service || !service.paymentId) {
      paymentId = req.body.paymentMethod
        ? await getNewPaymentId(req.body.paymentMethod)
        : null;
    }

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
    const devicesFixedToday = await Service.count({
      createdAt: {
        $gte: moment().startOf("day").toDate(),
        $lte: moment().endOf("day").toDate(),
      },
    });

    // Get total count of ALL services (including deleted ones)
    const totalServices = await Service.countDocuments({});

    // Generate a unique ID that won't conflict with deleted services
    const customId =
      totalServices < 1000
        ? `0${totalServices + 1}-${devicesFixedToday + 1}`
        : `${totalServices + 1}-${devicesFixedToday + 1}`;

    const isSigned = false;

    const serviceWithId = {
      ...serviceData,
      id: customId,
      isSigned: isSigned,
      isDeleted: false, // Explicitly set this to false for new services
    };

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

    const comments = await createComment({
      serviceId,
      comment,
      createdBy,
      isPublic,
    });

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

    // 3. Sum of prices for active services (not deleted, not in excluded statuses)
    const activePriceSum = await Service.aggregate([
      { 
        $match: { 
          isDeleted: { $ne: true },
          status: { $nin: ["Atsiskaityta", "Sutaisyta, pranešta", "jb"] }
        } 
      },
      {
        $addFields: {
          numericPrice: { $toDouble: "$price" }
        }
      },
      { $group: { _id: null, totalPrice: { $sum: "$numericPrice" } } },
    ]);

    const totalActivePrice = activePriceSum[0]?.totalPrice || 0;

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
      {
        label: "Laukiama atsiskaitymų suma",
        icon: "ri-money-euro-circle-line",
        value: `${totalActivePrice.toFixed(2)} €`,
        percent: "0",
        status: "up",
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
      ourPrice,
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
      ourPrice,
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

// Get all products with optional filtering
router.get("/products", async (req, res) => {
  try {
    const {
      category,
      storage,
      minStock,
      maxStock,
      name,
      page = 1,
      limit = 10,
    } = req.query;

    // Build the query object dynamically based on filters
    let query = {};

    // Name filter
    if (name) {
      query.$text = { $search: name }; // Full-text search
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Storage filter
    if (storage) {
      query.storage = storage;
    }

    // Min Stock filter
    if (minStock) {
      query.stock = { ...query.stock, $gte: Number(minStock) };
    }

    // Max Stock filter
    if (maxStock) {
      query.stock = { ...query.stock, $lte: Number(maxStock) };
    }

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    // Fetch the products with category and storage populated, apply pagination
    const products = await Product.find(query)
      .populate("category")
      .populate("storage")
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    // Get the total count of products that match the query for pagination
    const totalProducts = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(totalProducts / pageSize),
      currentPage: pageNumber,
      totalProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error); // Log the error for debugging
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find(); // Fetch all categories
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/storages", async (req, res) => {
  try {
    const storages = await Storage.find(); // Fetch all storages
    res.json(storages);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/products/:id", verify, async (req, res) => {
  try {
    const productId = req.params.id;

    // Find the service by ID and remove it
    const deletedProduct = await Product.findOneAndRemove({ _id: productId });

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/products/:id", verify, async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findOne({ _id: productId })
      .populate("category", "name")
      .populate("storage", "locationName"); // Populate Storage name;
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/products/:id", verify, async (req, res) => {
  try {
    const productId = req.params.id;

    const {
      name,
      description,
      model,
      category,
      stock,
      price,
      ourPrice,
      storage,
      partNumber,
      partsUsed,
    } = req.body;

    const categoryName = await Category.findOne({ name: category });
    const storageName = await Storage.findOne({ locationName: storage });

    if (!categoryName) {
      return res.status(400).json({ error: "Invalid category name" });
    }

    if (!storageName) {
      return res.status(400).json({ error: "Invalid storage location name" });
    }

    const product = await Product.findOne({ _id: productId });
    // Find the service by ID and update it
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId },
      {
        name,
        description,
        model,
        category: categoryName._id,
        stock: stock || 0,
        price,
        ourPrice,
        storage: storageName._id,
        partNumber,
        partsUsed,
      },
      { new: true } // Return the updated document
    );
    if (!updatedProduct) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.status(200).json({ ...updatedProduct._doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/products/quantity-change", async (req, res) => {
  try {
    const { partId, quantityChange } = req.body; // Get part ID and quantity change from request

    const product = await Product.findById(partId); // Find product by ID
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Adjust stock (subtract quantity for used parts, add when quantity is decreased)
    const newStock = product.stock + quantityChange; // quantityChange could be positive or negative
    if (newStock < 0) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    if (newStock > product.stock) {
      return res
        .status(400)
        .json({ error: "Stock cannot be larger than the original stock" });
    }

    product.stock = newStock; // Update stock
    await product.save();

    res.json({ message: "Stock updated", product });
  } catch (error) {
    console.error("Error updating product stock:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/products/submit-csv", upload.single("file"), async (req, res) => {
  const filePath = req.file.path;
  const categoryName = await Category.findOne({ name: "Telefonai" });
  const storageName = await Storage.findOne({ locationName: "Kalvariju" });

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", async (row) => {
      const { partId, name, ourPrice, price, quantity, model } = row;

      try {
        let product = await Product.findOne({ partNumber: partId });

        if (product) {
          // Update quantity if product exists
          product.stock += parseInt(quantity, 10);
        } else {
          // Create new product if it doesn't exist
          product = new Product({
            name,
            ourPrice: parseFloat(ourPrice),
            price: parseFloat(price),
            stock: parseInt(quantity, 10),
            model,
            partNumber: partId,
            storage: storageName._id,
            category: categoryName._id,
          });
        }

        await product.save();
      } catch (error) {
        console.error(`Error processing row: ${JSON.stringify(row)}`, error);
      }
    })
    .on("end", () => {
      fs.unlinkSync(filePath); // Remove the file after processing
      res.status(200).send("CSV file processed successfully");
    })
    .on("error", (error) => {
      console.error("Error reading CSV file", error);
      res.status(500).send("Error processing CSV file");
    });
});

router.get("/products-out-of-stock", async (req, res) => {
  try {
    // Find all products where stock is 0
    const products = await Product.find({ stock: 0 }).select("name");

    // Send the product names as the response
    res.json(products);
  } catch (error) {
    console.error("Error fetching out-of-stock products:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
