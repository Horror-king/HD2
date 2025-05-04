const express = require("express");
const axios = require("axios");
const path = require("path");
const fs = require("fs-extra");
const config = require("./config.json");

// Global setup
global.GoatBot = { config };
global.utils = {
  log: {
    info: (...args) => console.log("[INFO]", ...args),
    err: (...args) => console.error("[ERROR]", ...args)
  },
  getText: () => "✅ Bot is running smoothly on Render"
};

const app = express();
const PORT = process.env.PORT || config.dashBoard.port || 3000; // Default to 3000 if not specified
const COMMANDS_DIR = path.join(__dirname, "commands");
const PUBLIC_DIR = path.join(__dirname, "public");
const PREFIX = config.prefix || "!"; // Default prefix if not specified

// Render-specific uptime configuration
const isRender = process.env.RENDER === 'true';
const renderExternalUrl = process.env.RENDER_EXTERNAL_URL;

// Enhanced Uptime System for Render
if (config.autoUptime?.enable || isRender) {
  const myUrl = renderExternalUrl || config.autoUptime?.url || `http://localhost:${PORT}`;
  
  global.utils.log.info("RENDER UPTIME", `Monitoring endpoint available at: ${myUrl}/uptime`);
  global.utils.log.info("UPTIMEROBOT TIP", `Add this URL to UptimeRobot: ${myUrl}/health`);

  // Simple keep-alive endpoint for UptimeRobot
  app.get("/uptime", (req, res) => {
    res.status(200).json({
      status: "OK",
      timestamp: Date.now(),
      uptime: process.uptime(),
      platform: "Render",
      monitor: "UptimeRobot"
    });
  });

  // Comprehensive health check endpoint
  app.get("/health", (req, res) => {
    res.json({
      status: "healthy",
      version: require('./package.json').version,
      node: process.version,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      platform: process.platform,
      render: isRender,
      endpoints: {
        uptime: `${myUrl}/uptime`,
        api: `${myUrl}/api/command`
      }
    });
  });

  // Auto-ping for Render's 5-minute inactivity timeout
  if (isRender) {
    const pingInterval = setInterval(() => {
      axios.get(`${myUrl}/uptime`)
        .then(() => global.utils.log.info("RENDER PING", "Keeping Render instance alive"))
        .catch(err => global.utils.log.err("RENDER PING", err.message));
    }, 4 * 60 * 1000); // Ping every 4 minutes

    // Cleanup on exit
    process.on('exit', () => clearInterval(pingInterval));
  }
}

// Express setup
fs.ensureDirSync(COMMANDS_DIR);
fs.ensureDirSync(PUBLIC_DIR);
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

// Command loader
const commands = {};
function loadCommands() {
  Object.keys(require.cache).forEach((key) => {
    if (key.startsWith(COMMANDS_DIR)) delete require.cache[key];
  });

  const commandFiles = fs.readdirSync(COMMANDS_DIR).filter(file => file.endsWith(".js"));
  commandFiles.forEach(file => {
    try {
      const cmd = require(path.join(COMMANDS_DIR, file));
      if (cmd.config?.name) {
        commands[cmd.config.name] = cmd;
        if (Array.isArray(cmd.config.aliases)) {
          cmd.config.aliases.forEach(alias => commands[alias] = cmd);
        }
        console.log(`✅ Loaded command: ${PREFIX}${cmd.config.name}`);
      }
    } catch (err) {
      console.error(`❌ Failed to load ${file}:`, err);
    }
  });
}
loadCommands();

// Handle input
function handleCommand(input) {
  if (!input.startsWith(PREFIX)) return null;
  const args = input.slice(PREFIX.length).trim().split(/\s+/);
  const commandName = args.shift().toLowerCase();
  const text = args.join(" ");
  return { commandName, args, text };
}

// API handler
app.post("/api/command", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ reply: "❌ Message is required" });

    if (message.trim().toLowerCase() === "prefix") {
      return res.json({ reply: `🔹 My command prefix is: \`${PREFIX}\`` });
    }

    const cmd = handleCommand(message);
    if (!cmd) return res.end();

    if (cmd.commandName === "ai") {
      try {
        const response = await axios.get(
          `https://yau-ai-runing-station.vercel.app/ai?prompt=${encodeURIComponent(cmd.text)}&cb=${Date.now()}`,
          { 
            headers: { Accept: "application/json" },
            timeout: 10000
          }
        );

        let data;
        try {
          data = JSON.parse(response.data);
          if (typeof data === "string") data = JSON.parse(data);
        } catch {
          return res.status(500).json({ reply: "❌ AI returned invalid JSON format" });
        }

        return res.json({ reply: data?.response || JSON.stringify(data) || "⚠️ No response from AI" });
      } catch (aiError) {
        return res.status(500).json({ reply: `❌ AI Error: ${aiError.message}` });
      }
    }

    const command = commands[cmd.commandName];
    if (!command) return res.json({ reply: "❌ Command not found" });
    if (typeof command.onStart !== "function") {
      return res.json({ reply: "❌ This command does not support execution" });
    }

    const replies = [];
    await command.onStart({
      api: {
        sendMessage: (msg) => replies.push(typeof msg === "string" ? msg : JSON.stringify(msg))
      },
      event: { body: cmd.text },
      args: cmd.args,
      message: {
        reply: (content) => replies.push(content)
      }
    });

    if (!res.headersSent) {
      res.json({ reply: replies.length === 1 ? replies[0] : replies });
    }
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ reply: `❌ Server Error: ${error.message}` });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔹 Command prefix: "${PREFIX}"`);
  if (isRender && renderExternalUrl) {
    console.log(`🌐 Render External URL: ${renderExternalUrl}`);
    console.log(`⏱️ UptimeRobot monitoring URL: ${renderExternalUrl}/health`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});
