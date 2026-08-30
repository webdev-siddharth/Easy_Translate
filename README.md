<p align="center">
  <img src="favicon.svg" width="112" alt="Easy Translate logo">
</p>

<h1 align="center">Easy Translate</h1>

<p align="center">
  A lightweight Discord bot that helps multilingual communities understand each other—automatically translating messages into English.
</p>

<p align="center">
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white" alt="Node.js 18+"></a>
  <a href="https://discord.js.org/"><img src="https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white" alt="discord.js v14"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-f5c542" alt="MIT License"></a>
  <a href="https://easy-translate-a1ph.onrender.com/"><img src="https://img.shields.io/badge/Live%20Preview-Render-46E3B7?logo=render&logoColor=white" alt="Live preview"></a>
</p>

<p align="center">
  <a href="https://easy-translate-a1ph.onrender.com/"><strong>View live preview</strong></a>
  ·
  <a href="#quick-start"><strong>Get started</strong></a>
  ·
  <a href="#deploy-on-render"><strong>Deploy on Render</strong></a>
</p>

---

## What it does

Send a message in your Discord server. Easy Translate tries Google Translate first and falls back to LibreTranslate if needed. When the English result differs from the original message, the bot replies with the translation.

```text
You:  Hola, ¿cómo estás?
Bot:  🌐 Translated to English:
      > Hello, how are you?
```

## Features

| Feature | How it works |
| --- | --- |
| 🌍 Automatic translation | Translates eligible Discord messages to English. |
| ⚡ Two-service fallback | Uses Google Translate first, then LibreTranslate if Google fails. |
| 🧠 Skip unchanged text | Avoids replying when the translated result matches the original text. |
| 🛡️ Anti-spam cooldown | Limits each user to one translation attempt every three seconds. |
| 🩺 Health endpoint | Exposes `GET /health` for deployment monitoring. |
| ✨ Simple by design | No commands or setup are required after the bot is invited and online. |

<details>
<summary><strong>Translation flow</strong></summary>

```text
Discord message
      ↓
Google Translate
      ↓ (only on failure)
LibreTranslate
      ↓
English reply in the same Discord conversation
```

</details>

## Quick start

### 1. Clone the project

```bash
git clone https://github.com/webdev-siddharth/Easy_Translate.git
cd Easy_Translate
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your environment file

Create a `.env` file in the project root:

```env
TOKEN=your_discord_bot_token
```

> Never commit your token. `.env` is already excluded by `.gitignore`.

### 4. Configure Discord

In the [Discord Developer Portal](https://discord.com/developers/applications), enable **Message Content Intent** for your bot. Without it, Discord does not provide message text to the application.

### 5. Start the bot

```bash
npm start
```

When the bot connects successfully, the console prints its Discord username and the web server port.

## Deploy on Render

1. Push this repository to GitHub.
2. In Render, select **New → Web Service** and connect the repository.
3. Configure the service:

| Setting | Value |
| --- | --- |
| Runtime | Node |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Health Check Path | `/health` |
| Environment Variable | `TOKEN` = your Discord bot token |

4. Create the service and open the deployed URL.

The current live preview is [easy-translate-a1ph.onrender.com](https://easy-translate-a1ph.onrender.com/).

> Render's free web services can sleep after inactivity, which disconnects a Discord bot. It is useful for testing; choose always-on hosting for dependable 24/7 translation.

## HTTP endpoints

| Route | Purpose |
| --- | --- |
| `GET /` | Easy Translate landing page |
| `GET /favicon.svg` | Bot icon used by the landing page |
| `GET /health` | JSON health status and current UTC timestamp |

Example health response:

```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2026-08-31T12:00:00.000Z"
}
```

## Project structure

```text
Easy_Translate/
├── index.js          # Discord client, translation logic, and Express server
├── favicon.svg       # Landing-page icon
├── package.json       # Scripts and dependencies
├── package-lock.json  # Locked dependency versions
├── .gitignore         # Local files and secrets excluded from Git
└── README.md
```

<details>
<summary><strong>Troubleshooting</strong></summary>

| Symptom | Check |
| --- | --- |
| Bot does not receive messages | Enable Message Content Intent and confirm the bot can view the channel. |
| Login fails | Confirm `TOKEN` is set to the bot token, not the application ID or client secret. |
| No translation reply | Check the process logs for Google/LibreTranslate errors and ensure the message is at least three characters long. |
| Render health check returns 404 | Push the current `index.js` containing the `/health` route and redeploy. |

</details>

## Tech stack

- Node.js 18+
- [discord.js](https://discord.js.org/) v14
- [@vitalets/google-translate-api](https://www.npmjs.com/package/@vitalets/google-translate-api)
- [Express](https://expressjs.com/)
- LibreTranslate fallback API

## Contributing

Ideas, bug reports, and pull requests are welcome. Please keep changes focused and avoid committing secrets, `node_modules`, or local tool files.

## License

Released under the [MIT License](LICENSE).

## Author

Built by [Siddharth Vishwakarma](https://github.com/webdev-siddharth) · [LinkedIn](https://linkedin.com/in/mrsiddharthvishwakarma)
