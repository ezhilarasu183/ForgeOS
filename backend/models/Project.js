const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: String, required: true },
    team: [{ type: String }], // User IDs or Names
    deadline: { type: Date },
    status: { type: String, default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
