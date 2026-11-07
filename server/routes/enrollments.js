const express = require("express");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { requireAuth, requireRole } = require("../middleware/auth");
const { ApiError, requireDatabase } = require("../middleware/errors");

const router = express.Router();
router.use(requireDatabase, requireAuth, requireRole("student"));

router.get("/", async (req, res) => {
  const items = await Enrollment.find({ student: req.user._id })
    .populate({
      path: "course",
      select: "title slug category level thumbnailUrl instructor price currency lessons",
      populate: { path: "instructor", select: "name avatarUrl" },
    })
    .sort({ lastAccessedAt: -1 })
    .lean();
  return res.json({ data: items });
});

router.post("/", async (req, res) => {
  const { courseId } = req.body;
  if (typeof courseId !== "string" || !courseId.trim()) throw new ApiError(400, "A class is required to enroll.");

  const course = await Course.findOne({ slug: courseId.trim(), status: "published" }).select("_id price");
  if (!course) throw new ApiError(404, "We couldn't find that class.");
  if (course.price > 0) {
    throw new ApiError(402, "This class requires payment. Configure a payment provider before enrolling.");
  }

  const existing = await Enrollment.findOne({ student: req.user._id, course: course._id });
  if (existing) return res.status(200).json({ data: existing, message: "You're already enrolled in this class." });

  const enrollment = await Enrollment.create({ student: req.user._id, course: course._id });
  await Course.updateOne({ _id: course._id }, { $inc: { enrollmentCount: 1 } });
  return res.status(201).json({ data: enrollment });
});

module.exports = router;
