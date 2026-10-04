const Task = require("../models/Task");
const Project = require("../models/Project");

const isMember = (project, userId) =>
  project.members.some((m) => m.user.toString() === String(userId));

const TASK_FIELDS = ["title", "description", "assignedTo", "status", "priority", "dueDate"];

// GET /api/projects/:id/tasks  (members only)
const getTasks = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }
    if (!isMember(project, req.user._id)) {
      res.status(403);
      throw new Error("Only team members can view tasks");
    }
    const tasks = await Task.find({ project: project._id })
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

// POST /api/projects/:id/tasks  (members only)
const createTask = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }
    if (!isMember(project, req.user._id)) {
      res.status(403);
      throw new Error("Only team members can create tasks");
    }
    const { title, description, assignedTo, priority, dueDate } = req.body;
    if (!title) {
      res.status(400);
      throw new Error("Task title is required");
    }
    if (assignedTo && !isMember(project, assignedTo)) {
      res.status(400);
      throw new Error("Assignee must be a team member");
    }
    const task = await Task.create({
      project: project._id,
      title,
      description,
      assignedTo: assignedTo || null,
      priority,
      dueDate,
      createdBy: req.user._id,
    });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

// PUT /api/tasks/:id  (members of the task's project only)
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }
    const project = await Project.findById(task.project);
    if (!project || !isMember(project, req.user._id)) {
      res.status(403);
      throw new Error("Only team members can update tasks");
    }
    if (req.body.assignedTo && !isMember(project, req.body.assignedTo)) {
      res.status(400);
      throw new Error("Assignee must be a team member");
    }
    TASK_FIELDS.forEach((f) => {
      if (req.body[f] === undefined) return;
      task[f] = f === "assignedTo" && !req.body[f] ? null : req.body[f];
    });
    await task.save();
    res.json(task);
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, createTask, updateTask };