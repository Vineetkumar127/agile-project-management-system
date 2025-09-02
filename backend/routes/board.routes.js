const express = require("express");
const { createBoard, getBoards } = require("../controllers/board.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { validateBoard } = require("../middleware/validate.middleware");

const router = express.Router();

// Only logged-in users can create/get boards
router.post("/", authMiddleware, validateBoard, createBoard);
router.get("/", authMiddleware, getBoards);

module.exports = router;
