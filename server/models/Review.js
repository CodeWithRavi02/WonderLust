const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, trim: true, maxlength: 2000, default: "" },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

reviewSchema.index({ student: 1, course: 1 }, { unique: true });
module.exports = mongoose.models.Review || mongoose.model("Review", reviewSchema);
