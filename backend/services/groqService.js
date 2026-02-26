const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const callGroq = async (systemPrompt, userPrompt) => {
    try {
        const response = await axios.post(GROQ_URL, {
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.1,
            max_tokens: 1024
        }, {
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Groq AI API Error:', error.response ? error.response.data : error.message);
        throw new Error('AI processing failed');
    }
};

module.exports = { callGroq };
