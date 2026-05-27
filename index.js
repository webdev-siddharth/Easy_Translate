require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
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

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch("https://libretranslate.de/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, source: "auto", target: "en", format: "text" }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (data.translatedText) {
      return data.translatedText;
    }
  } catch (err) {
    console.log("⚠️ Libre failed");
  }

  return null;
}

client.on("ready", () => {
  console.log(`✅ Translate Easy Online: ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // ❌ Cooldown (3 sec)
  if (cooldown.has(message.author.id)) return;
  cooldown.add(message.author.id);
  setTimeout(() => cooldown.delete(message.author.id), 3000);

  if (message.content.length < 3) return;
  if (!/[\u00C0-\u02AF\u0370-\u052F\u0900-\u0DFF\u0E00-\u0FFF\u1000-\u109F\u1100-\u1FFF\u2C00-\u2FFF\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u31F0-\u31FF\u3200-\u33FF\u3400-\u4DBF\u4E00-\u9FFF\uA000-\uA4CF\uA500-\uA63F\uA640-\uA69F\uA700-\uA7FF\uA800-\uA83F\uA840-\uA87F\uA880-\uA9DF\uAA00-\uAA7F\uAB00-\uAB6F\uAC00-\uD7AF\uF900-\uFAFF\uFB00-\uFB4F\uFB50-\uFDFF\uFE70-\uFEFF\uFF00-\uFFEF]/.test(message.content)) return;

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

client.login(process.env.TOKEN).catch((err) => {
  console.error("❌ Failed to login:", err.message);
  process.exit(1);
});