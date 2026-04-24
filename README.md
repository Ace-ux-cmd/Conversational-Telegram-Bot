````md
# Conversational Telegram Bot (Katelyn)

Katelyn is a personality-driven Telegram chatbot built with Node.js and the Google Gemini API.  
She is designed to simulate natural human conversation with a strong character identity rather than behaving like a utility or assistant bot.

The system focuses on:
- Controlled conversational flow via queue processing
- Persistent user memory using MongoDB
- Group-chat awareness with minimal context injection
- Persona consistency through structured system prompts
- Rate-limit handling with multi-key API rotation

**Bot Profile:** https://t.me/kathill_bot

---

# 🧩 What Changed (Patch Overview)

## 🔄 AI Backend Migration
- Migrated from OpenAI Responses API → Google Generative AI (Gemini 2.5 Flash Lite)
- Introduced multi-API key rotation for load distribution and quota handling
- Switched to systemInstruction-based personality control

## 🧠 Memory System Upgrade
- Added MongoDB-backed user memory store
- Each user maintains a rolling message history (last 10 messages)
- Context persists across sessions (private chats only)

## 🧵 Conversation Engine Rewrite
- Separate pipelines for:
  - Private chats (persistent memory + DB history)
  - Group chats (stateless + reply/mention context only)
- Reply-context injection added for group messages

## ⚙️ Queue System Improvements
- Single-threaded message queue processing
- Prevents race conditions and API overload
- Retry handling with delayed re-queue (15 min cooldown for repeated failures)
- Priority queueing for bot owner messages

## ⌨️ UX & Interaction Layer
- Typing indicator simulation (`sendChatAction`)
- Randomized response delay (5–10 seconds)
- Media filtering (sticker, image, video, voice handling)
- Command system:
  - `/start`
  - `/about`
  - `/support`
  - `/callad`

## 🌐 Infrastructure Changes
- Express server added for health check endpoint
- Self-pinging system to prevent hosting sleep (Render)
- Dynamic command loader from `/cmd` directory

---

# 🚀 Features

- Strong fixed personality system (Katelyn persona prompt)
- Human-like response timing simulation
- Queue-based request pipeline
- Persistent user memory (MongoDB)
- Group chat awareness (mention/reply triggers only)
- Multi-key Gemini API rotation
- Retry + fallback handling for AI failures
- Lightweight Express uptime server
- Modular command structure

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
````

## 2. Install dependencies

```bash
npm install
```

## 3. Create `.env` file

```env
BOT_API_KEY=
GOOGLE_API_KEY1=
GOOGLE_API_KEY7=
GOOGLE_API_KEY8=
GOOGLE_API_KEY9=
GOOGLE_API_KEY0=

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

# 🧪 Group Chat Behavior (Updated)

Katelyn responds in group chats only when:

* Mentioned (`@kathill`)
* Name-triggered (e.g. “Katelyn”)
* Replying to her message

### Group Mode Rules

* Stateless (no database memory in group context)
* Only current message + optional replied message is used
* No long-term context accumulation

This is intentional to avoid noise and multi-user context pollution.

---

# 🧵 Queue Processing System

All messages (private + group) pass through a centralized queue system:

* Ensures single execution flow
* Prevents race conditions
* Controls API rate usage
* Maintains message order

### Retry Logic

* Failed responses are retried up to 2 times
* Repeated failures trigger 15-minute delayed re-queue

---

# 🌐 System Notes

* Bot is intentionally not a utility assistant
* Personality is enforced via system instructions
* Memory limited to last 10 messages per user
* Group chat handling is intentionally restricted and stateless

---

# 📌 Author / Contact

* WhatsApp: [https://wa.me/+2347054971517]
* Telegram: [https://t.me/chidalumb100]
* Linkedln: [https://www.linkedin.com/in/chidalu-mbonu-94944b3ba]


```
```
