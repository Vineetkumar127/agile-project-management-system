exports.validateProject = (req, res, next) => {
  const { key, name } = req.body;
  if (!key || !name) {
    return res.status(400).json({ message: "Project key and name are required" });
  }
  next();
};

exports.validateBoard = (req, res, next) => {
  const { projectId, type } = req.body;
  if (!projectId) {
    return res.status(400).json({ message: "ProjectId is required" });
  }
  if (type && !["kanban", "scrum"].includes(type)) {
    return res.status(400).json({ message: "Board type must be kanban or scrum" });
  }
  next();
};
