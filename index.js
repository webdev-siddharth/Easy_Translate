require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");
const { translate } = require("@vitalets/google-translate-api");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// 🔹 Cooldown (anti-spam)
const cooldown = new Set();

// 🔹 Hybrid translate function
async function translateText(text) {
  // 1️⃣ Try Google (fast & accurate)
  try {
    const res = await translate(text, { to: "en" });

    if (res.text) {
      return res.text;
    }
  } catch (err) {
    console.log("⚠️ Google failed");
  }

  // 2️⃣ Fallback LibreTranslate
  try {
    const res = await axios.post(
      "https://libretranslate.de/translate",
      {
        q: text,
        source: "auto",
        target: "en",
        format: "text",
      },
      {
        timeout: 5000,
        headers: { "Content-Type": "application/json" },
      }
    );

    if (res.data && res.data.translatedText) {
      return res.data.translatedText;
    }
  } catch (err) {
    console.log("⚠️ Libre failed");
  }

  return null;
}

client.on("clientReady", () => {
  console.log(`✅ Translate Easy Online: ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // ❌ Cooldown (3 sec)
  if (cooldown.has(message.author.id)) return;
  cooldown.add(message.author.id);
  setTimeout(() => cooldown.delete(message.author.id), 3000);

  // ❌ Ignore short / useless messages
  if (message.content.length < 3) return;
  if (!/[a-zA-Z\u00C0-\u024F\u0900-\u097F]/.test(message.content)) return;

  try {
    const translated = await translateText(message.content);

    // ❌ API failed
    if (!translated) {
      console.log("⚠️ Translation failed");
      return;
    }

    // 🔥 Normalize compare
    const original = message.content.trim().toLowerCase();
    const result = translated.trim().toLowerCase();

    // ❌ Already English
    if (original === result) return;

    // ✅ Reply
    await message.reply({
      content: `🌐 **Translated to English:**\n> ${translated}`,
    });

  } catch (err) {
    console.error("❌ Error:", err.message);
  }
});

client.login(process.env.TOKEN);