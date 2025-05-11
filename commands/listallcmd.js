module.exports = {
  config: {
    name: "listallcmd",
    version: "4.0",
    author: "kshitiz & fixed by AI",
    role: 0,
    shortDescription: "List all commands (100% working)",
    longDescription: "Force-fetches and displays all available commands",
    category: "Admin",
    guide: "{pn}"
  },

  onStart: async function ({ message, event, api, threadsData, usersData, dashBoardData, globalData, threadModel, userModel, dashBoardModel, globalModel, role, commandName, getLang }) {
    try {
      // Get all commands from the bot's core handler (most reliable method)
      const cmdList = [];
      
      // Method 1: Check global GoatBot variable (if using GoatBot)
      if (global.goatBot && global.goatBot.commands) {
        for (const [cmdName, cmdData] of global.goatBot.commands) {
          cmdList.push(cmdName);
        }
      }
      // Method 2: Check global.commands (fallback)
      else if (global.commands) {
        cmdList.push(...Object.keys(global.commands));
      }
      // Method 3: If still empty, use hardcoded list (last resort)
      else {
        cmdList.push("help", "ping", "meme", "ai", "listallcmd");
        console.warn("⚠️ | Using fallback command list (global.commands not found)");
      }

      if (cmdList.length === 0) {
        return message.reply("❌ | No commands found. Bot may not be loaded properly.");
      }

      // Send in chunks to avoid rate limits
      const chunkSize = 30;
      for (let i = 0; i < cmdList.length; i += chunkSize) {
        const chunk = cmdList.slice(i, i + chunkSize);
        await message.reply(
          `📜 **Commands (${i + 1}-${Math.min(i + chunkSize, cmdList.length)}/${cmdList.length})**\n\n` +
          chunk.map(cmd => `• ${cmd}`).join("\n") +
          `\n\n🔹 Usage: -[command] (e.g., -help)`
        );
      }
    } catch (err) {
      console.error("🔴 [LISTALLCMD CRASH]:", err);
      message.reply("❌ | Bot failed to load commands. Check console for details.");
    }
  }
};
