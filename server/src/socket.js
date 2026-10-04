const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const User = require("./models/User");
const Project = require("./models/Project");
const Message = require("./models/Message");

const isMember = async (projectId, userId) => {
  const project = await Project.findById(projectId).select("members");
  return !!project && project.members.some((m) => m.user.toString() === userId.toString());
};

const initSocket = (httpServer) => {
  const io = new Server(httpServer, { cors: { origin: process.env.CLIENT_URL } });

  // Authenticate every socket connection with the same JWT used by the REST API
  io.use(async (socket, next) => {
    try {
      const decoded = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error("Not authorized"));
      socket.user = user;
      next();
    } catch {
      next(new Error("Not authorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", async (projectId) => {
      try {
        if (await isMember(projectId, socket.user._id)) socket.join(`project:${projectId}`);
      } catch (err) {
        console.error("joinRoom error:", err.message);
      }
    });

    socket.on("sendMessage", async ({ projectId, text }) => {
      try {
        const clean = String(text || "").trim();
        if (!clean || clean.length > 1000) return;
        if (!(await isMember(projectId, socket.user._id))) return;
        const msg = await Message.create({
          project: projectId,
          sender: socket.user._id,
          text: clean,
        });
        io.to(`project:${projectId}`).emit("newMessage", {
          _id: msg._id,
          project: String(projectId),
          text: msg.text,
          createdAt: msg.createdAt,
          sender: { _id: socket.user._id, name: socket.user.name },
        });
      } catch (err) {
        console.error("sendMessage error:", err.message);
      }
    });
  });

  return io;
};

module.exports = initSocket;