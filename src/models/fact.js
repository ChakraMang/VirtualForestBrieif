const mongoose = require('mongoose');

const factSchema = new mongoose.Schema({
  factNumber: { type: Number },
  factText: { type: String, required: true },
});

module.exports = mongoose.model('Fact', factSchema);