import express from "express";
import cors from "cors";
import ytdl from "@distube/ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fetch from "node-fetch";

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

ffmpeg.setFfmpegPath(ffmpegPath);

// --- ROOT CHECK ---
app.get("/", (req, res) => {
  res.send("ClipGrab API is running on Render! This API is now a URL Resolver.");
});

// --- MAIN RESOLVER ROUTE ---
app.post("/download-video", async (req, res) => {
  const { url, format } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      message: "Missing URL",
    });
  }

  try {
    // -----------------------------------------
    // YOUTUBE HANDLER
    // -----------------------------------------
    if (ytdl.validateURL(url)) {
      const info = await ytdl.getInfo(url);
      const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");
      const filename =
        format === "mp3" ? `${title}.mp3` : `${title}.mp4`;

      if (format === "mp3") {
        // Return MP3 stream URL
        const audioFormat = ytdl.chooseFormat(info.formats, {
          filter: "audioonly",
        });

        return res.json({
          success: true,
          source: "youtube",
          format: "mp3",
          filename,
          downloadUrl: audioFormat.url,
        });
      }

      // MP4 mode
      const videoFormat = ytdl.chooseFormat(info.formats, {
        quality: "highest",
      });

      return res.json({
        success: true,
        source: "youtube",
        format: "mp4",
        filename,
        downloadUrl: videoFormat.url,
      });
    }

    // -----------------------------------------
    // TIKTOK HANDLER
    // -----------------------------------------
    if (url.includes("tiktok.com")) {
      const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(
        url
      )}`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!data.data || !data.data.play) {
        return res.status(500).json({
          success: false,
          message: "Failed to resolve TikTok URL",
        });
      }

      return res.json({
        success: true,
        source: "tiktok",
        format: "mp4",
        filename: "tiktok_video.mp4",
        downloadUrl: data.data.play,
      });
    }

    // -----------------------------------------
    // UNSUPPORTED PLATFORM
    // -----------------------------------------
    return res.status(400).json({
      success: false,
      message: "Unsupported URL. Only YouTube + TikTok supported.",
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error resolving URL",
      error: err.message,
    });
  }
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
