const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", default: null },
  title: { type: String, required: true, trim: true, maxlength: 140 },
  instructions: { type: String, required: true, maxlength: 5000 },
  dueAt: { type: Date, default: null },
  maxScore: { type: Number, min: 1, default: 100 },
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.models.Assignment || mongoose.model("Assignment", assignmentSchema);
