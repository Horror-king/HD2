module.exports = {
  config: {
    name: "listallcmd",
    version: "1.0",
    author: "kshitiz",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "List all available commands"
    },
    longDescription: {
      en: "View a comprehensive list of all available commands"
    },
    category: "Admin 🛠",
    guide: {
      en: "{pn}"
    },
    priority: 1
  },

  onStart: async function ({ message, commands }) {
    try {
      const allCommands = Array.from(commands.keys());
      
      if (!allCommands.length) {
        return message.reply("❌ | No commands loaded.");
      }

      // Split the command list into chunks to avoid hitting message length limits
      const chunkSize = 50;
      const commandChunks = [];
      
      for (let i = 0; i < allCommands.length; i += chunkSize) {
        commandChunks.push(allCommands.slice(i, i + chunkSize));
      }

      for (const chunk of commandChunks) {
        const commandList = chunk.map(cmd => `• -${cmd}`).join("\n");
        await message.reply(`📜 Available commands (${chunk.length}/${allCommands.length}):\n\n${commandList}`);
      }

      await message.reply(`✅ Total commands: ${allCommands.length}`);
    } catch (error) {
      console.error(error);
      message.reply("❌ | An error occurred while fetching commands.");
    }
  }
};
