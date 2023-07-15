const mongoose = require('mongoose');
const SeedStages = require('../constants/Seed.Stages');
const SeedStatus = require('../constants/Seed.Status');

const seedSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  plantingDate: { type: Date, default: Date.now },
  status: { type: String, enum: [SeedStatus.PLANTED, SeedStatus.FULLY_GROWN, SeedStatus.DEAD], default: SeedStatus.PLANTED },
  stage: { type: String, enum: [SeedStages.SEED, SeedStages.SAPLING, SeedStages.TREE]},
  growthDays: { type: Number, default: 0 },
  location: { type: String, required: true},
  lastWateredAt: { type: Date},
});

module.exports = mongoose.model('Seed', seedSchema);