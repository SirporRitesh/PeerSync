// models/Channel.js
import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }], // Added messages field (was missing in your schema but present in routes/message.js)
}, { timestamps: true });

// Prevent model redefinition
const Channel = mongoose.models.Channel || mongoose.model('Channel', channelSchema);

export default Channel;