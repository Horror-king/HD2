const axios = require("axios");

module.exports = {
  config: {
    name: "wikipedia",
    aliases: ["wiki", "wikisearch"],
    version: "1.3",
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
    try {
      const query = args.join(" ");
      if (!query) {
        return message.reply("⚠️ | Please provide a search term.\nExample: /wikipedia Alan Turing");
      }

      const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;

      // Show searching indicator
      await message.reply("🔍 Searching Wikipedia...");

      const res = await axios.get(apiUrl, {
        headers: {
          "User-Agent": "WikiBot/1.0 (https://yau-5-ai-0-5.onrender.com/)",
          "Accept": "application/json"
        },
        timeout: 10000
      });

      const data = res.data;

      if (data.type === "disambiguation") {
        return message.reply(`❌ | This term refers to multiple topics.\nPlease be more specific.\n\n🔗 See options: ${data.content_urls.desktop.page}`);
      }

      if (data.title === "Not found" || data.type === "https://mediawiki.org/wiki/HyperSwitch/errors/not_found") {
        return message.reply(`❌ | No article found for "${query}".`);
      }

      const title = data.title;
      const summary = data.extract || "No summary available for this article.";
      const pageUrl = data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`;
      const imageUrl = data.thumbnail?.source;

      const replyText = `📚 **${title}**\n\n${summary}\n\n🔗 Read more: ${pageUrl}`;

      if (imageUrl) {
        try {
          // Use the correct attachment method for your bot framework
          await message.reply({
            body: replyText,
            attachment: await global.utils.getStreamFromURL(imageUrl)
          });
        } catch (imageError) {
          console.error("[Wikipedia Image Error]", imageError);
          // Fallback to text-only if image fails
          await message.reply(`${replyText}\n\n⚠️ Couldn't load the article image`);
        }
      } else {
        await message.reply(replyText);
      }

    } catch (err) {
      console.error("[Wikipedia Command Error]", err);
      
      if (err.code === 'ECONNABORTED') {
        await message.reply("⏳ | Wikipedia is taking too long to respond. Please try again later.");
      } else if (err.response?.status === 404) {
        await message.reply("🔍 | No Wikipedia article found for that topic.");
      } else if (err.response?.status === 429) {
        await message.reply("🔄 | Too many requests. Please wait a minute and try again.");
      } else {
        await message.reply("❌ | Error fetching Wikipedia results. Please try again.");
      }
    }
  },

  onChat: async function ({ message, args }) {
    return this.onStart({ message, args });
  }
};
