// models/project.model.js
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  orgId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Organization" 
  }, // optional for now
  key: { 
    type: String, 
    required: true, 
    unique: true 
  }, // e.g. JIRA key like "ACME"
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  archived: { 
    type: Boolean, 
    default: false 
  }
});

module.exports = mongoose.model("Project", projectSchema);
