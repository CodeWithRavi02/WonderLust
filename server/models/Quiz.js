const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  prompt: { type: String, required: true, maxlength: 1000 },
  choices: [{ type: String, required: true, maxlength: 500 }],
  correctChoice: { type: Number, min: 0, required: true },
  explanation: { type: String, maxlength: 1000, default: "" },
}, { _id: true });

const quizSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", default: null },
  title: { type: String, required: true, trim: true, maxlength: 140 },
  questions: { type: [questionSchema], default: [] },
  passingScore: { type: Number, min: 0, max: 100, default: 70 },
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
