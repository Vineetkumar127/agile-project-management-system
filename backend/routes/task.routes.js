const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth.middleware");
const taskController = require("../controllers/task.controller");

// Only logged-in users can access
router.post("/", authMiddleware, taskController.createTask);
router.get("/:boardId", authMiddleware, taskController.getTasksByBoard);
router.patch("/:taskId", authMiddleware, taskController.updateTask);
router.delete("/:taskId", authMiddleware, taskController.deleteTask);

module.exports = router;
