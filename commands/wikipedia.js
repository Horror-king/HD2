const axios = require("axios");

module.exports = {
  config: {
    name: "wikipedia",
    aliases: ["wiki", "wikisearch"],
    version: "1.0",
    author: "Hassan",
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
      const res = await axios.get(apiUrl);
      const data = res.data;

      if (data.type === "https://mediawiki.org/wiki/HyperSwitch/errors/not_found") {
        return message.reply("❌ | No article found for that topic.");
      }

      const title = data.title || query;
      const extract = data.extract || "No summary available.";
      const pageUrl = data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`;

      let replyMessage = `📚 **${title}**\n\n${extract}\n\n🔗 More: ${pageUrl}`;

      // If an image exists, send it with the summary
      if (data.thumbnail?.source) {
        await message.reply({
          body: replyMessage,
          attachment: [data.thumbnail.source]
        });
      } else {
        await message.reply(replyMessage);
      }

    } catch (err) {
      console.error("[Wikipedia Error]", err.message || err);
      return message.reply("❌ | Could not fetch Wikipedia article. Please try again later.");
    }
  },

  onChat: async function ({ message, args }) {
    return this.onStart({ message, args });
  }
};
