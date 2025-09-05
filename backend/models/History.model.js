// models/History.model.js
const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // who made the change
  field: { type: String, required: true }, // e.g. "status"
  oldValue: { type: mongoose.Schema.Types.Mixed },
  newValue: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("History", historySchema);
