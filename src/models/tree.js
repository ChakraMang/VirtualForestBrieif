const mongoose = require("mongoose");

const treeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  plantingDate: { type: Date, default: Date.now },
  location: {type: String},
  isMinted: { type: Boolean, default: false },
});

const Tree = mongoose.model("Tree", treeSchema);

module.exports = Tree;
