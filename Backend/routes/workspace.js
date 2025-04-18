const mongoose = require("mongoose");

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

module.exports = Workspace;