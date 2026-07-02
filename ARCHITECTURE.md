# Documentation

This document provides an overview of Katelyn's internal architecture and how the various components work together.

It is intended for developers who want to understand, modify, or contribute to the project.

---

# Table of Contents

* Project Structure
* System Overview
* Request Lifecycle
* AI Pipeline
* Message Queue
* Conversation Memory
* Group Chat Handling
* Image Processing
* Voice Processing
* Database
* Scheduling
* Commands
* User Roles
* Error Handling
* Configuration
* Deployment Notes

---

# Project Structure

```text
Katelyn/
├── cmd/               # Telegram commands
├── controllers/       # Update handlers
├── services/          # AI and business logic
├── models/            # Database models
├── middleware/        # Shared middleware
├── utils/             # Helper utilities
├── migrations/        # Database migrations
├── media/             # Images and documentation assets
├── index.js           # Application entry point
└── ...
```

---

# System Overview

Katelyn is organized into independent modules with clear responsibilities. Incoming Telegram updates are validated, processed, routed to the appropriate handler, passed through the AI pipeline when necessary, and finally persisted to the database before a response is sent back to Telegram.

The application emphasizes separation of concerns, allowing each module to focus on a single responsibility.

---

# Request Lifecycle

A typical request follows this flow:

```text
Telegram
    │
    ▼
Update Handler
    │
    ▼
Message Validation
    │
    ▼
Queue System
    │
    ▼
AI Processing
    │
    ▼
Database Update
    │
    ▼
Telegram Response
```

Image and voice messages follow specialized processing paths before entering the AI pipeline.

---

# AI Pipeline

The AI layer is responsible for generating responses, managing conversation history, and selecting the appropriate model depending on the message type.

Current model routing:

| Conversation Type | Model                          |
| ----------------- | ------------------------------ |
| Private Chat      | `gemini-3.1-flash-lite`        |
| Images            | `gemini-3.1-flash-lite`        |
| Group Chat        | `gemini-2.5-flash-lite`        |
| Voice (TTS/STT)   | `gemini-3.1-flash-tts-preview` |

---

# Message Queue

Katelyn processes AI requests through a queue to maintain predictable execution order and reduce overlapping requests.

The queue:

* Processes requests sequentially
* Supports retries after failures
* Separates image requests from text requests
* Prioritizes owner override operations when required

---

# Conversation Memory

Private conversations maintain persistent history stored in PostgreSQL.

Conversation memory is used to:

* Remember previous discussions
* Maintain conversational consistency
* Improve contextual understanding

Group conversations remain context-aware without permanently storing unnecessary history.

---

# Group Chat Handling

Group conversations support:

* Reply-based activation
* Mention-based activation
* Bot username detection
* Role awareness
* Group metadata

The bot avoids interrupting conversations unless directly addressed.

---

# Image Processing

When an image is received:

1. Telegram media is downloaded.
2. The image is optimized.
3. The AI analyzes the image.
4. The result is converted into conversation history.
5. The response is generated and returned.

Image requests are processed independently from normal text messages.

---

# Voice Processing

Voice interactions support both speech recognition and speech generation.

Incoming voice messages are converted into text before entering the AI pipeline.

Responses can optionally be generated as synthesized speech.

---

# Database

Katelyn uses PostgreSQL for persistent storage.

Major tables include:

* users
* groups
* group_members
* messages
* leaderboard
* daily_usage
* ai_requests
* bot_health

---

# Commands

Commands are automatically loaded during application startup.

Examples include:

* `/help`
* `/daily`
* `/rank`
* `/quiz`
* `/slot`
* `/truthordare`
* `/ping`
* `/ban`
* `/unban`
* `/notify`
* `/leave`

---

# User Roles

Katelyn supports multiple permission levels.

* Owner
* Administrator
* User

Certain commands and moderation features are restricted based on role.

---

# Scheduling

The scheduler manages recurring tasks such as:

* Daily reward resets
* Activity updates
* Database maintenance
* Cleanup tasks
* Health monitoring

---

# Error Handling

The application includes protections against:

* API failures
* Database errors
* Invalid requests
* Network interruptions
* Media download failures
* Rate limits

Where appropriate, failed operations are retried before being discarded.

---

# Configuration

Configuration is provided through environment variables.

See **SETUP.md** for complete installation and configuration instructions.

---

# Deployment Notes

Katelyn can be deployed anywhere that supports Node.js and PostgreSQL.

After deployment:

1. Configure environment variables.
2. Run database migrations.
3. Start the application.
4. Verify the bot is online.

Everything is preconfigured. See **SETUP.md** to get started.

---

# Additional Documentation

* **README.md** — Project overview
* **SETUP.md** — Installation guide
* **CHANGELOG.md** — Version history
* **LICENSE** — Licensing information

```
```
