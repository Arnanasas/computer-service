const User = require("../../models/User");
const verify = require("./authVerify");
const Service = require("../../models/Service");
const Comment = require("../../models/Comment");
const Work = require("../../models/Work");
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

// Helper to recalculate service price based on works and used parts
async function recalculateServicePrice(service) {
  try {
    const DIAGNOSTICS_NAME = "Diagnostika";
    const DIAGNOSTICS_DEFAULT_PRICE = 19;

    let worksTotal = 0;
    if (Array.isArray(service.works)) {
      // Auto-adjust diagnostics price: 19 only if it's the sole work, else 0
      const diagIndex = service.works.findIndex(
        (w) => w && w.name === DIAGNOSTICS_NAME
      );
      if (diagIndex !== -1) {
        if (service.works.length >= 2) {
          if (Number(service.works[diagIndex].price) !== 0) {
            service.works[diagIndex].price = 0;
          }
        } else {
          if (Number(service.works[diagIndex].price) !== DIAGNOSTICS_DEFAULT_PRICE) {
            service.works[diagIndex].price = DIAGNOSTICS_DEFAULT_PRICE;
          }
        }
      }

      worksTotal = service.works.reduce((sum, w) => sum + (Number(w.price) || 0), 0);
    }

    let partsTotal = 0;
    if (Array.isArray(service.usedParts) && service.usedParts.length > 0) {
      const missingPriceIds = service.usedParts
        .filter((p) => !(typeof p.unitPrice === "number"))
        .map((p) => p._id)
        .filter(Boolean);

      let priceById = new Map();
      if (missingPriceIds.length > 0) {
        const products = await Product.find({ _id: { $in: missingPriceIds } }).select("_id price");
        priceById = new Map(products.map((p) => [String(p._id), Number(p.price) || 0]));
      }

      partsTotal = service.usedParts.reduce((sum, p) => {
        const unit = typeof p.unitPrice === "number" ? Number(p.unitPrice) : (priceById.get(String(p._id)) || 0);
        const qty = Number(p.quantity) || 0;
        return sum + unit * qty;
      }, 0);
    }

    const total = worksTotal + partsTotal;
    service.price = String(total.toFixed(2));
    return total;
  } catch (err) {
    throw err;
  }
}

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseBooleanFlag(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (v === "true" || v === "1" || v === "yes") return true;
    if (v === "false" || v === "0" || v === "no") return false;
  }
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  return undefined;
}

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
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Use a plain object to ensure non-schema fields (description) are included in response
    const result = service.toObject();

    // Enrich works with description from Work collection (by id, then by name fallback)
    if (Array.isArray(result.works) && result.works.length > 0) {
      const workIds = result.works.map((w) => w.workId).filter(Boolean);
      const workDocsById = workIds.length
        ? await Work.find({ _id: { $in: workIds } }).select("_id description name")
        : [];
      const descById = new Map(
        workDocsById.map((w) => [String(w._id), w.description || ""])
      );

      const namesNeedingLookup = Array.from(
        new Set(
          result.works
            .filter((w) => !w.workId && w.name)
            .map((w) => w.name)
        )
      );
      const workDocsByName = namesNeedingLookup.length
        ? await Work.find({ name: { $in: namesNeedingLookup } }).select("name description")
        : [];
      const descByName = new Map(
        workDocsByName.map((w) => [w.name, w.description || ""])
      );

      result.works = result.works.map((w) => ({
        ...w,
        description:
          descById.get(String(w.workId)) || (w.name ? descByName.get(w.name) : "") || "",
      }));
    }

    // Enrich usedParts with category from Product collection
    if (Array.isArray(result.usedParts) && result.usedParts.length > 0) {
      const partIds = result.usedParts.map((p) => p._id).filter(Boolean);
      const products = partIds.length
        ? await Product.find({ _id: { $in: partIds } }).select("_id category")
        : [];
      const categoryById = new Map(
        products.map((p) => [String(p._id), p.category || ""])
      );

      result.usedParts = result.usedParts.map((p) => ({
        ...p,
        category: categoryById.get(String(p._id)) || "",
      }));
    }

    res.status(200).json(result);
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

    // If needPVM is explicitly false, do NOT generate a paymentId.
    // If needPVM is undefined or true, keep the current behavior.
  const needPVMFlag = parseBooleanFlag(req.body.needPVM);

  let paymentId = service ? service.paymentId : null;

  // When needPVM is explicitly true, always generate a fresh paymentId
  if (needPVMFlag === true) {
    const methodForInvoice = req.body.paymentMethod || (service ? service.paymentMethod : null);
    paymentId = await getNewPaymentId(methodForInvoice);
  } else if (needPVMFlag === false) {
    // needPVM === false -> mark as No Invoice needed
    paymentId = "NI";
  } else {
    // Legacy behavior when needPVM flag is not provided
    const isCurrentPaymentIdNumeric =
      service && typeof service.paymentId === "number" && !isNaN(service.paymentId);

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
    } else if (!service || !isCurrentPaymentIdNumeric) {
      const fallbackMethod = req.body.paymentMethod || (service ? service.paymentMethod : null);
      paymentId = await getNewPaymentId(fallbackMethod);
    }
  }

    // Persist computed paymentId
    if (service) {
      service.paymentId = paymentId;
    }

    // Exclude needPVM and paymentId from being persisted from client payload
    const { needPVM, usedParts, works, paymentId: _omitPaymentId, ...updateData } = req.body;

    // Guard: archived services should not change price or composition
    const isArchived = service && (service.status === "Atsiskaityta" || service.status === "jb");

    // If usedParts provided and not archived, enrich with unitPrice snapshots
    if (!isArchived && Array.isArray(usedParts)) {
      const partIds = usedParts.map((p) => p._id).filter(Boolean);
      const products = partIds.length
        ? await Product.find({ _id: { $in: partIds } }).select("_id price name")
        : [];
      const byId = new Map(products.map((p) => [String(p._id), p]));

      service.usedParts = usedParts.map((p) => {
        const prod = byId.get(String(p._id));
        return {
          _id: p._id,
          name: p.name || prod?.name || "",
          quantity: Number(p.quantity) || 0,
          unitPrice: typeof p.unitPrice === "number" ? p.unitPrice : Number(prod?.price || 0),
        };
      });
    }

    // If works provided and not archived, replace full works list (keep snapshot prices)
    if (!isArchived && Array.isArray(works)) {
      service.works = works.map((w) => ({
        workId: w.workId,
        name: w.name,
        price: Number(w.price) || 0,
      }));
    }

    // Apply any other updates
    if (updateData && Object.keys(updateData).length > 0) {
      Object.assign(service, updateData);
    }

    // Recalculate if not archived and parts/works changed
    if (!isArchived && (Array.isArray(usedParts) || Array.isArray(works))) {
      await recalculateServicePrice(service);
    }

    const updatedService = await service.save();
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

    // Ensure Diagnostics work exists and add it as the first work
    const diagnosticsName = "Diagnostika";
    let diagnosticsWork = await Work.findOne({ name: diagnosticsName });
    if (!diagnosticsWork) {
      diagnosticsWork = await new Work({
        name: diagnosticsName,
        description: "Pirminis įrenginio patikrintinimas PP",
        defaultPrice: 19,
      }).save();
    }

    const initialWorks = [
      {
        workId: diagnosticsWork._id,
        name: diagnosticsWork.name,
        price: diagnosticsWork.defaultPrice,
      },
    ];

    // Determine paymentId based on needPVM flag and payment method
  const needPVMFlag = parseBooleanFlag(serviceData.needPVM);
    let creationPaymentId = null;
  if (needPVMFlag === false) {
    creationPaymentId = "NI";
  } else if (needPVMFlag === true) {
    const methodForInvoice = serviceData.paymentMethod || null;
    creationPaymentId = await getNewPaymentId(methodForInvoice);
  }

    // Exclude needPVM and price from persistence; price is always derived
    const { needPVM: _omitNeedPVM, price: _omitPrice, ...servicePersisted } = serviceData;

    const service = new Service({
      ...servicePersisted,
      id: customId,
      isSigned: isSigned,
      isDeleted: false,
      works: initialWorks,
      paymentId: creationPaymentId,
    });

    await recalculateServicePrice(service);
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
  // Consider only services that have numeric paymentId values
  const query = { paymentId: { $type: "number" } };
  if (paymentMethod) {
    query.paymentMethod = paymentMethod;
  }

  const highestPaymentService = await Service.findOne(query)
    .sort("-paymentId")
    .limit(1);

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

