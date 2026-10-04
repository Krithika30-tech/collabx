const User = require("../models/User");

// GET /api/users/:id
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.json(user);
  } catch (err) {
    if (err.name === "CastError") {
      res.status(400);
      err.message = "Invalid user id";
    }
    next(err);
  }
};

// PUT /api/users/:id  (only your own profile)
const updateUser = async (req, res, next) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      res.status(403);
      throw new Error("You can only update your own profile");
    }

    // Only these fields can be changed (blocks role/password/email changes)
    const allowed = ["name", "skills", "interests", "availability", "experience", "profileImage"];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (
      (updates.skills && !Array.isArray(updates.skills)) ||
      (updates.interests && !Array.isArray(updates.interests))
    ) {
      res.status(400);
      throw new Error("Skills and interests must be arrays");
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

module.exports = { getUser, updateUser };