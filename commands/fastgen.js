const axios = require("axios");

module.exports = {
  config: {
    name: "fastgen",
    aliases: ["fg", "fastgenerate"],
    version: "2.0",
    author: "Allou Mohamed & ChatGPT",
    countDown: 8,
    role: 0,
    shortDescription: "Fast AI image generation",
    longDescription: "Generate up to 4 fast AI images using a prompt and optional aspect ratio (--ar).",
    category: "ai",
    guide: {
      en: "{pn} <prompt> [--ar 16:9] - quickly generate AI images"
    }
  },

  onStart: async function ({ message, args }) {
    let prompt = args.join(" ").trim();
    if (!prompt) {
      return message.reply("⚠️ | Please provide a prompt.\nExample: /fastgen a futuristic city --ar 1:1");
    }

    // Handle optional aspect ratio
    let aspectRatio = "16:9";
    const match = prompt.match(/--ar\s*(\d+:\d+)/);
    if (match) {
      aspectRatio = match[1];
      prompt = prompt.replace(/--ar\s*\d+:\d+/, "").trim();
    }

    try {
      const imageLinks = [];

      for (let i = 0; i < 4; i++) {
        const res = await axios.get(`https://www.ai4chat.co/api/image/generate?prompt=${encodeURIComponent(prompt)}&aspect_ratio=${encodeURIComponent(aspectRatio)}`);
        if (res.data.image_link) {
          imageLinks.push(res.data.image_link);
        } else {
          console.warn(`No image on attempt ${i + 1}`);
        }
      }

      if (imageLinks.length) {
        await message.reply(`🖼️ | Generated images for: "${prompt}"`);
        return message.stream(imageLinks);
      } else {
        return message.reply("❌ | Image generation failed. Try again later.");
      }

    } catch (err) {
      console.error("[FastGen Error]", err.message);
      return message.reply("❌ | Something went wrong while generating the image.");
    }
  },

  onChat: async function ({ message, args }) {
    return this.onStart({ message, args });
  }
};
