# Conversational Telegram Bot (Katelyn)

Katelyn is a personality-driven Telegram chatbot built with Node.js and the Google Gemini API.

Unlike traditional utility bots, Katelyn is designed to simulate natural conversational behavior with a persistent personality identity and controlled interaction flow.

## Core Architecture

The system focuses on:

- Queue-controlled conversational processing
- Persistent private-chat memory using MongoDB
- Stateless group-chat handling
- Persona consistency through structured system prompts
- Multi-key Gemini API rotation for quota distribution
- Retry and fallback handling for API failures

**Bot Profile:** https://t.me/kathill_bot

---

# 🚀 Features

- Personality-driven conversational system
- Human-like response timing simulation
- Queue-based request processing
- Persistent private-chat memory
- Group mention/reply awareness
- Multi-key Gemini API rotation
- Retry + delayed requeue handling
- Express uptime server
- Dynamic command loading
- Media filtering support

---

# 🧱 Tech Stack

- Node.js
- node-telegram-bot-api
- Express.js
- MongoDB (Mongoose)
- Google Generative AI (Gemini 2.5 Flash Lite)
- dotenv
- node-fetch

---

# ⚙️ Setup

## 1. Clone repository

```bash
git clone <repo-url>
cd <project-folder>
```

## 2. Install dependencies

```bash
npm install
```

## 3. Create `.env` file

```env
BOT_API_KEY=

GOOGLE_API_KEY1 - GOOGLE_API_KEY0

BOT_OWNER_ID=
BOT_URL=

MONGODB_URL=
PORT=
```

## 4. Run the bot

```bash
node index.js
```

---

# 🧪 Group Chat Behavior

Katelyn responds in groups only when:

- Mentioned
- Name-triggered
- Replied to directly

### Group Rules

- No persistent memory in groups
- Stateless contextual handling
- Reply-context injection only
- No long-term group history storage

This behavior is intentional to reduce context pollution in multi-user conversations.

---

# 🧵 Queue System

All incoming messages pass through a centralized processing queue.

### Responsibilities

- Maintains execution order
- Prevents concurrent processing conflicts
- Controls API usage
- Handles retry scheduling

### Retry Handling

- Failed requests retry up to 2 times
- Repeated failures trigger delayed requeue

---

# ⚠️ Operational Warning

The multi-key Gemini rotation system is experimental.

Excessive API-key rotation or abnormal request distribution patterns may trigger platform restrictions, quota reviews, or temporary limitations from Google.

Use responsibly and monitor usage patterns carefully.

---

# 📌 Contact

- WhatsApp: https://wa.me/+2347054971517
- Telegram: https://t.me/chidalumb100
- LinkedIn: https://www.linkedin.com/in/chidalu-mbonu-94944b3ba
