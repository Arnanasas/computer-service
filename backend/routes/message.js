const router = require("express").Router();
const dotenv = require("dotenv");
const twilio = require("twilio");
const Service = require("../models/Service");
const Promotion = require("../models/Promotion");
const verify = require("./auth/authVerify");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const { createComment } = require("../services/commentService");

function buildBaseUrl(req) {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol = forwardedProto ? forwardedProto.split(",")[0].trim() : req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}`;
}

function normalizeLtPhone(phone) {
  const trimmed = String(phone || "").trim();
  // Expect 8 digits starting with 6 (e.g., 6XXXXXXX), like elsewhere in this router
  const localRegex = /^6\d{7}$/;
  if (!localRegex.test(trimmed)) {
    return null;
  }
  return `+370${trimmed}`;
}

function generateToken(bytes = 16) {
  return crypto.randomBytes(bytes).toString("hex");
}

// Send Winter Promotion SMS with dynamic links (POST body or query)
router.post("/winter-promotion", async (req, res) => {
  try {
    const phoneNumber =
      (req.body && req.body.phoneNumber) ||
      (req.query && req.query.phoneNumber);
    if (!phoneNumber) {
      return res.status(400).json({ error: "phoneNumber is required" });
    }
    const phoneE164 = normalizeLtPhone(phoneNumber);
    if (!phoneE164) {
      return res.status(400).json({ error: "Invalid phone format. Expected 8 digits starting with 6." });
    }

    const base = buildBaseUrl(req); // e.g. https://api.it112.lt
    const tokenBook = generateToken(16);
    const tokenStop = generateToken(16);
    // Booking now points to WordPress page with the token
    const bookUrl = `https://it112.lt/ziemos-akcija?t=${tokenBook}`;
    // Stop now also points to the same WordPress page (stop flow)
    const stopUrl = `https://it112.lt/ziemos-akcija?stop=${tokenStop}`;

    const messageBody = `Sveiki! Primename apie žiemos PC profilaktiką: dulkių valymas, aušinimo patikra, termopastos būklė. Vietų skaičius ribotas. Registracija: ${bookUrl} Atsisakyti: ${stopUrl}`;

    let msg;
    try {
      msg = await client.messages.create({
        body: messageBody,
        from: "IT112",
        to: phoneE164,
        shortenUrls: true,
      });
    } catch (twilioError) {
      console.error("Twilio error:", twilioError);
      return res.status(502).json({
        error: "Upstream SMS provider error",
        details: twilioError?.message || "unknown",
      });
    }

    const promo = new Promotion({
      phoneRaw: String(phoneNumber).trim(),
      phoneE164,
      message: messageBody,
      messageSid: msg.sid || null,
      tokenBook,
      tokenStop,
      bookUrl,
      stopUrl,
      status: "sent",
      sentAt: new Date(),
    });
    await promo.save();

    res.status(200).json({
      success: true,
      message: "Promotion sent",
      sid: msg.sid || null,
      bookUrl,
      stopUrl,
    });
  } catch (error) {
    console.error("Error sending winter promotion:", error);
    if (error.code === 11000) {
      return res.status(409).json({ error: "Token collision. Please retry." });
    }
    res.status(500).json({ error: "Failed to send winter promotion." });
  }
});

