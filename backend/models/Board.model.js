const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  type: { type: String, enum: ["kanban", "scrum"], default: "kanban" },
  columns: [
    { id: String, name: String, statusKey: String }
  ]
});

module.exports = mongoose.model("Board", boardSchema);
