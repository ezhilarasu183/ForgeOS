const { sendTaskAssignmentEmail } = require('../services/emailService');

const createTask = async (req, res) => {
    const { title, project, assignee, priority, due_date } = req.body;

    // For demo, we'll try to find an email if the assignee name matches our list
    const emails = {
        'Ezhilarasu': 'arasu0984@gmail.com',
        'Rithan': 'rithan@example.com'
    };

    try {
        console.log(`Task created: ${title}`);

        if (assignee && emails[assignee]) {
            await sendTaskAssignmentEmail(emails[assignee], title, assignee);
        }

        res.json({
            message: 'Task created successfully and added to Kanban',
            emailSent: !!emails[assignee],
            task: { title, project, assignee, priority, due_date }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createTask };
