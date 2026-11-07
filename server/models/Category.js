const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true, maxlength: 60 },
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
  description: { type: String, maxlength: 300, default: "" },
  imageUrl: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.models.Category || mongoose.model("Category", categorySchema);
