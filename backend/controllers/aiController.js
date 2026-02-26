const { callGroq } = require('../services/groqService');

const TASK_SYSTEM_PROMPT = `
You are an intent extraction engine for a project management tool.
Respond ONLY in valid JSON. No explanations. No markdown.

JSON format:
{
  "action": "add_task",
  "title": "task name",
  "project": "project name or null",
  "due_date": "YYYY-MM-DD or null",
  "priority": "High, Medium, or Low",
  "assignee": "person name or null",
  "tags": ["tag1", "tag2"]
}
`;

const DOC_SYSTEM_PROMPT = `
You are a technical writer. Generate a professional project document based on the user description.
Respond in Markdown format.
Include sections like Overview, Scope, and Technical Requirements.
`;

const { Document, Packer, Paragraph, TextRun } = require('docx');

const processTaskIntent = async (req, res) => {
    const { text } = req.body;
    try {
        const aiResponse = await callGroq(TASK_SYSTEM_PROMPT, text);
        const parsed = JSON.parse(aiResponse.replace(/```json|```/g, '').trim());
        res.json(parsed);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const CHAT_SYSTEM_PROMPT = `
You are a helpful project management assistant. 
Answer questions about project management, task tracking, and team collaboration.
Keep responses concise and professional.
`;

const generateDocument = async (req, res) => {
    const { description } = req.body;
    try {
        const content = await callGroq(DOC_SYSTEM_PROMPT, description);
        res.json({ content });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const chatWithAssistant = async (req, res) => {
    const { message } = req.body;
    console.log('AI Chat Request received:', message);
    try {
        const aiResponse = await callGroq(CHAT_SYSTEM_PROMPT, message);
        console.log('AI Chat Response generated successfully');
        res.json({ response: aiResponse });
    } catch (error) {
        console.error('AI Chat Error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

const exportWord = async (req, res) => {
    const { title, content } = req.body;
    try {
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: title,
                                bold: true,
                                size: 32,
                            }),
                        ],
                    }),
                    ...content.split('\n').map(line => {
                        line = line.trim();
                        if (!line) return new Paragraph({ children: [] });

                        // Handle Headings
                        if (line.startsWith('#')) {
                            const level = line.match(/^#+/)[0].length;
                            const text = line.replace(/^#+\s*/, '');
                            return new Paragraph({
                                heading: level === 1 ? 'Heading1' : level === 2 ? 'Heading2' : 'Heading3',
                                children: [new TextRun({ text, bold: true, size: level === 1 ? 36 : level === 2 ? 28 : 24 })],
                                spacing: { before: 400, after: 200 }
                            });
                        }

                        // Handle Bullet Points
                        if (line.startsWith('- ') || line.startsWith('* ')) {
                            const text = line.replace(/^[-*]\s*/, '');
                            return new Paragraph({
                                children: [new TextRun(text)],
                                bullet: { level: 0 },
                                spacing: { after: 120 }
                            });
                        }

                        // Handle Bold text and plain text
                        const children = [];
                        const parts = line.split(/(\*\*.*?\*\*)/);
                        parts.forEach(part => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                children.push(new TextRun({ text: part.slice(2, -2), bold: true }));
                            } else {
                                children.push(new TextRun(part));
                            }
                        });

                        return new Paragraph({ children, spacing: { after: 120 } });
                    }),
                ],
            }],
        });

        const buffer = await Packer.toBuffer(doc);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename=${title.replace(/\s+/g, '_')}.docx`);
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    processTaskIntent,
    generateDocument,
    exportWord,
    chatWithAssistant
};
