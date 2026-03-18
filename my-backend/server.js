require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

// --- MIDDLEWARE & VALIDATION ---
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://antonthnx.com/';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

if (!process.env.GOOGLE_API_KEY || !process.env.TYPEFORM_TOKEN) {
    console.warn('⚠️ Warning: Some API keys are missing in .env. Certain features will fail.');
}

// --- YOUTUBE API ROUTE ---
app.get('/api/youtube/video-info', async (req, res) => {
    const { videoId } = req.query;
    if (!videoId) return res.status(400).json({ error: 'Missing videoId' });
    
    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
            params: {
                part: 'snippet,statistics',
                id: videoId,
                key: process.env.GOOGLE_API_KEY
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'YouTube fetch failed' });
    }
});

// --- TYPEFORM SUBMIT ROUTE ---
app.post('/api/typeform/submit', async (req, res) => {
    const { formId } = req.query; 
    if (!formId) return res.status(400).json({ error: 'Missing formId' });

    try {
        const response = await axios.post(
            `https://api.typeform.com/forms/JlDful3L/responses`,
            req.body,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.TYPEFORM_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('Typeform Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ 
            error: 'Submission failed', 
            details: error.response?.data 
        });
    }
});

// --- START SERVER (Always keep this at the bottom) ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on https://antonthnx.com/`);
});