// routes/comment.routes.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth.middleware");
const commentController = require("../controllers/comment.controller");

router.post("/", authMiddleware, commentController.createComment);
router.get("/:taskId", authMiddleware, commentController.getCommentsByTask);
router.patch("/:commentId", authMiddleware, commentController.updateComment);
router.delete("/:commentId", authMiddleware, commentController.deleteComment);

module.exports = router;
