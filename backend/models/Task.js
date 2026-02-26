const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: {
        type: String,
        enum: ['To Do', 'In Progress', 'Done'],
        default: 'To Do'
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium'
    },
    assignee: { type: String }, // User ID or Name
    dueDate: { type: Date },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    progress: { type: Number, default: 0 },
    tags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
