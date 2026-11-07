const express = require("express");
const Course = require("../models/Course");
const Category = require("../models/Category");
const Review = require("../models/Review");
const { ApiError, requireDatabase } = require("../middleware/errors");

const router = express.Router();
router.use(requireDatabase);

router.get("/categories", async (_req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();
  return res.json({ data: categories });
});

router.get("/", async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(48, Math.max(1, Number.parseInt(req.query.limit, 10) || 12));
  const filter = { status: "published" };

  if (typeof req.query.category === "string" && req.query.category.trim()) filter.category = req.query.category.trim();
  if (typeof req.query.level === "string" && ["Beginner", "Intermediate", "Advanced", "All levels"].includes(req.query.level)) {
    filter.level = req.query.level;
  }
  if (typeof req.query.search === "string" && req.query.search.trim()) {
    filter.$text = { $search: req.query.search.trim().slice(0, 100) };
  }

  const [items, total] = await Promise.all([
    Course.find(filter)
      .populate("instructor", "name avatarUrl")
      .populate("lessons", "durationSeconds")
      .sort({ enrollmentCount: -1, publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Course.countDocuments(filter),
  ]);
  return res.json({
    data: items.map((item) => ({ ...item, id: item.slug })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

router.get("/:slug", async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug, status: "published" })
    .populate("instructor", "name avatarUrl bio")
    .populate({ path: "lessons", select: "title durationSeconds order isPreview", options: { sort: { order: 1 } } })
    .lean();
  if (!course) throw new ApiError(404, "We couldn't find that class.");

  const [reviews, reviewCount] = await Promise.all([
    Review.find({ course: course._id, isPublished: true })
      .populate("student", "name avatarUrl")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    Review.countDocuments({ course: course._id, isPublished: true }),
  ]);
  return res.json({ data: { ...course, id: course.slug, reviews, reviewCount } });
});

module.exports = router;
