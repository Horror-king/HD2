const axios = require("axios");

module.exports = {
  config: {
    name: "mfam",
    aliases: ["tiktokfam", "lootedfam"],
    version: "1.0",
    author: "Hassan",
    countDown: 5,
    role: 0,
    shortDescription: "Fetch TikTok-style pinay videos",
    longDescription: "Get random videos from the LootedPinay source",
    category: "video",
    guide: {
      en: "{pn} - shows random TikTok-style fam videos"
    }
  },

  onStart: async function ({ message }) {
    try {
      const page = Math.floor(Math.random() * 5) + 1;
      const res = await axios.get(`https://betadash-api-swordslush-production.up.railway.app/lootedpinay?page=${page}`);

      const result = res.data.result;
      if (!result || result.length === 0) return message.reply("❌ | No videos found.");

      // Pick one random video
      const random = result[Math.floor(Math.random() * result.length)];

      await message.reply({
        body: `🔥 ${random.title}`,
        attachment: await global.utils.getStreamFromURL(random.videoUrl)
      });

    } catch (err) {
      console.error("[mfam error]", err.message || err);
      return message.reply("❌ | Couldn't fetch video. Please try again later.");
    }
  },

  onChat: async function ({ message, args }) {
    return this.onStart({ message, args });
  }
};
