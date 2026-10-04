const express = require("express");
const { updateTask } = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.put("/:id", protect, updateTask);

module.exports = router;