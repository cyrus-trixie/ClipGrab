// server.js

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000; // Choose any port not currently in use
const ytdl = require('ytdl-core'); 
const fs = require('fs');
// Middleware
// 1. CORS: Allows your React Native app to make requests to this API.
app.use(cors());
// 2. Body Parser: Allows Express to read JSON data sent from the client (your app).
app.use(express.json());

// --- ROUTES ---

// Health Check Route (Test if server is running)
app.get('/', (req, res) => {
    res.send('ClipGrab API is running!');
});

// ** 🚨 Primary Download Endpoint 🚨 **
// This endpoint will receive the video URL and platform (youtube, tiktok, etc.)
app.post('/download-video', async (req, res) => {
    const { videoURL, platform } = req.body; // e.g., videoURL: 'https://youtu.be/...'

    if (platform === 'youtube') {
        try {
            if (!ytdl.validateURL(videoURL)) {
                return res.status(400).json({ success: false, message: 'Invalid YouTube URL.' });
            }

            // Set headers to force the browser/app to download the file
            // We use the 'attachment' header to stream the file directly back to the client.
            res.header('Content-Disposition', 'attachment; filename="video.mp4"');

            // 1. Get the stream (high-quality audio and video combined)
            const videoStream = ytdl(videoURL, { 
                filter: 'audioandvideo', // Request stream with both audio and video
                quality: 'highestvideo'  // Attempt to get the best quality
            });

            // 2. Pipe the stream directly to the response object.
            // This is the efficient way to send large files without saving them to your server disk.
            videoStream.pipe(res);

            // Handle errors during the stream
            videoStream.on('error', (err) => {
                console.error('YTDL Error:', err);
                // Check if headers have already been sent before sending a 500
                if (!res.headersSent) {
                    return res.status(500).json({ success: false, message: 'Could not process YouTube link.' });
                }
            });

        } catch (error) {
            console.error('Download initiation error:', error);
            res.status(500).json({ success: false, message: 'Internal server error during processing.' });
        }
    } else {
        // Handle Instagram and TikTok placeholders (these require different libraries/techniques)
        res.status(501).json({ 
            success: false, 
            message: `Download for ${platform} is not yet implemented.` 
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Access at: http://localhost:${PORT}`);
});