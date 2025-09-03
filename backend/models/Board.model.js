const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Project", 
    required: true 
  },
  type: { 
    type: String, 
    enum: ["kanban", "scrum"], 
    default: "kanban" 
  },
  columns: [
    {
      id: { type: String, required: true },        // unique id for column (frontend generate karega)
      name: { type: String, required: true },      // e.g. "To Do", "In Progress", "Done"
      statusKey: { type: String, required: true }  // unique key for tracking tasks
    }
  ]
});

module.exports = mongoose.model("Board", boardSchema);
