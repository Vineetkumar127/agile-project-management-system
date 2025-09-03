const Board = require("../models/Board.model");
const Project = require("../models/Project.model");
const validation = require("../utils/validation");

// ================= CREATE BOARD =================
exports.createBoard = async (req, res) => {
  try {
    if (!validation.isValidRequestBody(req.body)) {
      return res.status(400).send({ status: false, message: "Request body is required" });
    }

    const { projectId, type, columns } = req.body;

    // ✅ projectId validation
    if (!validation.isValid(projectId) || !validation.isValidObjectId(projectId)) {
      return res.status(400).send({ status: false, message: "Valid projectId is required" });
    }
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).send({ status: false, message: "Project not found" });

    // ✅ type validation
    if (type && !["kanban", "scrum"].includes(type)) {
      return res.status(400).send({ status: false, message: "Board type must be either 'kanban' or 'scrum'" });
    }

    // ✅ columns validation
    if (!Array.isArray(columns) || columns.length === 0) {
      return res.status(400).send({ status: false, message: "At least one column is required" });
    }
    for (const col of columns) {
      if (!col.id || !col.name || !col.statusKey) {
        return res.status(400).send({ status: false, message: "Each column must have id, name, and statusKey" });
      }
    }

    const board = await Board.create({
      projectId,
      type: type || "kanban",
      columns
    });

    return res.status(201).send({ status: true, message: "Board created successfully", data: board });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// ================= GET ALL BOARDS BY PROJECT =================
exports.getBoards = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!validation.isValidObjectId(projectId)) {
      return res.status(400).send({ status: false, message: "Invalid projectId" });
    }

    const boards = await Board.find({ projectId });
    return res.status(200).send({ status: true, count: boards.length, data: boards });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// ================= UPDATE BOARD =================
exports.updateBoard = async (req, res) => {
  try {
    const { boardId } = req.params;

    if (!validation.isValidObjectId(boardId)) {
      return res.status(400).send({ status: false, message: "Invalid boardId" });
    }

    if (!validation.isValidRequestBody(req.body)) {
      return res.status(400).send({ status: false, message: "Update data required" });
    }

    const { type, columns } = req.body;
    
    console.log(req.body)
    let updateData = {};
    if (type && !["kanban", "scrum"].includes(type)) {
      return res.status(400).send({ status: false, message: "Board type must be either 'kanban' or 'scrum'" });
    }
    if (type) updateData.type = type;

    if (columns) {
      if (!Array.isArray(columns) || columns.length === 0) {
        return res.status(400).send({ status: false, message: "Columns must be a non-empty array" });
      }
      for (const col of columns) {
        if (!col.id || !col.name || !col.statusKey) {
          return res.status(400).send({ status: false, message: "Each column must have id, name, and statusKey" });
        }
      }
      updateData.columns = columns;
    }

    const updated = await Board.findByIdAndUpdate(boardId, updateData, { new: true });
    if (!updated) return res.status(404).send({ status: false, message: "Board not found" });

    return res.status(200).send({ status: true, message: "Board updated", data: updated });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// ================= DELETE (Archive) BOARD =================
exports.deleteBoard = async (req, res) => {
  try {
    const { boardId } = req.params;

    if (!validation.isValidObjectId(boardId)) {
      return res.status(400).send({ status: false, message: "Invalid boardId" });
    }

    const deleted = await Board.findByIdAndDelete(boardId);
    if (!deleted) return res.status(404).send({ status: false, message: "Board not found" });

    return res.status(200).send({ status: true, message: "Board deleted successfully" });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
