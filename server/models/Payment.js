const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  provider: { type: String, enum: ["stripe", "razorpay"], required: true },
  providerPaymentId: { type: String, default: "" },
  amount: { type: Number, min: 0, required: true },
  currency: { type: String, uppercase: true, required: true },
  status: { type: String, enum: ["pending", "succeeded", "failed", "refunded"], default: "pending" },
  idempotencyKey: { type: String, required: true, unique: true },
  paidAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
