const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { pipeline } = require("stream");
const { promisify } = require("util");
const streamPipeline = promisify(pipeline);

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

      const random = result[Math.floor(Math.random() * result.length)];
      const url = random.videoUrl;
      const title = random.title;

      // Download the video temporarily
      const tempPath = path.join(__dirname, "temp.mp4");
      const response = await axios.get(url, { responseType: "stream" });
      await streamPipeline(response.data, fs.createWriteStream(tempPath));

      await message.reply({
        body: `🔥 ${title}`,
        attachment: fs.createReadStream(tempPath)
      });

      // Cleanup
      fs.unlinkSync(tempPath);

    } catch (err) {
      console.error("[mfam error]", err.message || err);
      return message.reply("❌ | Couldn't fetch video. Please try again later.");
    }
  },

  onChat: async function ({ message, args }) {
    return this.onStart({ message, args });
  }
};
