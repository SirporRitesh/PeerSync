const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, default: 'Member' },
    },
  ],
  inviteCode: { type: String, required: true },
});

const Workspace = mongoose.models.Workspace || mongoose.model("Workspace", workspaceSchema);

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to the request
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};

app.get("/api/workspace", authenticateToken, (req, res) => {
  res.json({ message: "Welcome to the workspace!" });
});

module.exports = Workspace;