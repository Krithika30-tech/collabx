const Project = require("../models/Project");
const Message = require("../models/Message");

// GET /api/projects/:id/messages  (members only)
const getMessages = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }
    const member = project.members.some((m) => m.user.toString() === req.user._id.toString());
    if (!member) {
      res.status(403);
      throw new Error("Only team members can view the chat");
    }
    const messages = await Message.find({ project: project._id })
      .populate("sender", "name")
      .sort({ createdAt: 1 })
      .limit(200);
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

module.exports = { getMessages };