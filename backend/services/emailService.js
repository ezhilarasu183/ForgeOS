const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendWelcomeEmail = async (to, name, role, username, password) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: `Welcome to AI PM System, ${name}!`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e1e4e8; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="background: linear-gradient(135deg, #0052CC 0%, #0747A6 100%); padding: 30px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 24px;">Welcome Aboard!</h1>
                    <p style="margin: 10px 0 0; opacity: 0.9;">You've been added as ${role}</p>
                </div>
                <div style="padding: 30px; background: white; color: #172b4d;">
                    <p>Hello <strong>${name}</strong>,</p>
                    <p>Welcome to the <strong>AI Project Management System</strong>. Your account has been created by your administrator.</p>
                    
                    <div style="background: #f4f5f7; border-radius: 8px; padding: 20px; margin: 25px 0; border: 1px dashed #dfe1e6;">
                        <h4 style="margin: 0 0 15px; color: #5e6c84; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Access Credentials</h4>
                        <table style="width: 100%; font-size: 14px;">
                            <tr>
                                <td style="color: #6b778c; width: 100px; padding: 5px 0;">Username:</td>
                                <td style="font-family: monospace; font-weight: bold; color: #0052cc;">${username}</td>
                            </tr>
                            <tr>
                                <td style="color: #6b778c; padding: 5px 0;">Password:</td>
                                <td style="font-family: monospace; font-weight: bold; color: #0052cc;">${password}</td>
                            </tr>
                        </table>
                    </div>

                    <p style="line-height: 1.6;">You can now log in to the dashboard to view your assigned projects and start collaborating with your team.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:3000" style="background: #0052CC; color: white; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Go to Dashboard</a>
                    </div>
                </div>
                <div style="padding: 15px; background: #fafbfc; text-align: center; border-top: 1px solid #e1e4e8;">
                    <p style="color: #888; font-size: 12px; margin: 0;">&copy; 2026 AI Project Management System. All rights reserved.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${to}`);
    } catch (error) {
        console.error('Welcome Email Error:', error);
    }
};

const sendTaskAssignmentEmail = async (to, taskTitle, assigneeName) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: `[ALERT] New Task: ${taskTitle}`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e1e4e8; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="background: #EBECF0; padding: 20px; border-bottom: 4px solid #0052CC;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="background: #0052CC; color: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase;">New Task</span>
                        <h2 style="margin: 0; color: #172b4d; font-size: 18px;">Action Required</h2>
                    </div>
                </div>
                <div style="padding: 30px; background: white; color: #172b4d;">
                    <p>Hello <strong>${assigneeName}</strong>,</p>
                    <p>A new task has been assigned to you via the <strong>AI Command Center</strong>:</p>
                    
                    <div style="background: #f4f5f7; border-left: 4px solid #0052CC; border-radius: 4px; padding: 20px; margin: 25px 0;">
                        <h3 style="margin: 0; color: #0052cc; font-size: 18px;">${taskTitle}</h3>
                        <p style="margin: 10px 0 0; font-size: 13px; color: #5e6c84;">Status: To Do | Priority: High</p>
                    </div>

                    <p style="line-height: 1.6;">Please review the task details and start working on it. You can track progress on the project Kanban board.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:3000/employee/timeline" style="background: #0052CC; color: white; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">View Kanban Board</a>
                    </div>
                </div>
                <div style="padding: 15px; background: #fafbfc; text-align: center; border-top: 1px solid #e1e4e8;">
                    <p style="color: #888; font-size: 11px; margin: 0;">Sent via AI Project Management Automation</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Task email sent to ${to}`);
    } catch (error) {
        console.error('Task Email Error:', error);
    }
};

module.exports = { sendTaskAssignmentEmail, sendWelcomeEmail };
