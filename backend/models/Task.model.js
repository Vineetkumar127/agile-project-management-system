// models/Task.model.js
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },

  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },

  status: { type: String, required: true, enum: ["todo", "in-progress", "done"], default: "todo" },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },

  // assignee is now a reference to User model
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  dueDate: { type: Date },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

taskSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Task", taskSchema);
