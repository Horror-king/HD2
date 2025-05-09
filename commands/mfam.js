const axios = require("axios");
const https = require("https");
const { PassThrough } = require("stream");

// Custom function to stream video from URL
async function getStreamFromURL(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const data = new PassThrough();
      response.pipe(data);
      resolve(data);
    }).on("error", reject);
  });
}

module.exports = {
  config: {
    name: "mfam",
    aliases: ["tiktokfam", "lootedfam"],
    version: "1.0",
    author: "ChatGPT",
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

      const videoStream = await getStreamFromURL(random.videoUrl);

      await message.reply({
        body: `🔥 ${random.title}`,
        attachment: videoStream
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