// POST /api/products - Create a new simplified product
router.post("/products", async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;
    if (!name || !category || price === undefined) {
      return res.status(400).json({ error: "name, category and price are required" });
    }

    const newProduct = new Product({
      name,
      category,
      price,
      quantity: quantity || 0,
    });

    const savedProduct = await newProduct.save();
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
    const { category, name, page = 1, limit = 10 } = req.query;

    let query = {};
    if (name) {
      query.name = { $regex: `^${escapeRegex(name)}` , $options: "i" };
    }
    if (category) {
      query.category = category;
    }

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    const products = await Product.find(query)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    const totalProducts = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(totalProducts / pageSize),
      currentPage: pageNumber,
      totalProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
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
    const product = await Product.findOne({ _id: productId });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/products/:id", verify, async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, category, price, quantity } = req.body;

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId },
      {
        ...(name !== undefined ? { name } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(price !== undefined ? { price } : {}),
        ...(quantity !== undefined ? { quantity } : {}),
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/products/quantity-change", async (req, res) => {
  try {
    const { productId, quantityChange } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const newQuantity = (product.quantity || 0) + Number(quantityChange || 0);
    if (newQuantity < 0) {
      return res.status(400).json({ error: "Insufficient quantity" });
    }

    product.quantity = newQuantity;
    await product.save();

    res.json({ message: "Quantity updated", product });
  } catch (error) {
    console.error("Error updating product quantity:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// CSV submission endpoint removed due to simplified product model

router.get("/products-out-of-stock", async (req, res) => {
  try {
    const products = await Product.find({ quantity: 0 }).select("name");

    res.json(products);
  } catch (error) {
    console.error("Error fetching out-of-stock products:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Works management
router.post("/works", verify, async (req, res) => {
  try {
    const { name, description, defaultPrice } = req.body;
    if (!name || defaultPrice === undefined) {
      return res.status(400).json({ error: "name and defaultPrice are required" });
    }

    const work = new Work({ name, description: description || "", defaultPrice });
    const saved = await work.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/works", verify, async (req, res) => {
  try {
    const { q, page = 1, limit = 50 } = req.query;
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    const query = {};
    if (q && q.trim() !== "") {
      query.name = { $regex: `^${escapeRegex(q.trim())}`, $options: "i" };
    }

    const works = await Work.find(query)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const total = await Work.countDocuments(query);

    res.status(200).json({
      works,
      pagination: {
        total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: pageNumber,
        pageSize: works.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Edit a single work item price on a service by index
router.put("/services/:id/works/:index", verify, async (req, res) => {
  try {
    const serviceId = req.params.id;
    const index = parseInt(req.params.index, 10);
    const { price } = req.body;

    if (Number.isNaN(index) || price === undefined) {
      return res.status(400).json({ error: "index (number) and price are required" });
    }

    const service = await Service.findOne({ id: serviceId });
    if (!service) return res.status(404).json({ error: "Service not found" });

    const isArchived = service.status === "Atsiskaityta" || service.status === "jb";
    if (isArchived) {
      return res.status(400).json({ error: "Archived service cannot be modified" });
    }

    if (!Array.isArray(service.works) || index < 0 || index >= service.works.length) {
      return res.status(404).json({ error: "Work index not found" });
    }

    service.works[index].price = Number(price);
    await recalculateServicePrice(service);
    await service.save();
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add multiple works to a service
router.post("/services/:id/works", verify, async (req, res) => {
  try {
    const serviceId = req.params.id;
    const { works } = req.body; // [{ workId, price? }]
    if (!Array.isArray(works) || works.length === 0) {
      return res.status(400).json({ error: "works array is required" });
    }

    const service = await Service.findOne({ id: serviceId });
    if (!service) return res.status(404).json({ error: "Service not found" });

    const workIds = works.map((w) => w.workId).filter(Boolean);
    const workDocs = await Work.find({ _id: { $in: workIds } });
    const workById = new Map(workDocs.map((w) => [String(w._id), w]));

    const toAdd = works
      .map((w) => {
        const doc = workById.get(String(w.workId));
        if (!doc) return null;
        const price = w.price !== undefined ? Number(w.price) : Number(doc.defaultPrice);
        return {
          workId: doc._id,
          name: doc.name,
          price: price,
        };
      })
      .filter(Boolean);

    // Guard: archived should not be modified in pricing
    const isArchived = service.status === "Atsiskaityta" || service.status === "jb";
    if (isArchived) {
      return res.status(400).json({ error: "Archived service cannot be modified" });
    }

    service.works = Array.isArray(service.works) ? service.works.concat(toAdd) : toAdd;
    await recalculateServicePrice(service);
    await service.save();
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove a work from a service (removes first occurrence of given workId)
router.delete("/services/:id/works/:workId", verify, async (req, res) => {
  try {
    const serviceId = req.params.id;
    const workId = req.params.workId;

    const service = await Service.findOne({ id: serviceId });
    if (!service) return res.status(404).json({ error: "Service not found" });

    if (!Array.isArray(service.works) || service.works.length === 0) {
      return res.status(404).json({ error: "No works to remove" });
    }

    const idx = service.works.findIndex((w) => String(w.workId) === String(workId));
    if (idx === -1) {
      return res.status(404).json({ error: "Work not found on service" });
    }

    const isArchived = service.status === "Atsiskaityta" || service.status === "jb";
    if (isArchived) {
      return res.status(400).json({ error: "Archived service cannot be modified" });
    }

    service.works.splice(idx, 1);
    await recalculateServicePrice(service);
    await service.save();
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Explicitly trigger price recalculation
router.post("/services/:id/recalculate-price", verify, async (req, res) => {
  try {
    const serviceId = req.params.id;
    const service = await Service.findOne({ id: serviceId });
    if (!service) return res.status(404).json({ error: "Service not found" });

    const isArchived = service.status === "Atsiskaityta" || service.status === "jb";
    if (isArchived) {
      // No recalculation for archived; return untouched
      return res.status(200).json(service);
    }

    await recalculateServicePrice(service);
    await service.save();
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
