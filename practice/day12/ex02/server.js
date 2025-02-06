const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(bodyParser.json());

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    try {
        // Google Gemini API 호출
        const response = await fetch('https://gemini-api-url.com/v1/chat', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input: userMessage,
                model: 'gemini-model-name',  // 필요한 모델 이름 지정
            }),
        });

        const data = await response.json();
        res.json({ response: data.output });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ response: 'AI 응답에 실패했습니다.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
