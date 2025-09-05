// controllers/comment.controller.js
const Comment = require("../models/Comment.model");
const Task = require("../models/Task.model");
const validation = require("../utils/validation");

exports.createComment = async (req, res) => {
  try {
    // require authentication middleware to set req.userId
    const userId = req.userId || (req.user && req.user.id);
    if (!userId) return res.status(401).send({ status: false, message: "Unauthorized" });

    if (!validation.isValidRequestBody(req.body)) {
      return res.status(400).send({ status: false, message: "Request body is required" });
    }

    const { taskId, message } = req.body;
    if (!validation.isValid(taskId) || !validation.isValidObjectId(taskId)) {
      return res.status(400).send({ status: false, message: "Valid taskId is required" });
    }
    if (!validation.isValid(message)) {
      return res.status(400).send({ status: false, message: "Comment message is required" });
    }

    // ensure task exists
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).send({ status: false, message: "Task not found" });

    const comment = await Comment.create({
      taskId,
      userId,
      message: message.trim()
    });

    return res.status(201).send({ status: true, message: "Comment created", data: comment });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

exports.getCommentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    if (!validation.isValidObjectId(taskId)) {
      return res.status(400).send({ status: false, message: "Invalid taskId" });
    }

    const comments = await Comment.find({ taskId }).populate("userId", "name email");
    return res.status(200).send({ status: true, count: comments.length, data: comments });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const userId = req.userId || (req.user && req.user.id);
    if (!userId) return res.status(401).send({ status: false, message: "Unauthorized" });

    const { commentId } = req.params;
    if (!validation.isValidObjectId(commentId)) {
      return res.status(400).send({ status: false, message: "Invalid commentId" });
    }
    if (!validation.isValidRequestBody(req.body) || !validation.isValid(req.body.message)) {
      return res.status(400).send({ status: false, message: "Message is required to update" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).send({ status: false, message: "Comment not found" });

    // Only author can update
    if (String(comment.userId) !== String(userId)) {
      return res.status(403).send({ status: false, message: "Forbidden: not comment owner" });
    }

    comment.message = req.body.message.trim();
    await comment.save();

    return res.status(200).send({ status: true, message: "Comment updated", data: comment });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const userId = req.userId || (req.user && req.user.id);
    if (!userId) return res.status(401).send({ status: false, message: "Unauthorized" });

    const { commentId } = req.params;
    if (!validation.isValidObjectId(commentId)) {
      return res.status(400).send({ status: false, message: "Invalid commentId" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).send({ status: false, message: "Comment not found" });

    // Only author can delete (you may extend to project owners/admin)
    if (String(comment.userId) !== String(userId)) {
      return res.status(403).send({ status: false, message: "Forbidden: not comment owner" });
    }

    await Comment.findByIdAndDelete(commentId);
    return res.status(200).send({ status: true, message: "Comment deleted" });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
