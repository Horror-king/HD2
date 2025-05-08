const axios = require("axios");

module.exports = {
  config: {
    name: "spotify",
    aliases: ["spt", "music2"],
    version: "1.2",
    author: "Hassan",
    countDown: 5,
    role: 0,
    shortDescription: "Download Spotify song",
    longDescription: "Fetches Spotify track data and sends a preview with audio and download button",
    category: "media",
    guide: {
      en: "{pn} <song title> - download a Spotify song"
    }
  },

  onStart: async function ({ message, args }) {
    const title = args.join(" ");
    if (!title) return message.reply("⚠️ | Please enter a song title to search on Spotify.");

    try {
      const res = await axios.get(`https://betadash-api-swordslush-production.up.railway.app/spt?title=${encodeURIComponent(title)}`);
      const data = res.data;

      if (!data?.title || !data?.download_url || !data?.thumbnail) {
        return message.reply("❌ | No song found for that title.");
      }

      // Convert duration from milliseconds to mm:ss format
      const durationMs = parseInt(data.duration || 0);
      const minutes = Math.floor(durationMs / 60000);
      const seconds = Math.floor((durationMs % 60000) / 1000).toString().padStart(2, "0");
      const durationFormatted = `${minutes}:${seconds}`;

      const replyMessage =
`🎵 **${data.title}**
Artist: ${data.artists || "Unknown"}
Duration: ${durationFormatted}

${data.thumbnail}

🔽 **[Download MP3]( ${data.download_url} )**`;

      return message.reply(replyMessage);
    } catch (error) {
      console.error("[Spotify Error]", error.message || error);
      return message.reply("❌ | Failed to fetch Spotify data. Try again later.");
    }
  },

  onChat: async function ({ message, args }) {
    return this.onStart({ message, args });
  }
};
