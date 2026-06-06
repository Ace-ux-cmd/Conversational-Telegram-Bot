# Conversational Telegram Bot (Katelyn)

Katelyn is a highly disciplined, personality-driven Telegram chatbot built on Node.js, PostgreSQL, and the Google Gemini API.

Unlike standard utility bots, Katelyn acts as a synchronized, state-aware virtual companion operating through strict architectural boundaries, a managed message processing pipeline, and dynamic multimodal input normalization.

**Bot Profile:** https://t.me/kathill_bot

---

# 🏗️ Core Architecture & System Flow

The application strictly separates concerns between ingestion layers, a sequential database history pipeline, a dynamic rate-limiting key router, and an image processing engine.

### Queue-Controlled Processing Pipeline

Guarantees FIFO execution order using zero concurrency overlaps per execution block.

### Persistent Relational Ledger

Managed entirely through PostgreSQL for predictable conversation memory retention, membership mappings, and usage tracking.

### Multimodal Asset Normalization

Intercepts visual payloads, downloads media through safe Axios connections, downscales assets using Sharp, and produces deterministic outputs through strict JSON schemas.

### Distributed Multi-Account Key Balancing

Interleaves outbound client requests across three separate credential accounts to reduce the likelihood of automated platform restrictions.

### Self-Healing Diagnostics

Performs periodic heartbeat checks to monitor database response latency and proactively broadcasts downtime alerts to active direct-message conversations.

---

# 🧱 Tech Stack

| Component           | Technology                    |
| ------------------- | ----------------------------- |
| Runtime Environment | Node.js v20+                  |
| Bot API Controller  | node-telegram-bot-api         |
| AI Engine           | Gemini 2.5 Flash / Flash-Lite |
| AI SDK              | @google/genai                 |
| Storage Engine      | PostgreSQL (`pg`)             |
| Graphics Processing | Sharp                         |
| HTTP Client         | Axios                         |
| Task Scheduler      | node-cron                     |
| Server Framework    | Express.js v5                 |

---

# ⚙️ Setup & Deployment

## 1. Clone Repository & Install Dependencies

```bash
git clone <repo-url>
cd Katelyn
npm install
```

## 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Server Network Parameters
PORT=5000
BOT_URL=https://your-deployment-url.render.com

# Telegram API Parameters
BOT_API_KEY=1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ

# Google Api Parameters
GOOGLE_API_KEY1 =  ABCdefgh-1234567890Ijkl...
GOOGLE_API_KEY2 =  ABCdefgh-1234567890Ijkl...
GOOGLE_API_KEY3 =  ABCdefgh-1234567890Ijkl...
GOOGLE_API_KEY4 =  ABCdefgh-1234567890Ijkl...
GOOGLE_API_KEY5 =  ABCdefgh-1234567890Ijkl...

# PostgreSQL Storage Connection String
DATABASE_URL=postgres://user:password@localhost:5432/katelyn_db
```

## 3. Database Initialization

Ensure the database contains the baseline health monitoring table:

```sql
CREATE TABLE IF NOT EXISTS bot_health (
    id SERIAL PRIMARY KEY,
    checked_at TIMESTAMP DEFAULT NOW(),
    response_time_ms NUMERIC
);
```

## 4. Start the Application

### Production

```bash
node index.js
```

### Development

```bash
npm run dev
```

---

# 🤖 Context & Execution Rules

## ⏳ Queue Mechanics & Retry Handling

All incoming transactions enter a unified in-memory processing queue.

### Priority Escalation

Messages originating from owner or administrator accounts bypass the queue by being inserted at the front of the execution pipeline using `unshift()`.

### Delayed Requeue Circuit Breaker

Failed API operations:

1. Retry immediately up to **2 times**
2. If failures persist, enter a **10-minute cooldown period**
3. Reinsert the payload into the processing queue after cooldown

---

# 🖼️ Multimodal Media Processing Pipeline

When image content is received, the standard message path is bypassed.

### Processing Flow

1. Download the highest available resolution directly from Telegram media servers.
2. Apply a strict **10-second request timeout**.
3. Resize images to a maximum dimension of **1024 × 1024 pixels**.
4. Compress output to **80% JPEG quality** using Sharp.
5. Request a structured AI response conforming to a predefined JSON schema.
6. Convert image understanding output into:

```text
{IMAGE_ATTACHMENT: ...}
```

7. Persist the result in PostgreSQL as plain text, ensuring compatibility with future conversation history retrieval.

---

# 📅 Seasonal Scheduling Engine

Katelyn operates with a dynamic contextual scheduling system that modifies persona behavior according to predefined calendar rules.

### Academic Schedule

* Weekdays
* Active between **09:00 – 15:00**

### Service Shift Schedule

* Evening shifts
* Active between **17:00 – 20:00**

### Calendar Overrides

Supports:

* Federal holiday tracking
* Summer break windows
* Winter break windows
* Other seasonal schedule adjustments

School-related contexts are automatically disabled during break periods while work-related contexts remain active.

---

# 📌 Maintenance & Contact

### Developer

**Mbonu Chidalu**

### Telegram

https://t.me/chidalumb100

### LinkedIn

https://www.linkedin.com/in/chidalu-mbonu-94944b3ba?utm_source=share_via&utm_content=profile&utm_medium=member_android

### WhatsApp

https://wa.me/2347054971517

---

# License

This project is provided for educational and personal development purposes. Add an appropriate license before public distribution.
