const axios = require("axios");

module.exports = {
  config: {
    name: "spotify",
    aliases: ["spt", "music2"],
    version: "1.0",
    author: "Hassan",
    countDown: 5,
    role: 0,
    shortDescription: "Download Spotify song",
    longDescription: "Fetches music download and preview from a Spotify search title",
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

      if (!data || !data.title || !data.audio || !data.image) {
        return message.reply("❌ | Could not find the song. Please try a different title.");
      }

      const resultMessage = `🎵 **${data.title}**\nArtist: ${data.artist || "Unknown"}\n\n${data.image}\n${data.audio}`;
      return message.reply(resultMessage);
    } catch (error) {
      console.error("[Spotify Error]", error.message || error);
      return message.reply("❌ | Failed to fetch Spotify data. Try again later.");
    }
  },

  onChat: async function ({ message, args }) {
    return this.onStart({ message, args });
  }
};
