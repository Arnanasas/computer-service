const Service = require("../models/Service");
const router = require("express").Router();
const verify = require("./auth/authVerify");

router.put("/save-signature/:id", verify, async (req, res) => {
  const serviceId = req.params.id;
  const { signature } = req.body;

  try {
    const service = await Service.findOneAndUpdate(
      { id: serviceId },
      {
        $set: {
          signature: signature,
          isSigned: true,
        },
      },
      { new: true } // Return the updated document
    );

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({ message: "Signature updated", service });
  } catch (error) {
    res.status(500).json({ message: "Error updating signature", error });
  }
});

router.get("/get-signature/:serviceId", async (req, res) => {
  const { serviceId } = req.params;

  try {
    const service = await Service.findOne({ id: serviceId }, "signature");

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({ signature: service.signature });
  } catch (error) {
    res.status(500).json({ message: "Error fetching signature", error });
  }
});

module.exports = router;
