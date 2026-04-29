# Agent Task Board - Secure Markdown Vault

## Project Status
- Started: 2026-04-27
- Current Phase: Polish

## Architecture Decision Record

### Non-Negotiable Implementation Rules
- NEVER implement custom parsing, escaping, encryption, key-derivation, or authentication primitives in project code.
- ALWAYS use production-ready, maintained libraries for markdown parsing/sanitization and cryptography.
- Security-sensitive logic must follow current OWASP + library-vendor recommendations and be parameterized for upgrades (rehash/rekey strategy).
- v0 design artifacts in `components/` are the UI source of truth; new UI work must be built around those components/patterns, not ad-hoc scratch layouts.

### Frontend Structure
```md
- `client/` will contain a Vite + React + TypeScript application focused on local encryption, markdown editing, and UI state.
- UI will be component-driven with reusable primitives for editor, preview, document list, encryption status, and PIN flows.
- Client will own all plaintext handling and both encryption layers before API calls.
```

### Tech Stack Choices
- React + TypeScript + Vite for fast iteration and type-safe UI development.
- Express on Node.js for straightforward REST endpoints and middleware ecosystem.
- Turso via `@libsql/client` for lightweight managed SQL with easy local-to-cloud workflow.
- Drizzle ORM + Drizzle Kit for typed schema definitions, query safety, and repeatable migrations.
- `markdown-it` + `DOMPurify` for production-grade markdown parsing and HTML sanitization.
- `libsodium` (`libsodium-wrappers-sumo`) for client/server cryptography primitives (AEAD + Argon2id password hashing/KDF).
- `@vpriem/express-api-key-auth` middleware for API key authentication (no handcrafted auth checks).
- Server-side at-rest envelope encryption over already client-encrypted payloads using XChaCha20-Poly1305.

### Data Flow
```txt
[Client] → libsodium Argon2id PIN KDF + Client Key → Double AEAD Encryption → [Server]
[Server] → Optional API key auth + At-Rest AEAD Envelope Encryption → [Turso]
[Server] → Decrypt server envelope only → [Client] → Double Decryption → Markdown Render (sanitized)
```

### Database Schema
```sql
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  encrypted_content TEXT NOT NULL,
  iv TEXT NOT NULL,
  auth_tag TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at);
```

## Task Board

### Phase 0: Project Setup & Architecture ✅
- [x] Create AGENTS.md (this file)
- [x] Initialize project structure (frontend + backend folders)
- [x] Configure TypeScript, Vite, Express
- [x] Set up Turso DB and create initial schema

### Phase 1: Backend Core
- [x] Document model with id, title, encrypted_content (TEXT), iv, auth_tag, created_at, updated_at
- [x] CRUD endpoints: GET /docs, POST /docs, PUT /docs/:id, DELETE /docs/:id
- [x] No decryption on server (store blob as-is)
- [x] Authentication? (Decide: simple API key or skip for MVP since encryption is client-side)

### Phase 2: Frontend Encryption Layer
- [x] Client key generation (Web Crypto, persist to IndexedDB)
- [x] PIN setup and verification (derive encryption key via PBKDF2)
- [x] Double encryption function: encrypt(plaintext, clientKey, pinKey) → encryptedBlob
- [x] Double decryption function: decrypt(encryptedBlob, clientKey, pinKey) → plaintext

### Phase 3: UI Components (from v0 design)
- [x] PIN prompt modal
- [x] Dashboard with document list
- [x] Editor (CodeMirror or custom textarea)
- [x] Preview pane with custom markdown renderer
- [x] Custom elements: Card, Password, Note, Field components with copy/reveal

### Phase 4: Integration
- [x] Connect frontend to backend API
- [x] Auto-save (debounced every 3 seconds)
- [x] Error handling + retry logic
- [x] Encryption status indicators (real, not mock)

### Phase 5: Polish
- [x] Toast notifications
- [x] Loading states
- [x] Responsive mobile layout
- [x] Export/backup functionality

