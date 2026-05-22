# Changelog

All notable changes to the Conversational Telegram Bot (Katelyn) will be documented here.

---

# v1.0.0 - Initial Stable Architecture

## Added

### Core System
- Node.js Telegram chatbot core with personality-driven architecture
- Google Gemini API integration for conversational AI responses
- Modular project structure with separated controllers, services, commands, models, and utilities
- Dynamic command auto-loader from `/cmd` directory

### AI & Conversation Engine
- Structured `systemInstruction` personality control system
- Separate AI pipelines for:
  - Private chats (persistent memory)
  - Group chats (stateless contextual mode)
- Reply-context injection system for group conversations
- Human-like conversational pacing through delayed responses
- Typing indicator simulation using Telegram chat actions

### Memory System
- MongoDB-backed persistent memory system
- Automatic user creation and retrieval flow
- Rolling conversation context storage
- Context capped to latest 10 messages per user

### Queue Architecture
- Centralized queue-based request processing system
- Sequential execution flow to prevent concurrent AI calls
- Retry handling system for failed responses
- Delayed retry cooldown system (15-minute requeue)
- Priority queue support for bot owner requests

### Group Chat Support (Beta)
- Mention-based activation
- Name-trigger activation
- Reply-based activation
- Stateless group mode to avoid context pollution
- Context isolation between group users

### Interaction Layer
- Media filtering system for:
  - Stickers
  - Images
  - Videos
  - Voice notes
- Command system:
  - `/start`
  - `/about`
  - `/support`
  - `/callad`

### Infrastructure
- Express.js health-check server
- Render-compatible self-pinging uptime system
- Environment-based configuration using dotenv
- Telegram polling error logging

---

## Changed

### AI Backend Migration
- Migrated from OpenAI Responses API → Google Generative AI (Gemini 2.5 Flash Lite)
- Replaced traditional prompt handling with `systemInstruction`-based persona control
- Reworked conversational flow into separate private/group execution pipelines

### Queue Improvements
- Improved queue handling to reduce:
  - Race conditions
  - API overload
  - Out-of-order responses
- Added controlled execution cooldown between requests

### Conversation Handling
- Improved personality consistency across sessions
- Improved context formatting before AI generation
- Improved reply detection and contextual awareness in groups

---

## Fixed
- Reduced risk of overlapping AI executions
- Reduced instability during high message load
- Improved fallback handling for failed AI responses
- Improved message ordering consistency

---

# v1.1.0 - API Resilience & Architecture Refactor

## Added

### API Reliability Layer
- Multi-key Gemini API rotation system
- API health-check validation before request execution
- Response gating system to reject invalid AI outputs before pipeline continuation

### Internal Architecture
- Unified AI response generation flow for private and group handling
- Cleaner service separation between:
  - Key selection
  - Key validation
  - Response generation
- Improved modularization of AI-related services
- Added Retry logic

---

## Changed

### System Refactor
- Refactored command execution flow for cleaner handler structure
- Improved separation of concerns across:
  - Controllers
  - Services
  - Models
  - Utilities
- Increased memory length 10 -> 20

### Personality System
- Updated personality instruction rules for:
  - Better conversational consistency
  - Stronger behavior enforcement
  - Reduced assistant-like responses

---

## Removed
- Redundant npm packages unused in production
- Duplicate utility logic related to queue/request handling
- Legacy OpenAI-specific implementation remnants

---

## Fixed
- Reduced risk of API failures propagating into generation pipeline
- Improved handling during API quota exhaustion
- Improved stability under sustained request load
- Reduced inconsistent response behavior across chat types

---

# Notes

- Versions below `v1.0.0` are considered experimental development stages.
- Future updates follow semantic versioning:
  - PATCH → bug fixes
  - MINOR → features and improvements
  - MAJOR → architecture rewrites or breaking changes
