const axios = require("axios");

module.exports = {
  config: {
    name: "wikipedia",
    aliases: ["wiki", "wikisearch"],
    version: "1.2",
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
    try {
      const query = args.join(" ");
      if (!query) {
        return message.reply("⚠️ | Please provide a search term.\nExample: /wikipedia Alan Turing");
      }

      const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;

      // Show typing indicator while searching
      await message.reply("🔍 Searching Wikipedia...");

      const res = await axios.get(apiUrl, {
        headers: {
          "User-Agent": "WikiBot/1.0 (https://yau-5-ai-0-5.onrender.com/)",
          "Accept": "application/json"
        },
        timeout: 10000 // 10 seconds timeout
      });

      const data = res.data;

      if (data.type === "disambiguation") {
        return message.reply(`❌ | This term refers to multiple topics.\nPlease be more specific.\n\n🔗 See options: ${data.content_urls.desktop.page}`);
      }

      if (data.title === "Not found" || data.type === "https://mediawiki.org/wiki/HyperSwitch/errors/not_found") {
        return message.reply(`❌ | No article found for "${query}".\n\nTry these suggestions:\n1. Check your spelling\n2. Use more specific terms\n3. Try similar terms`);
      }

      const title = data.title;
      const summary = data.extract || "No summary available for this article.";
      const pageUrl = data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`;
      const image = data.thumbnail?.source;

      // Format the response with better spacing
      const replyText = `📚 **${title}**\n\n${summary}\n\n🔗 Read more: ${pageUrl}`;

      if (image) {
        try {
          await message.reply({
            body: replyText,
            attachment: await global.utils.getStreamFromURL(image)
          });
        } catch (imageError) {
          console.error("[Wikipedia Image Error]", imageError);
          await message.reply(`${replyText}\n\n⚠️ Couldn't load the article image`);
        }
      } else {
        await message.reply(replyText);
      }

    } catch (err) {
      console.error("[Wikipedia Command Error]", err);
      
      // More specific error messages
      if (err.code === 'ECONNABORTED') {
        return message.reply("⏳ | Wikipedia is taking too long to respond. Please try again later.");
      } else if (err.response?.status === 404) {
        return message.reply("🔍 | No Wikipedia article found for that topic. Try a different search term.");
      } else if (err.response?.status === 429) {
        return message.reply("🔄 | Wikipedia is rate limiting us. Please wait a minute and try again.");
      } else {
        return message.reply("❌ | Failed to fetch from Wikipedia. Possible reasons:\n1. Wikipedia is down\n2. Your query was too vague\n3. Network issues\n\nPlease try again with a different search term.");
      }
    }
  },

  onChat: async function ({ message, args }) {
    return this.onStart({ message, args });
  }
};
