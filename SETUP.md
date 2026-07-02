# Setup Guide

This guide walks you through setting up Katelyn for local development or deployment.

---

# Requirements

Before getting started, ensure you have the following installed:

* Node.js **v20** or later
* PostgreSQL
* Git
* A Telegram Bot Token from **@BotFather**
* One or more Google Gemini API keys

---

# 1. Clone the Repository

```bash
git clone <repository-url>
cd Katelyn
```

---

# 2. Install Dependencies

```bash
npm install
```

---

# 3. Configure Environment Variables

Create a `.env` file in the project root and add the following values:

```env
# Server
PORT=5000
BOT_URL=https://your-domain.com

# Telegram
BOT_API_KEY=your_telegram_bot_token

# Google Gemini API Keys
GOOGLE_API_KEY1=
GOOGLE_API_KEY2=
GOOGLE_API_KEY3=
GOOGLE_API_KEY4=
GOOGLE_API_KEY5=

# PostgreSQL
DATABASE_URL=postgresql://username:password@host:port/database
```

> **Note:** Multiple Gemini API keys are recommended to improve reliability under heavy usage, USE WITH CAUTION.

---

# 4. Create the Database

Create a PostgreSQL database and update the `DATABASE_URL` in your `.env` file to point to it.

---

# 5. Run Database Migrations

Execute the migration files included with the project to create all required tables. 

```bash
node migrations.js # or start the server, migrations run automatically
```

If you're setting up the project for the first time, ensure every migration completes successfully before starting the bot.

---

# 6. Start the Bot

### Development

```bash
npm run dev
```

### Production

```bash
node index.js
```

---

# 7. Verify the Installation

If everything is configured correctly:

* The bot starts without errors.
* PostgreSQL connects successfully.
* The Telegram bot comes online.
* Sending `/start` to your bot receives a response.

---

# Troubleshooting

### Bot doesn't respond

* Verify `BOT_API_KEY` is correct.
* Ensure the bot has been started by messaging it on Telegram.

### Database connection failed

* Confirm PostgreSQL is running.
* Verify the `DATABASE_URL` is correct.

### Gemini API errors

* Ensure your API keys are valid.
* Verify at least one API key has available quota.

### Missing environment variables

Double-check that every required variable exists in your `.env` file before starting the application.

---

# Updating

To update the project:

```bash
git pull
npm install
```

If the release includes database changes, run the latest migrations before restarting the bot.

---

# Need Help?

If you encounter any issues during setup, feel free to open an issue on the repository or contact the developer.
