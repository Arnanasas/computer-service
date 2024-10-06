const router = require("express").Router();
const dotenv = require("dotenv");
const twilio = require("twilio");
const Service = require("../models/Service");
const verify = require("./auth/authVerify");

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const { createComment } = require("../services/commentService");

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

router.post("/pick-up", verify, async (req, res) => {
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
    const bodyMessage = `Jūsų įrenginys (Nr. ${serviceId}) yra sutaisytas. Remonto kaina ${price}€. Atsiimti galite adresu Kalvarijų g. 2, Vilnius. I-V 10-19h, IV 10-15h.`;

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