// Alternate GET endpoint with phone number as a path param (exactly 8 digits)
router.get("/winter-promotion/:phoneNumber(\\d{8})", async (req, res) => {
  try {
    const phoneParam = req.params.phoneNumber;
    if (!phoneParam) {
      return res.status(400).json({ error: "phoneNumber is required" });
    }
    const phoneE164 = normalizeLtPhone(phoneParam);
    if (!phoneE164) {
      return res.status(400).json({ error: "Invalid phone format. Expected 8 digits starting with 6." });
    }

    const base = buildBaseUrl(req);
    const tokenBook = generateToken(16);
    const tokenStop = generateToken(16);
    // Booking now points to WordPress page with the token
    const bookUrl = `https://it112.lt/ziemos-akcija?t=${tokenBook}`;
    // Stop now also points to the same WordPress page (stop flow)
    const stopUrl = `https://it112.lt/ziemos-akcija?stop=${tokenStop}`;

    const messageBody = `Sveiki! Primename apie žiemos PC profilaktiką: dulkių valymas, aušinimo patikra, termopastos būklė. Vietų skaičius ribotas. Registracija: ${bookUrl} Atsisakyti: ${stopUrl}`;

    let msg;
    try {
      msg = await client.messages.create({
        body: messageBody,
        from: "IT112",
        to: phoneE164,
        shortenUrls: true,
      });
    } catch (twilioError) {
      console.error("Twilio error:", twilioError);
      return res.status(502).json({
        error: "Upstream SMS provider error",
        details: twilioError?.message || "unknown",
      });
    }

    const promo = new Promotion({
      phoneRaw: String(phoneParam).trim(),
      phoneE164,
      message: messageBody,
      messageSid: msg.sid || null,
      tokenBook,
      tokenStop,
      bookUrl,
      stopUrl,
      status: "sent",
      sentAt: new Date(),
    });
    await promo.save();

    res.status(200).json({
      success: true,
      message: "Promotion sent",
      sid: msg.sid || null,
      bookUrl,
      stopUrl,
    });
  } catch (error) {
    console.error("Error sending winter promotion (GET):", error);
    if (error.code === 11000) {
      return res.status(409).json({ error: "Token collision. Please retry." });
    }
    res.status(500).json({ error: "Failed to send winter promotion." });
  }
});

