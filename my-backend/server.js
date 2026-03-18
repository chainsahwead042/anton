js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
// Validate environment variables early
if (!process.env.GOOGLE_API_KEY) {
    console.error('Error: Missing GOOGLE_API_KEY in environment variables.');
    process.exit(1);
}
if (!process.env.TYPEFORM_TOKEN) {
    console.warn('Warning: TYPEFORM_TOKEN is not set. Typeform API routes will fail.');
}
// CORS setup with a default fallback
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5500';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());
// --- YOUTUBE API ROUTE ---
// Fetches video details without exposing API key
app.get('/api/youtube/video-info', async (req, res) => {
    const { videoId } = req.query;
    if (!videoId) {
        return res.status(400).json({ error: 'Missing videoId query parameter' });
    }
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
        console.error('YouTube API error:', error.message);
        res.status(500).json({ error: 'Error fetching YouTube data' });
    }
});
// --- TYPEFORM API ROUTE ---
// Fetches form responses using secret token
app.get('/api/typeform/responses', async (req, res) => {
    const { formId } = req.query;
    if (!formId) {
        return res.status(400).json({ error: 'Missing formId query parameter' });
    }
    if (!process.env.TYPEFORM_TOKEN) {
        return res.status(500).json({ error: 'Typeform token not configured' });
    }
    try {
        const response = await axios.get(`https://api.typeform.com/forms/${formId}/responses`, {
            headers: {
                'Authorization': `Bearer ${process.env.TYPEFORM_TOKEN}`
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Typeform API error:', error.message);
        res.status(500).json({ error: 'Error fetching Typeform data' });
    }
});
// --- GOOGLE OAUTH / SECRET KEY ROUTE ---
// Placeholder for OAuth logic
app.post('/api/google/auth', async (req, res) => {
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientSecret) {
        return res.status(500).json({ error: 'Google client secret not configured' });
    }
    // Implement OAuth exchange here
    res.json({ message: "Authentication logic goes here" });
});
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Backend is running on port ${PORT}`);
    console.log(`🔒 Secrets are loaded and protected.`);
});
// --- TYPEFORM SUBMIT ROUTE ---
app.post('/api/typeform/submit', async (req, res) => {
    const { formId } = req.query;
    if (!formId) return res.status(400).json({ error: 'Missing formId' });
    if (!process.env.TYPEFORM_TOKEN) return res.status(500).json({ error: 'Typeform token not configured' });

    try {
        const response = await axios.post(
            `https://api.typeform.com/forms/${formId}/responses`,
            req.body,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.TYPEFORM_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Typeform submit error:', error.message);
        res.status(500).json({ error: 'Error submitting to Typeform' });
    }
});