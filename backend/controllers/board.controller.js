const Board = require("../models/Board.model");

exports.createBoard = async (req, res) => {
  try {
    const { projectId, type } = req.body;
    const board = await Board.create({
      projectId,
      type,
      columns: [
        { id: "1", name: "To Do", statusKey: "todo" },
        { id: "2", name: "In Progress", statusKey: "inprogress" },
        { id: "3", name: "Done", statusKey: "done" }
      ]
    });
    res.status(201).json({ message: "Board created", board });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find();
    res.json({ boards });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
