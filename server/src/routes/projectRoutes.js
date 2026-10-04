const express = require("express");
const p = require("../controllers/projectController");
const t = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);

router.route("/").get(p.getProjects).post(p.createProject);
router.route("/:id").get(p.getProject).put(p.updateProject);
router.post("/:id/join", p.joinProject);
router.put("/:id/requests/:userId", p.respondToRequest);
router.route("/:id/members/:userId").put(p.updateMemberRole).delete(p.removeMember);
router.route("/:id/tasks").get(t.getTasks).post(t.createTask);

module.exports = router;