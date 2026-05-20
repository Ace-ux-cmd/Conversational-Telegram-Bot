# Changelog

All notable changes to the Conversational Telegram Bot (Katelyn) will be documented here.

---

## v1.0.0 - Initial Stable Architecture

### Added
- Node.js Telegram chatbot core with personality-driven design
- Google Gemini API integration for conversational responses
- MongoDB user memory system (persistent private chat memory)
- Queue-based message processing system for controlled execution flow
- Group chat awareness using mention, name-trigger, and reply detection
- Stateless group chat mode (no long-term context storage)
- Retry handling system with delayed re-queue logic
- Priority queue support for bot owner messages
- Express server for health checks and uptime monitoring
- Self-pinging system to prevent hosting sleep (Render)
- Dynamic command loader from `/cmd` directory
- Basic command system:
  - `/start`
  - `/about`
  - `/support`
  - `/callad`
- Typing indicator simulation (`sendChatAction`)
- Randomized response delay system (5–10 seconds)
- Media filtering (sticker, image, video, voice handling)

### Changed
- Migrated AI backend from OpenAI Responses API to Google Generative AI (Gemini 2.5 Flash Lite)
- Replaced prompt handling with `systemInstruction`-based personality control
- Reworked conversation engine into separate pipelines:
  - Private chat pipeline (memory + DB context)
  - Group chat pipeline (stateless context only)
- Improved queue system to prevent race conditions and API overload

---

## v1.1.0 - API Resilience & Architecture Refactor

### Added
- API key rotation module for distributing requests across multiple Gemini keys
- API health-check module that validates selected key before sending request
- Response gating system: only valid API responses proceed to generator pipeline

### Changed
- Refactored response handling in command system for cleaner execution flow
- Improved separation between:
  - key selection
  - key validation
  - response generation (private + group unified flow)
- Updated bot personality instructions for stronger consistency and behavior control

### Removed
- Redundant npm packages that were not used in production logic
- Unused utility modules that duplicated queue and request handling logic

### Fixed
- Reduced risk of API failures propagating into response generation layer
- Improved stability during high request load or key exhaustion scenarios

---

## Notes
- Versions below `v1.0.0` are considered experimental development stages.
- Future updates will follow semantic versioning:
  - PATCH: bug fixes
  - MINOR: new features
  - MAJOR: breaking changes or architecture rewrites