const axios = require("axios");

module.exports = {
  config: {
    name: "spotify",
    aliases: ["spt", "music"],
    version: "1.1",
    author: "ChatGPT",
    countDown: 5,
    role: 0,
    shortDescription: "Download Spotify song",
    longDescription: "Fetches Spotify track data and sends a preview with audio",
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

      // Function to convert URLs to clickable links
      const makeLinksClickable = (text) => {
        return text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" style="color: #1DB954; text-decoration: underline;">$1</a>');
      };

      const replyMessage = `🎵 <b>${data.title}</b>\nArtist: ${data.artists || "Unknown"}\nDuration: ${durationFormatted}\n\n${makeLinksClickable(data.thumbnail)}\n${makeLinksClickable(data.download_url)}`;
      
      return message.reply(replyMessage, {
        attachment: await global.utils.getStreamFromURL(data.thumbnail),
        mentions: [{
          tag: data.title,
          id: message.senderID
        }]
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
