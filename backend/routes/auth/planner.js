const verify = require("./authVerify");
const Service = require("../../models/Service");

const router = require("express").Router();

const PLANNABLE_STATUSES = [
  "Neišsiųsta",
  "Taisoma vietoje",
  "Taisoma kitur",
  // "Sutaisyta, pranešta",
];

router.get("/services", verify, async (req, res) => {
  try {
    const { from, to } = req.query;

    const baseQuery = {
      isDeleted: { $ne: true },
      status: { $in: PLANNABLE_STATUSES },
    };

    const dateClause =
      from && to
        ? {
            $or: [
              { plannedDate: null },
              { plannedDate: { $gte: new Date(from), $lte: new Date(to) } },
            ],
          }
        : {};

    const services = await Service.find({ ...baseQuery, ...dateClause })
      .select("id name number deviceModel failure status plannedDate")
      .lean();

    res.json({ services });
  } catch (err) {
    console.error("planner GET error", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/services/:id/plan", verify, async (req, res) => {
  try {
    const { plannedDate } = req.body;
    const next = plannedDate ? new Date(plannedDate) : null;
    if (plannedDate && Number.isNaN(next.getTime())) {
      return res.status(400).json({ message: "Invalid plannedDate" });
    }

    const updated = await Service.findOneAndUpdate(
      { id: req.params.id, isDeleted: { $ne: true } },
      { $set: { plannedDate: next } },
      { new: true },
    ).select("id plannedDate status");

    if (!updated) return res.status(404).json({ message: "Service not found" });

    res.json({ service: updated });
  } catch (err) {
    console.error("planner PATCH error", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
