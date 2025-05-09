const axios = require('axios');

module.exports = {
  config: {
    name: "anime",
    aliases: ["character", "anichar"],
    version: "1.0",
    author: "Hassan",
    role: 0,
    shortDescription: "Search anime character details",
    longDescription: "Fetches info about anime characters including image, series, and role.",
    category: "anime",
    guide: {
      en: "{pn} <character name>"
    }
  },

  onStart: async function ({ message, args }) {
    const name = args.join(" ");
    if (!name) return message.reply("⚠️ | Please enter a character name!");

    try {
      const query = `
        query ($search: String) {
          Character(search: $search) {
            name { full }
            image { large }
            description
            media { nodes { title { romaji } } 
            gender
            age
          }
        }
      `;

      const variables = { search: name };
      const response = await axios.post('https://graphql.anilist.co', {
        query,
        variables
      });

      const char = response.data.data.Character;
      if (!char) return message.reply("❌ | Character not found!");

      // Clean description (remove HTML tags)
      const desc = char.description 
        ? char.description.replace(/<[^>]*>/g, "").slice(0, 300) + "..." 
        : "No description available.";

      const mediaTitles = char.media.nodes.map(m => m.title.romaji).join(", ") || "Unknown";

      const replyMsg = `
🎌 **${char.name.full}**  
📺 **Appears in:** ${mediaTitles}  
⚡ **Gender:** ${char.gender || "Unknown"}  
🎂 **Age:** ${char.age || "Unknown"}  
📝 **Description:** ${desc}  
      `;

      await message.reply({
        body: replyMsg,
        attachment: await global.utils.getStreamFromURL(char.image.large)
      });

    } catch (error) {
      console.error("[ANIME ERROR]", error);
      message.reply("❌ | Error fetching data. Try a different name!");
    }
  }
};
