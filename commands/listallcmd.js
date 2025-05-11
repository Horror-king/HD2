module.exports = {
  config: {
    name: "listallcmd",
    version: "2.0",
    author: "kshitiz & fixed by AI",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "List all available commands"
    },
    longDescription: {
      en: "View all commands with categories (supports pagination)"
    },
    category: "Admin 🛠",
    guide: {
      en: "{pn} [page]"
    },
    priority: 1
  },

  onStart: async function ({ message, args, commands }) {
    try {
      // Get all commands and group them by category
      const cmdList = {};
      for (const [cmdName, cmdData] of commands) {
        const category = cmdData.config?.category || "Uncategorized";
        if (!cmdList[category]) {
          cmdList[category] = [];
        }
        cmdList[category].push(`• ${cmdName}`);
      }

      // Prepare pagination
      const page = args[0] ? parseInt(args[0]) : 1;
      const categories = Object.keys(cmdList);
      const itemsPerPage = 5; // Categories per page
      const totalPages = Math.ceil(categories.length / itemsPerPage);
      
      if (page < 1 || page > totalPages) {
        return message.reply(`❌ Invalid page number. Please choose between 1-${totalPages}.`);
      }

      // Get categories for current page
      const startIdx = (page - 1) * itemsPerPage;
      const paginatedCategories = categories.slice(startIdx, startIdx + itemsPerPage);

      // Build the message
      let replyMsg = `📜 Command List (Page ${page}/${totalPages})\n\n`;
      
      for (const category of paginatedCategories) {
        replyMsg += `【 ${category} 】\n`;
        replyMsg += `${cmdList[category].join("\n")}\n\n`;
      }

      replyMsg += `🔹 Total Commands: ${commands.size}\n`;
      replyMsg += `🔹 Type "${this.config.name} <page>" to view more`;

      await message.reply(replyMsg);
    } catch (err) {
      console.error("[LISTALLCMD ERROR]", err);
      message.reply("❌ Failed to load commands. Please try again later.");
    }
  }
};
