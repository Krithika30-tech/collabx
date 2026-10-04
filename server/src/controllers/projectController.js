const Project = require("../models/Project");

const idOf = (v) => (v && v._id ? v._id : v).toString();
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const FIELDS = [
  "title", "description", "category", "requiredSkills",
  "requiredRoles", "technologies", "availability", "experienceLevel",
];
const UPDATE_FIELDS = [...FIELDS, "status", "isPublic"];

const findProject = async (id, res) => {
  const project = await Project.findById(id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  return project;
};

const requireOwner = (project, user, res) => {
  if (idOf(project.owner) !== user._id.toString()) {
    res.status(403);
    throw new Error("Only the project owner can do this");
  }
};

// POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const data = {};
    FIELDS.forEach((f) => {
      if (req.body[f] !== undefined) data[f] = req.body[f];
    });
    const project = await Project.create({
      ...data,
      owner: req.user._id,
      members: [{ user: req.user._id, role: "Owner" }],
    });
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
};

// GET /api/projects?q=&category=&status=&skill=
const getProjects = async (req, res, next) => {
  try {
    const { q, category, status, skill } = req.query;
    const filter = {};
    if (q) {
      const rx = new RegExp(escapeRegex(String(q)), "i");
      filter.$or = [{ title: rx }, { description: rx }];
    }
    if (category) filter.category = new RegExp(`^${escapeRegex(String(category))}$`, "i");
    if (status) filter.status = String(status);
    if (skill) filter.requiredSkills = new RegExp(`^${escapeRegex(String(skill))}$`, "i");

    const projects = await Project.find(filter)
      .select("-joinRequests")
      .populate("owner", "name email")
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    next(err);
  }
};

// GET /api/projects/:id  (join requests are visible to the owner only)
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email")
      .populate("members.user", "name email skills")
      .populate("joinRequests.user", "name email skills");
    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }
    const obj = project.toObject();
    if (idOf(project.owner) !== req.user._id.toString()) delete obj.joinRequests;
    res.json(obj);
  } catch (err) {
    next(err);
  }
};

// PUT /api/projects/:id  (owner only)
const updateProject = async (req, res, next) => {
  try {
    const project = await findProject(req.params.id, res);
    requireOwner(project, req.user, res);
    UPDATE_FIELDS.forEach((f) => {
      if (req.body[f] !== undefined) project[f] = req.body[f];
    });
    await project.save();
    res.json(project);
  } catch (err) {
    next(err);
  }
};

// POST /api/projects/:id/join
const joinProject = async (req, res, next) => {
  try {
    const project = await findProject(req.params.id, res);
    const uid = req.user._id.toString();
    if (project.status === "completed") {
      res.status(400);
      throw new Error("This project is already completed");
    }
    if (project.members.some((m) => idOf(m.user) === uid)) {
      res.status(400);
      throw new Error("You are already a member of this project");
    }
    if (project.joinRequests.some((r) => idOf(r.user) === uid && r.status === "pending")) {
      res.status(409);
      throw new Error("You have already requested to join");
    }
    project.joinRequests.push({ user: req.user._id, message: req.body.message || "" });
    await project.save();
    res.status(201).json({ message: "Join request sent" });
  } catch (err) {
    next(err);
  }
};

// PUT /api/projects/:id/requests/:userId   body: { action: "accept" | "reject", role }
const respondToRequest = async (req, res, next) => {
  try {
    const project = await findProject(req.params.id, res);
    requireOwner(project, req.user, res);
    const { action, role } = req.body;
    if (!["accept", "reject"].includes(action)) {
      res.status(400);
      throw new Error("action must be 'accept' or 'reject'");
    }
    const request = project.joinRequests.find(
      (r) => idOf(r.user) === req.params.userId && r.status === "pending"
    );
    if (!request) {
      res.status(404);
      throw new Error("Pending request not found");
    }
    request.status = action === "accept" ? "accepted" : "rejected";
    if (action === "accept") {
      project.members.push({ user: request.user, role: role || "Member" });
    }
    await project.save();
    res.json(project);
  } catch (err) {
    next(err);
  }
};

// PUT /api/projects/:id/members/:userId   body: { role }
const updateMemberRole = async (req, res, next) => {
  try {
    const project = await findProject(req.params.id, res);
    requireOwner(project, req.user, res);
    if (!req.body.role) {
      res.status(400);
      throw new Error("role is required");
    }
    const member = project.members.find((m) => idOf(m.user) === req.params.userId);
    if (!member) {
      res.status(404);
      throw new Error("Member not found");
    }
    member.role = req.body.role;
    await project.save();
    res.json(project);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/projects/:id/members/:userId
const removeMember = async (req, res, next) => {
  try {
    const project = await findProject(req.params.id, res);
    requireOwner(project, req.user, res);
    if (req.params.userId === idOf(project.owner)) {
      res.status(400);
      throw new Error("The owner cannot be removed");
    }
    project.members = project.members.filter((m) => idOf(m.user) !== req.params.userId);
    await project.save();
    res.json(project);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProject, getProjects, getProject, updateProject,
  joinProject, respondToRequest, updateMemberRole, removeMember,
};