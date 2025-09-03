const express = require("express");
const { authMiddleware } = require("../middleware/auth.middleware");
const boardController = require("../controllers/board.controller");

const router = express.Router();

router.post("/", authMiddleware, boardController.createBoard);
router.get("/:projectId", authMiddleware, boardController.getBoards);
router.patch("/:boardId", authMiddleware, boardController.updateBoard);
router.delete("/:boardId", authMiddleware, boardController.deleteBoard);

module.exports = router;