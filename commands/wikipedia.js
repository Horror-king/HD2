const axios = require("axios");

module.exports = {
  config: {
    name: "wikipedia",
    aliases: ["wiki", "wikisearch"],
    version: "1.1",
    author: "ChatGPT",
    countDown: 5,
    role: 0,
    shortDescription: "Search Wikipedia for a topic",
    longDescription: "Returns a summary and image for a Wikipedia article",
    category: "info",
    guide: {
      en: "{pn} <search term> - fetch Wikipedia summary and image"
    }
  },

  onStart: async function ({ message, args }) {
    const query = args.join(" ");
    if (!query) return message.reply("⚠️ | Please provide a search term. Example: /wikipedia Alan Turing");

    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;

    try {
      const res = await axios.get(apiUrl, {
        headers: {
          "User-Agent": "WikiBot/1.0 (https://yau-5-ai-0-5.onrender.com/)"
        }
      });

      const data = res.data;

      if (data.title === "Not found") {
        return message.reply("❌ | No article found for that topic.");
      }

      const title = data.title;
      const summary = data.extract || "No summary available.";
      const pageUrl = data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`;
      const image = data.thumbnail?.source;

      const replyText = `📚 **${title}**\n\n${summary}\n\n🔗 Read more: ${pageUrl}`;

      if (image) {
        await message.reply({ body: replyText, attachment: [image] });
      } else {
        await message.reply(replyText);
      }

    } catch (err) {
      console.error("[Wikipedia Error]", err.message || err);
      return message.reply("❌ | Failed to fetch response. Please try again.");
    }
  },

  onChat: async function ({ message, args }) {
    return this.onStart({ message, args });
  }
};
