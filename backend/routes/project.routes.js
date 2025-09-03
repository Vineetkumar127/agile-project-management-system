const express = require("express"); 
const { 
  createProject, 
  getProjects, 
  getProjectById, 
  updateProject, 
  deleteProject 
} = require("../controllers/project.controller");

const { authMiddleware } = require("../middleware/auth.middleware");
const { validateProject } = require("../middleware/validate.middleware");

const router = express.Router();

// ✅ Create Project (only logged-in + validated)
router.post("/", authMiddleware, validateProject, createProject);

// ✅ Get All Projects (only logged-in)
router.get("/", authMiddleware, getProjects);

// ✅ Get Project by ID
router.get("/:id", authMiddleware, getProjectById);

// ✅ Update Project
router.patch("/:id", authMiddleware, updateProject);

// ✅ Delete Project
router.delete("/:id", authMiddleware, deleteProject);

module.exports = router;
