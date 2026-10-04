const User = require("../models/User");
const Project = require("../models/Project");
const { compatibility } = require("../services/matchingService");

const projectTarget = (p) => ({
  skills: p.requiredSkills,
  interests: [p.category, ...p.technologies],
  availability: p.availability,
  experience: p.experienceLevel,
});

const getMatches = async (req, res, next) => {
  try {
    const { projectId } = req.query;

    // Mode 1: recommend collaborators for one of my projects
    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) {
        res.status(404);
        throw new Error("Project not found");
      }
      if (project.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("Only the project owner can view matches");
      }
      const memberIds = project.members.map((m) => m.user);
      const candidates = await User.find({ _id: { $nin: memberIds }, role: "student" });
      const target = projectTarget(project);
      const ranked = candidates
        .map((u) => ({
          user: {
            _id: u._id, name: u.name, email: u.email, skills: u.skills,
            interests: u.interests, availability: u.availability, experience: u.experience,
          },
          ...compatibility(u, target),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);
      return res.json(ranked);
    }

    // Mode 2: recommend open projects for me
    const projects = await Project.find({
      status: "open",
      "members.user": { $ne: req.user._id },
    }).populate("owner", "name");
    const ranked = projects
      .map((p) => ({
        project: {
          _id: p._id, title: p.title, category: p.category,
          requiredSkills: p.requiredSkills, owner: p.owner,
        },
        ...compatibility(req.user, projectTarget(p)),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
    res.json(ranked);
  } catch (err) {
    next(err);
  }
};

module.exports = { getMatches };