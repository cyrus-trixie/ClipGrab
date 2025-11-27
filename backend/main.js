import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { Innertube } from "youtubei.js";

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------------
// INIT YOUTUBE CLIENT
// ----------------------------
let youtube;
(async () => {
  youtube = await Innertube.create();
  console.log("🔥 YouTube API Ready");
})();

// ----------------------------
// ROOT CHECK
// ----------------------------
app.get("/", (req, res) => {
  res.send("🔥 ClipGrab API is running — YouTube + TikTok Resolver Ready!");
});

// ----------------------------
// MAIN RESOLVER ROUTE
// ----------------------------
app.post("/download-video", async (req, res) => {
  const { url, format } = req.body;

  if (!url)
    return res.status(400).json({
      success: false,
      message: "Missing URL",
    });

  try {
    // -----------------------------------------
    // YOUTUBE HANDLER
    // -----------------------------------------
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const info = await youtube.getBasicInfo(url);
      const title = info.basic_info.title.replace(/[^\w\s]/gi, "");

      // ---- MP3 AUDIO ----
      if (format === "mp3") {
        const audio = info.streaming_data.adaptive_formats.find((f) =>
          f.mime_type.includes("audio")
        );

        if (!audio) {
          return res.status(500).json({
            success: false,
            message: "No audio format found",
          });
        }

        return res.json({
          success: true,
          source: "youtube",
          format: "mp3",
          filename: `${title}.mp3`,
          downloadUrl: audio.url,
        });
      }

      // ---- MP4 VIDEO ----
      const videoFormat = info.streaming_data.formats.find((f) =>
        f.mime_type.includes("video/mp4")
      );

      if (!videoFormat) {
        return res.status(500).json({
          success: false,
          message: "No MP4 video format available",
        });
      }

      return res.json({
        success: true,
        source: "youtube",
        format: "mp4",
        filename: `${title}.mp4`,
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
    // UNSUPPORTED URL
    // -----------------------------------------
    return res.status(400).json({
      success: false,
      message: "Unsupported URL. Only YouTube + TikTok supported.",
    });
  } catch (error) {
    console.error("❌ Server Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error resolving URL",
      error: error.message,
    });
  }
});

// ----------------------------
// START SERVER
// ----------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