// Verify booking token (JSON API for WordPress page)
router.get("/winter-promotion/book/verify", async (req, res) => {
  try {
    const token = req.query.token || req.query.t;
    if (!token || typeof token !== "string" || token.trim().length === 0) {
      return res.status(400).json({ ok: false, error: "Missing token" });
    }
    const promo = await Promotion.findOne({ tokenBook: token.trim() }).select(
      "status bookedAt stoppedAt createdAt"
    );
    if (!promo) {
      return res.status(404).json({ ok: false, error: "Invalid token" });
    }
    const alreadyBooked = promo.status === "booked";
    const isStopped = promo.status === "stopped";
    return res.status(200).json({
      ok: true,
      status: promo.status,
      alreadyBooked,
      isStopped,
      createdAt: promo.createdAt,
      bookedAt: promo.bookedAt,
      stoppedAt: promo.stoppedAt,
    });
  } catch (err) {
    console.error("Verify token error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

// Confirm booking token (JSON API for WordPress page)
router.post("/winter-promotion/book/confirm", async (req, res) => {
  try {
    const token = (req.body && req.body.token) || (req.query && req.query.token);
    if (!token || typeof token !== "string" || token.trim().length === 0) {
      return res.status(400).json({ ok: false, error: "Missing token" });
    }
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip;
    const ua = req.get("user-agent") || null;

    const promo = await Promotion.findOne({ tokenBook: token.trim() });
    if (!promo) {
      return res.status(404).json({ ok: false, error: "Invalid token" });
    }
    if (promo.status === "stopped") {
      return res
        .status(409)
        .json({ ok: false, error: "This recipient has opted out" });
    }
    promo.status = "booked";
    promo.bookedAt = promo.bookedAt || new Date();
    promo.lastIp = ip;
    promo.lastUserAgent = ua;
    await promo.save();
    return res.status(200).json({ ok: true, status: promo.status });
  } catch (err) {
    console.error("Confirm token error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

// Verify stop token (JSON API for WordPress page)
router.get("/winter-promotion/stop/verify", async (req, res) => {
  try {
    const token = req.query.token || req.query.stop;
    if (!token || typeof token !== "string" || token.trim().length === 0) {
      return res.status(400).json({ ok: false, error: "Missing token" });
    }
    const promo = await Promotion.findOne({ tokenStop: token.trim() }).select(
      "status bookedAt stoppedAt createdAt"
    );
    if (!promo) {
      return res.status(404).json({ ok: false, error: "Invalid token" });
    }
    const isStopped = promo.status === "stopped";
    return res.status(200).json({
      ok: true,
      status: promo.status,
      isStopped,
      createdAt: promo.createdAt,
      bookedAt: promo.bookedAt,
      stoppedAt: promo.stoppedAt,
    });
  } catch (err) {
    console.error("Verify stop token error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

// Confirm stop token (JSON API for WordPress page)
router.post("/winter-promotion/stop/confirm", async (req, res) => {
  try {
    const token = (req.body && req.body.token) || (req.query && req.query.token);
    if (!token || typeof token !== "string" || token.trim().length === 0) {
      return res.status(400).json({ ok: false, error: "Missing token" });
    }
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip;
    const ua = req.get("user-agent") || null;

    const promo = await Promotion.findOne({ tokenStop: token.trim() });
    if (!promo) {
      return res.status(404).json({ ok: false, error: "Invalid token" });
    }
    promo.status = "stopped";
    promo.stoppedAt = promo.stoppedAt || new Date();
    promo.lastIp = ip;
    promo.lastUserAgent = ua;
    await promo.save();
    return res.status(200).json({ ok: true, status: promo.status });
  } catch (err) {
    console.error("Confirm stop token error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

// Booking link hit → record acceptance and redirect
router.get("/winter-promotion/book/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip;
    const ua = req.get("user-agent") || null;

    const promo = await Promotion.findOne({ tokenBook: token });
    if (promo) {
      // Only flip to booked if not stopped already
      if (promo.status !== "stopped") {
        promo.status = "booked";
      }
      promo.bookedAt = promo.bookedAt || new Date();
      promo.lastIp = ip;
      promo.lastUserAgent = ua;
      await promo.save();
    }
    res.redirect(302, "https://it112.lt/ziemos-akcija");
  } catch (error) {
    console.error("Book URL error:", error);
    res.redirect(302, "https://it112.lt/ziemos-akcija");
  }
});

// Stop link hit → record opt-out and redirect
router.get("/winter-promotion/stop/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip;
    const ua = req.get("user-agent") || null;

    const promo = await Promotion.findOne({ tokenStop: token });
    if (promo) {
      promo.status = "stopped";
      promo.stoppedAt = promo.stoppedAt || new Date();
      promo.lastIp = ip;
      promo.lastUserAgent = ua;
      await promo.save();
    }
    res.redirect(302, "https://it112.lt/atsaukimas");
  } catch (error) {
    console.error("Stop URL error:", error);
    res.redirect(302, "https://it112.lt/atsaukimas");
  }
});

// Admin: list promotion records (requires auth)
router.get("/winter-promotion/records", async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));

    const query = {};
    if (status && ["sent", "booked", "stopped"].includes(status)) {
      query.status = status;
    }

    const [items, total] = await Promise.all([
      Promotion.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .select(
          "phoneRaw phoneE164 status sentAt bookedAt stoppedAt messageSid createdAt updatedAt"
        ),
      Promotion.countDocuments(query),
    ]);

    res.status(200).json({
      items,
      pagination: {
        total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: pageNumber,
        pageSize: items.length,
      },
    });
  } catch (error) {
    console.error("List promotions error:", error);
    res.status(500).json({ error: "Failed to list promotions." });
  }
});

// Export unique 8-character numbers for services paid more than 6 months ago
// router.post("/numbers/export-old-paid", async (req, res) => {
//   try {
//     const { filename } = req.body || {};

//     const cutoffDate = new Date();
//     cutoffDate.setMonth(cutoffDate.getMonth() - 6);

//     const services = await Service.find({
//       paidDate: { $exists: true, $lte: cutoffDate },
//     }).select("number");

//     const uniqueNumbers = new Set();
//     for (const svc of services) {
//       const num = typeof svc.number === "string" ? svc.number.trim() : "";
//       if (num && num.length === 8) {
//         uniqueNumbers.add(num);
//       }
//     }

//     const numbersArr = Array.from(uniqueNumbers);

//     const uploadsDir = path.join(__dirname, "..", "uploads");
//     if (!fs.existsSync(uploadsDir)) {
//       fs.mkdirSync(uploadsDir, { recursive: true });
//     }

//     const outName =
//       typeof filename === "string" && filename.trim() !== ""
//         ? filename.trim()
//         : `old-paid-numbers-${Date.now()}.txt`;
//     const filePath = path.join(uploadsDir, outName);

//     fs.writeFileSync(filePath, numbersArr.join("\n"), "utf8");

//     res.status(200).json({
//       message: "Export completed",
//       count: numbersArr.length,
//       file: outName,
//       path: filePath,
//     });
//   } catch (error) {
//     console.error("Error exporting numbers:", error);
//     res.status(500).send({ error: "Failed to export numbers." });
//   }
// });

router.post("/accept", verify, async (req, res) => {
  try {
    const { serviceId, phoneNumber } = req.body;

    if (!serviceId || !phoneNumber) {
      return res.status(400).send({ error: "Missing required parameters." });
    }

    const phoneNumberRegex = /^6\d{7}$/; // Ensures phone number starts with 6 and has exactly 8 digits

    if (!phoneNumberRegex.test(phoneNumber)) {
      return res.status(400).send({
        error:
          "Invalid phone number. It should start with 6 and contain 8 digits.",
      });
    }

    // Construct the phone number with a plus sign (assuming country code is needed)
    const formattedPhoneNumber = `+370${phoneNumber}`;
    const bodyMessage = `Sveiki, Jūsų įrenginys (Nr. ${serviceId}) yra sėkmingai užregistruotas. Tel.: +37065804435`;

    // Send message using Twilio
    const messageResponse = await client.messages.create({
      body: bodyMessage, // Customize the message body here
      from: "IT112", // Your Twilio phone number
      to: formattedPhoneNumber,
    });

    if (messageResponse.sid) {
      const commentData = {
        serviceId,
        comment: `Išsiųsta priėmimo žinutė numeriu: ${formattedPhoneNumber}`,
        createdBy: "system", // Assuming req.user contains the authenticated user's info
        isPublic: true,
      };

      await createComment(commentData);
    }

    res.status(200).send({
      success: true,
      message: "Message sent successfully",
      sid: messageResponse.sid, // Twilio message SID
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).send({ error: "Failed to send message." });
  }
});

router.post("/pick-up", async (req, res) => {
  try {
    const { serviceId, phoneNumber } = req.body;

    if (!serviceId || !phoneNumber) {
      return res.status(400).send({ error: "Missing required parameters." });
    }

    const phoneNumberRegex = /^6\d{7}$/; // Ensures phone number starts with 6 and has exactly 8 digits

    if (!phoneNumberRegex.test(phoneNumber)) {
      return res.status(400).send({
        error:
          "Invalid phone number. It should start with 6 and contain 8 digits.",
      });
    }

    const service = await Service.findOne({ id: serviceId });

    if (!service) {
      return res.status(400).send({ error: "Nerastas servisas" });
    }

    const price = service.price;

    // Construct the phone number with a plus sign (assuming country code is needed)
    const formattedPhoneNumber = `+370${phoneNumber}`;
    const bodyMessage = `Jūsų įrenginys (Nr. ${serviceId}) yra sutaisytas. Remonto kaina ${price}€. Atsiimti galite adresu Kalvarijų g. 2, Vilnius. I-V 9-18h`;

    // Send message using Twilio
    const messageResponse = await client.messages.create({
      body: bodyMessage, // Customize the message body here
      from: "IT112", // Your Twilio phone number
      to: formattedPhoneNumber,
    });

    if (messageResponse.sid) {
      const commentData = {
        serviceId,
        comment: `Išsiųsta žinutė informuojanti apie pasiėmimą: ${formattedPhoneNumber}`,
        createdBy: "system", // Assuming req.user contains the authenticated user's info
        isPublic: true,
      };

      await createComment(commentData);
    }

    res.status(200).send({
      success: true,
      message: "Message sent successfully",
      sid: messageResponse.sid, // Twilio message SID
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).send({ error: "Failed to send message." });
  }
});

module.exports = router;
