const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    examTag: { type: String, default: null, trim: true },
    subjects: { type: [String], default: [] },
    memberCount: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

communitySchema.index({ name: 1 });
communitySchema.index({ examTag: 1 });

module.exports = mongoose.model("Community", communitySchema);
