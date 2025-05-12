const axios = require("axios");

// Add this utility function at the top of your file
async function getStreamFromURL(url) {
  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream'
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching image:', error);
    throw error;
  }
}

module.exports = {
  config: {
    name: "wikipedia",
    aliases: ["wiki", "wikisearch"],
    version: "1.4",
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
          "User-Agent": "WikiBot/1.0",
          "Accept": "application/json"
        },
        timeout: 10000
      });

      const data = res.data;

      if (data.type === "disambiguation") {
        return message.reply(`❌ | Multiple topics found.\nPlease be more specific.\n🔗 See options: ${data.content_urls.desktop.page}`);
      }

      if (!data.title || data.title === "Not found") {
        return message.reply(`❌ | No article found for "${query}".`);
      }

      const title = data.title;
      const summary = data.extract || "No summary available.";
      const pageUrl = data.content_urls?.desktop?.page;
      const imageUrl = data.thumbnail?.source;

      const replyText = `📚 **${title}**\n\n${summary}${pageUrl ? `\n\n🔗 Read more: ${pageUrl}` : ''}`;

      if (imageUrl) {
        try {
          const imageStream = await getStreamFromURL(imageUrl);
          await message.reply({
            body: replyText,
            attachment: imageStream
          });
        } catch (imageError) {
          console.error("Image Error:", imageError);
          await message.reply(replyText);
        }
      } else {
        await message.reply(replyText);
      }

    } catch (err) {
      console.error("[Wikipedia Error]", err);
      
      if (err.code === 'ECONNABORTED') {
        await message.reply("⏳ | Wikipedia is slow to respond. Try again later.");
      } else if (err.response?.status === 404) {
        await message.reply("🔍 | No Wikipedia article found.");
      } else {
        await message.reply("❌ | Error fetching Wikipedia results.");
      }
    }
  },

  onChat: async function ({ message, args }) {
    return this.onStart({ message, args });
  }
};
