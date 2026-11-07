const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 140 },
  description: { type: String, maxlength: 3000, default: "" },
  videoUrl: { type: String, default: "" },
  resourceUrls: [{ type: String }],
  durationSeconds: { type: Number, min: 0, default: 0 },
  order: { type: Number, min: 0, default: 0 },
  isPreview: { type: Boolean, default: false },
}, { timestamps: true });

lessonSchema.index({ course: 1, order: 1 });
module.exports = mongoose.models.Lesson || mongoose.model("Lesson", lessonSchema);
