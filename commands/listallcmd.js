module.exports = {
  config: {
    name: "listallcmd",
    version: "3.0",
    author: "kshitiz & fixed by AI",
    role: 0,
    shortDescription: "List all commands",
    longDescription: "Show all available bot commands",
    category: "Admin",
    guide: "{pn}"
  },

  onStart: async function ({ message, commands }) {
    try {
      // Debug: Check if 'commands' is loaded
      if (!commands || typeof commands !== 'object') {
        return message.reply("❌ | Commands data is not loaded correctly.");
      }

      // Convert commands Map/object into an array
      const allCommands = Array.from(commands.keys());
      
      if (allCommands.length === 0) {
        return message.reply("⚠️ | No commands found!");
      }

      // Split into chunks to avoid long messages
      const chunkSize = 30;
      const chunks = [];
      for (let i = 0; i < allCommands.length; i += chunkSize) {
        chunks.push(allCommands.slice(i, i + chunkSize));
      }

      // Send each chunk
      for (const chunk of chunks) {
        await message.reply(
          `📜 **Available Commands (${chunk.length}/${allCommands.length})**\n\n` +
          chunk.map(cmd => `• ${cmd}`).join("\n") +
          `\n\n🔹 Use a command with prefix (e.g., -help)`
        );
      }
    } catch (err) {
      console.error("🔴 [LISTALLCMD ERROR]:", err);
      message.reply("❌ | Bot failed to fetch commands. Please check console/logs.");
    }
  }
};
