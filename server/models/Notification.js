const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, enum: ["course", "payment", "assignment", "message", "platform"], required: true },
  title: { type: String, required: true, maxlength: 140 },
  message: { type: String, required: true, maxlength: 1000 },
  link: { type: String, default: "" },
  readAt: { type: Date, default: null },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, createdAt: -1 });
module.exports = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
