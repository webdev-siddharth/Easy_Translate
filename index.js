require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { translate } = require("@vitalets/google-translate-api");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on("clientReady", () => {
  console.log(`✅ Translate Easy Online: ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // ❌ Ignore very short messages
  if (message.content.length < 3) return;

  // ❌ Ignore messages without letters (only emojis/numbers)
  if (!/[a-zA-Z\u00C0-\u024F\u0900-\u097F]/.test(message.content)) return;

  try {
    const res = await translate(message.content, { to: "en" });

    // ❌ Agar already English hai → skip
    if (
      res.from &&
      res.from.language &&
      res.from.language.iso === "en"
    ) return;

    // ✅ Reply only for non-English
    message.reply({
      content: `🌐 **Translated to English:**\n> ${res.text}`
    });

  } catch (err) {
    console.error("❌ Translation Error:", err);
  }
});

client.login(process.env.TOKEN);