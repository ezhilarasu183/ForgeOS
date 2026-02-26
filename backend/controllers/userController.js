const { sendWelcomeEmail } = require('../services/emailService');

const createUser = async (req, res) => {
    const { name, email, role, dob, username, password } = req.body;
    try {
        console.log(`New user created: ${name} (${role})`);

        // Send Welcome Email
        await sendWelcomeEmail(email, name, role, username, password);

        res.status(201).json({
            message: 'User created successfully',
            user: { name, email, role, dob, status: 'Active', username }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getEmployees = async (req, res) => {
    // Return mock data for now
    const employees = [
        { id: 1, name: 'Ezhilarasu', email: 'ezhil@example.com', role: 'Developer', status: 'Active', dob: '1995-03-12' },
        { id: 2, name: 'Rithan', email: 'rithan@example.com', role: 'Designer', status: 'Active', dob: '1998-07-22' },
    ];
    res.json(employees);
};

module.exports = {
    createUser,
    getEmployees
};
