const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "spotify",
    aliases: ["spt", "music2"],
    version: "1.3",
    author: "Hassan",
    countDown: 5,
    role: 0,
    shortDescription: "Download Spotify song",
    longDescription: "Fetches Spotify track data and sends the audio with metadata and download link",
    category: "media",
    guide: {
      en: "{pn} <song title> - download a Spotify song"
    }
  },

  onStart: async function ({ message, args, api }) {
    const title = args.join(" ");
    if (!title) return message.reply("⚠️ | Please enter a song title to search on Spotify.");

    try {
      const res = await axios.get(`https://betadash-api-swordslush-production.up.railway.app/spt?title=${encodeURIComponent(title)}`);
      const data = res.data;

      if (!data?.title || !data?.download_url || !data?.thumbnail) {
        return message.reply("❌ | No song found for that title.");
      }

      const filePath = path.join(__dirname, "spotify.mp3");
      const writer = fs.createWriteStream(filePath);

      const response = await axios({
        url: data.download_url,
        method: "GET",
        responseType: "stream"
      });

      response.data.pipe(writer);

      writer.on("finish", () => {
        const durationMs = parseInt(data.duration || 0);
        const minutes = Math.floor(durationMs / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000).toString().padStart(2, "0");
        const durationFormatted = `${minutes}:${seconds}`;

        message.reply({
          body: `🎵 ${data.title}\nArtist: ${data.artists || "Unknown"}\nDuration: ${durationFormatted}`,
          attachment: fs.createReadStream(filePath)
        }, () => {
          fs.unlinkSync(filePath); // cleanup after send
        });
      });

      writer.on("error", err => {
        console.error("[Download Error]", err);
        message.reply("❌ | Failed to download the audio.");
      });
    } catch (error) {
      console.error("[Spotify Error]", error.message || error);
      return message.reply("❌ | Failed to fetch Spotify data. Try again later.");
    }
  },

  onChat: async function ({ message, args }) {
    return this.onStart({ message, args });
  }
};