### Phase 6: Entry + Mode Selection
- [x] Task 1: Route split and gateway entry page (`/` shows Local Mode + Auth Mode, vault moved to `/vault`)
- [x] Task 2: Implement Auth/Sync setup form (`/auth`) with persisted mode selection
- [x] Task 3: Add route guard so `/vault` requires mode selection before access
- [x] Task 4: Wire selected auth mode into API client behavior and session bootstrap
- [x] Task 5: QA the full onboarding flow and update docs/env examples

## Current Task
Phase 6 onboarding flow complete; next focus is Turso credentialed migration run + final cleanup pass.

## QA Progress
- ✅ Client TypeScript + production build passes after v0-aligned component migration.
- ✅ Server TypeScript build passes with libsodium envelope encryption + auth middleware changes.
- ✅ Runtime API smoke checks passed locally (`POST /docs` rejects without API key, succeeds with API key, and `GET /docs` returns decryptable client payload envelope).
- ✅ UI runtime QA covered via automated app-flow tests (`client/src/App.qa.test.tsx`) for PIN unlock, 3-second autosave sync trigger, and backup export action.
- ✅ Migration verification completed with Drizzle:
  - `npm run db:generate` produced baseline table migration plus follow-up index migration (`idx_documents_updated_at`).
  - `npm run db:push` succeeded against a clean local libSQL database (`LOCAL_DB_PATH=./data/migration-verify.db`).
- ✅ Added repeatable migration schema assertion command (`npm run db:verify`) and validated against local verification DB.
- ✅ Root route now shows entry gateway page with Local Mode and Auth/Sync Mode choices; vault UI moved to `/vault`.
- ✅ `/auth` now includes a working setup form that persists access mode + API config to local storage before entering `/vault`.
- ✅ Access-mode storage now follows Cube Shrine pattern (`@nanostores/persistent` + hydration-safe reads), and `/vault` redirects unless mode prerequisites are satisfied.
- ✅ Vault bootstrap is now mode-aware: app session receives persisted mode/API settings and exposes API bootstrap config in app context.
- ✅ Onboarding QA smoke checks passed on dev server: `/` gateway renders, `/auth` setup form renders, `/vault` guard blocks entry until mode prerequisites are met.
- ✅ Added root `.env.example` with `NEXT_PUBLIC_DEFAULT_API_URL` and wired `/auth` to prefill API URL from this environment fallback.

## Blockers / Notes
- Existing repository already contains a Next.js application at root; initial SeSe scaffold is being added in parallel to avoid destructive migration.
- Installed dependencies:
  - Client runtime: `react`, `react-dom`
  - Client dev: `typescript`, `vite@5.4.19`, `@vitejs/plugin-react`, `@types/react`, `@types/react-dom`
  - Server runtime: `express`, `cors`, `dotenv`, `@libsql/client`, `zod`
  - Server dev: `typescript`, `tsx`, `@types/node`, `@types/express`, `@types/cors`
- Toolchain note: Vite was pinned to `5.4.19` for compatibility with the current local Node version.
- Added Turso setup artifacts:
  - `server/schema.sql`
  - `server/.env.example`
  - `server/package.json` scripts: `db:generate`, `db:push`, `db:studio`, `db:init`, `db:verify`
- `db:init` was verified in local DB mode; running it against Turso still requires explicit confirmation plus real Turso credentials.
- Local migration verification is now complete in dev-mode local DB; production/Turso migration still requires real `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` credentials.
- Added `server/scripts/verify-migration.mjs` to assert required `documents` columns and `idx_documents_updated_at` index after migrations.
- Drizzle integration added:
  - `server/drizzle.config.ts`
  - `server/src/common/environment.ts`
  - `server/src/db/client.ts`
  - `server/src/modules/documents/model.ts`
  - `server/src/modules/documents/repository.ts`
  - Removed legacy raw DB bootstrap files in favor of Drizzle-based structure.
- Security baseline references applied:
  - OWASP Password Storage Cheat Sheet: Argon2id preferred, salts required, tunable work factors.
  - OWASP Cryptographic Storage Cheat Sheet: use authenticated encryption modes and secure key management.
  - markdown-it security guidance: keep HTML disabled and sanitize rendered output.
