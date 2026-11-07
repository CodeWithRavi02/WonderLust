const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null },
  progressPercent: { type: Number, min: 0, max: 100, default: 0 },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
  enrolledAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
  lastAccessedAt: { type: Date, default: Date.now },
}, { timestamps: true });

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
module.exports = mongoose.models.Enrollment || mongoose.model("Enrollment", enrollmentSchema);
