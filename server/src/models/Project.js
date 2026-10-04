const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, default: "General", trim: true },
    requiredSkills: [String],
    requiredRoles: [String],
    technologies: [String],
    availability: { type: String, default: "any" },
    experienceLevel: { type: String, enum: ["any", "beginner", "intermediate", "advanced"], default: "any" },
    status: { type: String, enum: ["open", "in-progress", "completed"], default: "open" },
    isPublic: { type: Boolean, default: false }, // used by the portfolio page later
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, default: "Member" },
      },
    ],
    joinRequests: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        message: { type: String, default: "" },
        status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);