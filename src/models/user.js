const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  level: { type: Number, default: 1 },
  stage: { type: String },
  badges: { type: [], default: [] },
  walletAddress: { type: String },
  backgrounds: { type: [], default: [] },
  password: { type: String, required: true },
  friends: { type: [], default: [] },
  seedBag: { type: Number, default: 1 },
  manureBag: { type: Number, default: 0 },
  credits: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
  lastSeedCredited: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
});

module.exports = mongoose.model("User", userSchema);
