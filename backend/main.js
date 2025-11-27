// main.js
import express from 'express';
import cors from 'cors';
import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * MOCK Instagram Reel scraper
 */
async function getInstagramDirectVideoUrl(url) {
  if (url.includes('example-fail')) {
    return { success: false, message: 'Instagram link failed to scrape.' };
  }
  return {
    success: true,
    videoUrl: 'https://mock-video-cdn.com/instagram/reel-placeholder.mp4',
    filename: 'instagram_reel_download.mp4'
  };
}

/**
 * YouTube scraper with ytdl-core
 */
async function getYouTubeVideo(url, format = 'mp4') {
  if (!ytdl.validateURL(url)) {
    return { success: false, message: 'Invalid YouTube URL' };
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');

    // MP4 = highest quality video+audio
    // MP3 = audio only
    const filter = format === 'mp3' ? 'audioonly' : 'audioandvideo';

    const formatObj = ytdl.chooseFormat(info.formats, { filter, quality: 'highest' });
    if (!formatObj) {
      return { success: false, message: 'No suitable format found' };
    }

    return {
      success: true,
      downloadUrl: formatObj.url,
      filename: `${title}.${format === 'mp3' ? 'mp3' : 'mp4'}`
    };
  } catch (err) {
    console.error('YouTube scrape error:', err);
    return { success: false, message: 'Failed to fetch YouTube video' };
  }
}

// Routes
app.get('/', (req, res) => {
  res.send('ClipGrab Scraper API is live 🔥');
});

app.post('/download-video', async (req, res) => {
  const { url, platform, format } = req.body;

  if (!url || !platform) {
    return res.status(400).json({ success: false, message: 'Missing url or platform' });
  }

  try {
    if (platform === 'youtube') {
      const result = await getYouTubeVideo(url, format || 'mp4');
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } else if (platform === 'instagram') {
      const result = await getInstagramDirectVideoUrl(url);
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } else if (platform === 'tiktok') {
      return res.status(501).json({ success: false, message: 'TikTok not implemented yet' });
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported platform' });
    }
  } catch (err) {
    console.error('Download error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`ClipGrab Scraper API running at http://localhost:${PORT}`);
});
