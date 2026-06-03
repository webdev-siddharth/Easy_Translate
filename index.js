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
  console.log(`📨 Message received: "${message.content}" from ${message.author.tag}`);
  if (message.author.bot) return;

  // ❌ Cooldown (3 sec)
  if (cooldown.has(message.author.id)) return;
  cooldown.add(message.author.id);
  setTimeout(() => cooldown.delete(message.author.id), 3000);

  if (message.content.length < 3) return;


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

const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot is running");
});

app.get("/invite", (req, res) => {
  res.redirect(
    "https://discord.com/oauth2/authorize?client_id=1489577881960185866"
  );
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});