const Project = require("../models/Project.model");   // ✅ Capital P
const validation = require("../utils/validation");

// Create Project
exports.createProject = async (req, res) => {
  try {
    const data = req.body;

    if (!validation.isValidRequestBody(data)) {
      return res.status(400).send({ status: false, message: "Project data is required" });
    }

    const { name, key, description, orgId } = data;

    if (!validation.isValid(name)) {
      return res.status(400).send({ status: false, message: "Project name is required" });
    }
    if (!validation.isValid(key)) {
      return res.status(400).send({ status: false, message: "Project key is required" });
    }
    if (orgId && !validation.isValidObjectId(orgId)) {
      return res.status(400).send({ status: false, message: "Invalid orgId" });
    }

    const exist = await Project.findOne({ key });
    if (exist) {
      return res.status(400).send({ status: false, message: "Project key already exists" });
    }

    const project = await Project.create({ name, key, description, orgId });
    return res.status(201).send({ status: true, message: "Project created successfully", data: project });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// Get All Projects
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    if (projects.length === 0) {
      return res.status(404).send({ status: false, message: "No projects found" });
    }
    return res.status(200).send({ status: true, count: projects.length, data: projects });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//  Get Project by ID
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validation.isValidObjectId(id)) {
      return res.status(400).send({ status: false, message: "Invalid project id" });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).send({ status: false, message: "Project not found" });
    }

    return res.status(200).send({ status: true, data: project });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// Update Project
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!validation.isValidObjectId(id)) {
      return res.status(400).send({ status: false, message: "Invalid project id" });
    }

    if (!validation.isValidRequestBody(data)) {
      return res.status(400).send({ status: false, message: "Update data is required" });
    }

    const { name, key, description, archived } = data;

    if (key) {
      const exist = await Project.findOne({ key, _id: { $ne: id } });
      if (exist) {
        return res.status(400).send({ status: false, message: "Project key already exists" });
      }
    }

    const updated = await Project.findByIdAndUpdate(id, { name, key, description, archived }, { new: true });

    if (!updated) {
      return res.status(404).send({ status: false, message: "Project not found" });
    }

    return res.status(200).send({ status: true, message: "Project updated successfully", data: updated });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// Delete Project
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validation.isValidObjectId(id)) {
      return res.status(400).send({ status: false, message: "Invalid project id" });
    }

    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).send({ status: false, message: "Project not found" });
    }

    return res.status(200).send({ status: true, message: "Project deleted successfully" });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
