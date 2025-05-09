const axios = require("axios");

module.exports = {
  config: {
    name: "lyrics",
    aliases: ["lyric", "songtext"],
    version: "1.0",
    author: "Hassan",
    countDown: 5,
    role: 0,
    shortDescription: "Find song lyrics",
    longDescription: "Finds lyrics for the requested song",
    category: "media",
    guide: {
      en: "{pn} <song title> - find lyrics for a song"
    }
  },

  onStart: async function ({ message, args }) {
    const title = args.join(" ");
    if (!title) return message.reply("⚠️ | Please enter a song title to search for lyrics.");

    try {
      const res = await axios.get(`https://betadash-api-swordslush-production.up.railway.app/lyrics-finder?title=${encodeURIComponent(title)}`);
      const data = res.data;

      if (!data?.response || data.status !== 200) {
        return message.reply("❌ | No lyrics found for that song.");
      }

      const replyMessage = `🎵 **${data.Title}**\n\n${data.response}\n\nThumbnail: ${data.Thumbnail}`;
      return message.reply(replyMessage);
    } catch (error) {
      console.error("[Lyrics Error]", error.message || error);
      return message.reply("❌ | Failed to fetch lyrics. Try again later.");
    }
  },

  onChat: async function ({ message, args }) {
    return this.onStart({ message, args });
  }
};
