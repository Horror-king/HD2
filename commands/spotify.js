const axios = require("axios");
const https = require("https");
const { PassThrough } = require("stream");

// Custom function to stream file from a URL
async function getStreamFromURL(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const stream = new PassThrough();
      res.pipe(stream);
      resolve(stream);
    }).on("error", reject);
  });
}

async function handleSpotify({ message, args }) {
  const title = args.join(" ");
  if (!title) return message.reply("❌ Please enter a song title.");

  try {
    await message.reply("🎧 Searching Spotify track...");

    const res = await axios.get(`https://betadash-api-swordslush-production.up.railway.app/spt?title=${encodeURIComponent(title)}`);
    const data = res.data;

    if (!data?.title || !data?.download_url) {
      return message.reply("❌ No track found for that title.");
    }

    const durationMs = parseInt(data.duration || 0);
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000).toString().padStart(2, "0");
    const duration = `${minutes}:${seconds}`;

    const stream = await getStreamFromURL(data.download_url);

    await message.reply({
      body: `🎶 **${data.title}**\nArtist: ${data.artists || "Unknown"}\nDuration: ${duration}`,
      attachment: stream
    });

  } catch (err) {
    console.error("❌ Spotify CMD Error:", err.message || err);
    return message.reply("❌ Failed to fetch Spotify track. Please try again later.");
  }
}

module.exports = {
  config: {
    name: "spotify",
    aliases: ["spt", "spotifymusic"],
    version: "1.2",
    author: "ChatGPT",
    countDown: 5,
    role: 0,
    shortDescription: "Download Spotify track",
    longDescription: "Search and download a song using Spotify-style API",
    category: "media",
    guide: {
      en: "{pn} <song title> — play/download Spotify-style audio"
    }
  },
  onStart: handleSpotify,
  onChat: handleSpotify
};
