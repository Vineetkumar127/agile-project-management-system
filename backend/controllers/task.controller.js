// controllers/task.controller.js
const Task = require("../models/Task.model");
const User = require("../models/User.model");
const Board = require("../models/Board.model");
const Project = require("../models/Project.model");
const History = require("../models/History.model");
const validation = require("../utils/validation");

// CREATE TASK
exports.createTask = async (req, res) => {
  try {
    if (!validation.isValidRequestBody(req.body)) {
      return res.status(400).send({ status: false, message: "Task data required" });
    }

    let { boardId, projectId, title, description, status, priority, assignee, dueDate } = req.body;

    // basic checks
    if (!validation.isValidObjectId(boardId)) return res.status(400).send({ status: false, message: "Valid boardId required" });
    if (!validation.isValidObjectId(projectId)) return res.status(400).send({ status: false, message: "Valid projectId required" });
    if (!validation.isValid(title)) return res.status(400).send({ status: false, message: "Title is required" });

    // ensure board exists and belongs to project (optional check)
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).send({ status: false, message: "Board not found" });
    if (String(board.projectId) !== String(projectId)) {
      return res.status(400).send({ status: false, message: "Board does not belong to the given projectId" });
    }

    // status & priority validation
    if (status && !["todo", "in-progress", "done"].includes(status)) return res.status(400).send({ status: false, message: "Invalid status" });
    if (priority && !["low", "medium", "high"].includes(priority)) return res.status(400).send({ status: false, message: "Invalid priority" });

    // assignee validation (optional)
    if (assignee) {
      if (!validation.isValidObjectId(assignee)) return res.status(400).send({ status: false, message: "Invalid assignee id" });
      const user = await User.findById(assignee);
      if (!user) return res.status(404).send({ status: false, message: "Assignee (user) not found" });
    }

    const task = await Task.create({
      boardId,
      projectId,
      title: title.trim(),
      description,
      status: status || "todo",
      priority: priority || "medium",
      assignee: assignee || null,
      dueDate: dueDate || null
    });

    return res.status(201).send({ status: true, message: "Task created", data: task });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// GET TASKS BY BOARD
exports.getTasksByBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    if (!validation.isValidObjectId(boardId)) return res.status(400).send({ status: false, message: "Invalid boardId" });

    const tasks = await Task.find({ boardId }).populate("assignee", "name email");
    return res.status(200).send({ status: true, count: tasks.length, data: tasks });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// UPDATE TASK (partial updates only) — logs history entries
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId || (req.user && req.user.id); // auth middleware must set req.userId

    if (!validation.isValidObjectId(taskId)) return res.status(400).send({ status: false, message: "Invalid taskId" });
    if (!validation.isValidRequestBody(req.body)) return res.status(400).send({ status: false, message: "Update data required" });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).send({ status: false, message: "Task not found" });

    const { title, description, status, priority, assignee, dueDate } = req.body;
    const updateData = {};
    const historyEntries = [];

    // title
    if (typeof title !== "undefined" && title !== task.title) {
      historyEntries.push({ taskId, userId: userId || null, field: "title", oldValue: task.title, newValue: title });
      updateData.title = title.trim();
    }

    // description
    if (typeof description !== "undefined" && description !== task.description) {
      historyEntries.push({ taskId, userId: userId || null, field: "description", oldValue: task.description, newValue: description });
      updateData.description = description;
    }

    // status
    if (typeof status !== "undefined") {
      if (!["todo", "in-progress", "done"].includes(status)) return res.status(400).send({ status: false, message: "Invalid status" });
      if (status !== task.status) {
        historyEntries.push({ taskId, userId: userId || null, field: "status", oldValue: task.status, newValue: status });
        updateData.status = status;
      }
    }

    // priority
    if (typeof priority !== "undefined") {
      if (!["low", "medium", "high"].includes(priority)) return res.status(400).send({ status: false, message: "Invalid priority" });
      if (priority !== task.priority) {
        historyEntries.push({ taskId, userId: userId || null, field: "priority", oldValue: task.priority, newValue: priority });
        updateData.priority = priority;
      }
    }

    // assignee
    if (typeof assignee !== "undefined") {
      if (assignee) {
        if (!validation.isValidObjectId(assignee)) return res.status(400).send({ status: false, message: "Invalid assignee id" });
        const user = await User.findById(assignee);
        if (!user) return res.status(404).send({ status: false, message: "Assignee not found" });
      }
      if (String(task.assignee) !== String(assignee)) {
        historyEntries.push({ taskId, userId: userId || null, field: "assignee", oldValue: task.assignee, newValue: assignee || null });
        updateData.assignee = assignee || null;
      }
    }

    // dueDate
    if (typeof dueDate !== "undefined" && String(dueDate) !== String(task.dueDate)) {
      historyEntries.push({ taskId, userId: userId || null, field: "dueDate", oldValue: task.dueDate, newValue: dueDate });
      updateData.dueDate = dueDate;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).send({ status: false, message: "No valid changes provided" });
    }

    updateData.updatedAt = Date.now();
    const updated = await Task.findByIdAndUpdate(taskId, updateData, { new: true });

    // insert history entries (if you have History model)
    if (historyEntries.length > 0) {
      await History.insertMany(historyEntries);
    }

    return res.status(200).send({ status: true, message: "Task updated", data: updated });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// DELETE TASK
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    if (!validation.isValidObjectId(taskId)) return res.status(400).send({ status: false, message: "Invalid taskId" });

    const deleted = await Task.findByIdAndDelete(taskId);
    if (!deleted) return res.status(404).send({ status: false, message: "Task not found" });

    return res.status(200).send({ status: true, message: "Task deleted" });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
