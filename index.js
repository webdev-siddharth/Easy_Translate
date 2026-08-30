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
const path = require("path");
const app = express();

app.get("/favicon.svg", (req, res) => {
  res.sendFile(path.join(__dirname, "favicon.svg"));
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
  <html>
  <head>
    <title>Easy Translate</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">    
    <style>
      *{
        margin:0;
        padding:0;
        box-sizing:border-box;
        font-family:Arial,sans-serif;
      }

      body{
        background: linear-gradient(135deg,#0f172a,#1e293b);
        min-height:100vh;
        display:flex;
        justify-content:center;
        align-items:center;
        color:white;
      }

      .card{
        width:90%;
        max-width:700px;
        text-align:center;
        background:rgba(255,255,255,0.05);
        backdrop-filter:blur(10px);
        border:1px solid rgba(255,255,255,0.1);
        border-radius:20px;
        padding:50px;
        box-shadow:0 10px 30px rgba(0,0,0,0.4);
      }

      .logo{
        width:120px;
        height:120px;
        display:block;
        margin:0 auto 15px;
      }

      h1{
        font-size:48px;
        margin-bottom:15px;
      }

      p{
        font-size:18px;
        color:#cbd5e1;
        margin-bottom:35px;
        line-height:1.6;
      }

      .btn{
        display:inline-block;
        background:#5865F2;
        color:white;
        text-decoration:none;
        padding:16px 35px;
        border-radius:12px;
        font-size:18px;
        font-weight:bold;
        transition:.3s;
      }

      .btn:hover{
        transform:translateY(-3px);
      }

      .features{
        margin-top:40px;
        display:grid;
        gap:15px;
      }

      .feature{
        background:rgba(255,255,255,0.05);
        padding:15px;
        border-radius:10px;
      }
    </style>
  </head>

  <body>
    <div class="card">
      <div ><img src="/favicon.svg" class="logo" alt="Logo"></div>

      <h1>Easy Translate</h1>

      <p>
        Automatically translates non-English messages into English
        so everyone in your Discord server can communicate easily.
      </p>

      <a class="btn"
         href="YOUR_DISCORD_INVITE_LINK">
         Add to Discord
      </a>

      <div class="features">
        <div class="feature">⚡ Instant Translation</div>
        <div class="feature">🌍 Supports Multiple Languages</div>
        <div class="feature">🤖 Easy to Use</div>
      </div>
    </div>
  </body>
  </html>
  `);
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
