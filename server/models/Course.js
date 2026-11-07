const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 5, maxlength: 140 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  subtitle: { type: String, trim: true, maxlength: 180, default: "" },
  description: { type: String, required: true, maxlength: 10000 },
  outcomes: { type: [String], default: [] },
  category: { type: String, required: true, trim: true, index: true },
  level: { type: String, enum: ["Beginner", "Intermediate", "Advanced", "All levels"], default: "Beginner" },
  language: { type: String, default: "en" },
  thumbnailUrl: { type: String, default: "" },
  previewVideoUrl: { type: String, default: "" },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
  price: { type: Number, min: 0, default: 0 },
  currency: { type: String, uppercase: true, default: "USD" },
  status: { type: String, enum: ["draft", "submitted", "published", "archived"], default: "draft", index: true },
  publishedAt: { type: Date, default: null },
  ratingAverage: { type: Number, min: 0, max: 5, default: 0 },
  enrollmentCount: { type: Number, min: 0, default: 0 },
}, { timestamps: true });

courseSchema.index({ status: 1, publishedAt: -1 });
courseSchema.index({ title: "text", subtitle: "text", description: "text" });

module.exports = mongoose.models.Course || mongoose.model("Course", courseSchema);
