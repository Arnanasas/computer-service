const router = require("express").Router();
const verify = require("../auth/authVerify");
const Service = require("../../models/Service");
const Payment = require("../../models/Payment");
const Counter = require("../../models/Counter");
const { generateInvoicePDF } = require("../../services/invoiceGenerator");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");

const PAYMENT_METHOD_TO_PREFIX = {
  kortele: "CRD",
  grynais: "GRN",
};

/**
 * POST /api/v2/payments
 *
 * Body:
 *   serviceId   – (required) the service `id` field
 *   needPVM     – boolean; when false, no invoice number is reserved and no PDF generated
 *
 * Optional overrides (fall back to the linked Service document):
 *   paymentMethod, amount, paidDate, clientType, clientName,
 *   companyName, companyCode, pvmCode, address, serviceName
 */

router.post("/", verify, async (req, res) => {
  try {
    const { serviceId, needPVM } = req.body;

    if (!serviceId) {
      return res.status(400).json({ error: "serviceId is required" });
    }

    const service = await Service.findOne({ id: serviceId });
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    if (needPVM === false) {
      return res.status(200).json({ message: "No invoice needed (needPVM=false)" });
    }

    const paymentMethod = req.body.paymentMethod || service.paymentMethod;
    if (!paymentMethod || !PAYMENT_METHOD_TO_PREFIX[paymentMethod]) {
      return res.status(400).json({
        error: 'paymentMethod must be "kortele" or "grynais"',
      });
    }

    const hasPaymentId =
      service.paymentId != null && service.paymentId !== "" && service.paymentId !== "NI";
    if (hasPaymentId) {
      const existingPayment = await Payment.findOne({ serviceId });
      return res.status(409).json({
        error: "Invoice already exists for this service",
        payment: existingPayment || null,
        currentPaymentId: service.paymentId,
      });
    }

    const prefix = PAYMENT_METHOD_TO_PREFIX[paymentMethod];
    const sequenceNumber = await Counter.getNextSequence(prefix);
    const seriesNumber = `${prefix}-${sequenceNumber}`;

    const amount = Number(req.body.amount ?? service.price) || 0;

    const payment = new Payment({
      seriesNumber,
      sequenceNumber,
      seriesPrefix: prefix,
      paymentMethod,
      serviceId,
      amount,
      paidDate: req.body.paidDate || service.paidDate || new Date(),
      clientType: req.body.clientType || service.clientType,
      clientName: req.body.clientName || service.name,
      companyName: req.body.companyName || service.companyName,
      companyCode: req.body.companyCode || service.companyCode,
      pvmCode: req.body.pvmCode || service.pvmCode,
      address: req.body.address || service.address,
      serviceName: req.body.serviceName || service.service,
    });

    const pdfPath = await generateInvoicePDF(payment);
    payment.pdfPath = pdfPath;

    await payment.save();

    service.paymentId = seriesNumber;
    await service.save();

    res.status(201).json({
      payment: payment.toObject(),
      pdfUrl: `/api/v2/payments/${payment._id}/pdf`,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Duplicate invoice – please retry" });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/v2/payments/archive/:year/:month
 * Download a ZIP of all invoice PDFs for the given year/month (based on paidDate).
 * Regenerates any missing PDFs on the fly.
 */
router.get("/archive/:year/:month", verify, async (req, res) => {
  try {
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10);

    if (!year || month < 1 || month > 12) {
      return res.status(400).json({ error: "Invalid year or month" });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const payments = await Payment.find({
      paidDate: { $gte: startDate, $lt: endDate },
    }).sort({ paidDate: 1 });

    if (payments.length === 0) {
      return res.status(404).json({ error: "No invoices found for this period" });
    }

    for (const payment of payments) {
      if (!payment.pdfPath || !fs.existsSync(payment.pdfPath)) {
        const pdfPath = await generateInvoicePDF(payment);
        payment.pdfPath = pdfPath;
        await payment.save();
      }
    }

    const fileName = `invoices-${year}-${String(month).padStart(2, "0")}.zip`;
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", (err) => res.status(500).json({ error: err.message }));
    archive.pipe(res);

    for (const payment of payments) {
      const pdfName = `${payment.seriesNumber}.pdf`;
      archive.file(payment.pdfPath, { name: pdfName });
    }

    await archive.finalize();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/v2/payments/service/:serviceId
 * Retrieve the payment/invoice for a given service.
 */
router.get("/service/:serviceId", verify, async (req, res) => {
  try {
    const payment = await Payment.findOne({ serviceId: req.params.serviceId });
    if (!payment) {
      return res.status(404).json({ error: "No invoice found for this service" });
    }
    res.json({
      payment: payment.toObject(),
      pdfUrl: `/api/v2/payments/${payment._id}/pdf`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/v2/payments/:id/pdf
 * Stream the generated invoice PDF back to the client.
 */
router.get("/:id/pdf", verify, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment || !payment.pdfPath) {
      return res.status(404).json({ error: "Invoice PDF not found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${payment.seriesNumber}.pdf"`
    );
    res.sendFile(path.resolve(payment.pdfPath));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
