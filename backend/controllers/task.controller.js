// controllers/task.controller.js
const Task = require("../models/Task.model");
const User = require("../models/User.model");
const Board = require("../models/Board.model");
const History = require("../models/History.model");
const validation = require("../utils/validation");


// ---------------- CREATE TASK ----------------
exports.createTask = async (req, res) => {
  try {
    if (!validation.isValidRequestBody(req.body)) {
      return res.status(400).send({ status: false, message: "Task data required" });
    }

    let { boardId, projectId, title, description, status, priority, assignee, dueDate } = req.body;

    // Basic validations
    if (!validation.isValidObjectId(boardId)) {
      return res.status(400).send({ status: false, message: "Valid boardId required" });
    }
    if (!validation.isValidObjectId(projectId)) {
      return res.status(400).send({ status: false, message: "Valid projectId required" });
    }
    if (!validation.isValid(title)) {
      return res.status(400).send({ status: false, message: "Title is required" });
    }

    // Status & Priority check
    if (status && !["todo", "in-progress", "done"].includes(status)) {
      return res.status(400).send({ status: false, message: "Invalid status" });
    }
    if (priority && !["low", "medium", "high"].includes(priority)) {
      return res.status(400).send({ status: false, message: "Invalid priority" });
    }

    // Assignee check (must be valid user if provided)
    if (assignee) {
      if (!validation.isValidObjectId(assignee)) {
        return res.status(400).send({ status: false, message: "Invalid assignee id" });
      }
      const user = await User.findById(assignee);
      if (!user) return res.status(404).send({ status: false, message: "Assignee (user) not found" });
    }

    // Save task
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


// ---------------- GET TASKS BY BOARD ----------------
exports.getTasksByBoard = async (req, res) => {
  try {
    const { boardId } = req.params;

    if (!validation.isValidObjectId(boardId)) {
      return res.status(400).send({ status: false, message: "Invalid boardId" });
    }

    const tasks = await Task.find({ boardId }).populate("assignee", "name email");
    return res.status(200).send({ status: true, count: tasks.length, data: tasks });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};


// ---------------- UPDATE TASK ----------------
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId; // from auth middleware

    if (!validation.isValidObjectId(taskId)) {
      return res.status(400).send({ status: false, message: "Invalid taskId" });
    }
    if (!validation.isValidRequestBody(req.body)) {
      return res.status(400).send({ status: false, message: "Update data required" });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).send({ status: false, message: "Task not found" });

    const { title, description, status, priority, assignee, dueDate } = req.body;
    const updateData = {};
    const historyEntries = [];

    // Title update
    if (title && title !== task.title) {
      historyEntries.push({ taskId, userId, field: "title", oldValue: task.title, newValue: title });
      updateData.title = title.trim();
    }

    // Description update
    if (description && description !== task.description) {
      historyEntries.push({ taskId, userId, field: "description", oldValue: task.description, newValue: description });
      updateData.description = description.trim();
    }

    // Status update
    if (status) {
      if (!["todo", "in-progress", "done"].includes(status)) {
        return res.status(400).send({ status: false, message: "Invalid status" });
      }
      if (status !== task.status) {
        historyEntries.push({ taskId, userId, field: "status", oldValue: task.status, newValue: status });
        updateData.status = status;
      }
    }

    // Priority update
    if (priority) {
      if (!["low", "medium", "high"].includes(priority)) {
        return res.status(400).send({ status: false, message: "Invalid priority" });
      }
      if (priority !== task.priority) {
        historyEntries.push({ taskId, userId, field: "priority", oldValue: task.priority, newValue: priority });
        updateData.priority = priority;
      }
    }

    // Assignee update
    if (assignee) {
      if (!validation.isValidObjectId(assignee)) {
        return res.status(400).send({ status: false, message: "Invalid assignee id" });
      }
      const user = await User.findById(assignee);
      if (!user) return res.status(404).send({ status: false, message: "Assignee not found" });

      if (String(task.assignee) !== String(assignee)) {
        historyEntries.push({ taskId, userId, field: "assignee", oldValue: task.assignee, newValue: assignee });
        updateData.assignee = assignee;
      }
    }

    // DueDate update
    if (dueDate && dueDate !== task.dueDate) {
      historyEntries.push({ taskId, userId, field: "dueDate", oldValue: task.dueDate, newValue: dueDate });
      updateData.dueDate = dueDate;
    }

    // Nothing to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).send({ status: false, message: "No valid changes provided" });
    }

    updateData.updatedAt = Date.now();
    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, { new: true });

    // Save history logs
    if (historyEntries.length > 0) {
      await History.insertMany(historyEntries);
    }

    return res.status(200).send({ status: true, message: "Task updated", data: updatedTask });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};


// ---------------- DELETE TASK ----------------
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!validation.isValidObjectId(taskId)) {
      return res.status(400).send({ status: false, message: "Invalid taskId" });
    }

    const deleted = await Task.findByIdAndDelete(taskId);
    if (!deleted) return res.status(404).send({ status: false, message: "Task not found" });

    return res.status(200).send({ status: true, message: "Task deleted" });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
