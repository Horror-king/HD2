module.exports = {
  config: {
    name: "cat",
    version: "1.0",
    description: "Get random cat pictures"
  },
  onStart: async function({ message }) {
    try {
      const response = await axios.get("https://api.thecatapi.com/v1/images/search");
      message.reply({
        attachment: await global.utils.getStreamFromURL(response.data[0].url)
      });
    } catch {
      message.reply("❌ Couldn't fetch cat picture");
    }
  }
};

// Similar for dogs (use https://dog.ceo/api/breeds/image/random)
