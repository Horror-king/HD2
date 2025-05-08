const axios = require("axios");

module.exports = {
  config: {
    name: "freepik",
    aliases: ["fp", "fpsearch"],
    version: "1.0",
    author: "Hassan",
    countDown: 5,
    role: 0,
    shortDescription: "Search Freepik-style images",
    longDescription: "Fetches images based on search keywords from a Freepik-style API",
    category: "image",
    guide: {
      en: "{pn} <keyword> - search for related images"
    }
  },

  onStart: async function ({ message, args }) {
    const query = args.join(" ");
    if (!query) return message.reply("⚠️ | Please enter a keyword to search Freepik-style images.");

    try {
      const res = await axios.get(`https://betadash-api-swordslush-production.up.railway.app/freepik?search=${encodeURIComponent(query)}`);
      const images = res.data.images;

      if (!images || images.length === 0) return message.reply("❌ | No images found for your query.");

      // Limit to first 5 images for brevity
      const selectedImages = images.slice(0, 5).join("\n");

      await message.reply(`Here are some Freepik-style images for: "${query}"\n\n${selectedImages}`);
    } catch (error) {
      console.error("[Freepik Error]", error.message || error);
      return message.reply("❌ | Failed to fetch images. Please try again later.");
    }
  },

  onChat: async function ({ message, args }) {
    return this.onStart({ message, args });
  }
};
