# Security Recommendations for SeSe

This document captures recommended security improvements for the current SeSe repository state. Items are prioritized so you can phase them in.

## Threat Model Snapshot

- App is local-first with client-side encryption, optional API sync, and server-side at-rest envelope encryption.
- Main risks: browser storage compromise, XSS leading to key exfiltration, offline PIN brute force, API key leakage, and ciphertext replay/tampering.
- Goal: preserve usability while raising cost of key recovery and limiting blast radius of compromise.

## Priority 0 (Do First)

### 1) Add unlock throttling and lockout

- Add failed-attempt tracking in the client unlock flow.
- Use exponential backoff plus cooldown windows after repeated failures.
- Example policy:
  - 1-4 failures: normal.
  - 5 failures: 30s lockout.
  - 6 failures: 60s.
  - 7+ failures: 2m, then cap at 5m.
- Store lockout state in memory and optionally localStorage (to survive reload).
- Return generic error messages; do not reveal useful timing or state details.

### 2) Strengthen PIN policy or move to passphrase default

- Current 4-6 digit PIN UX is convenient but weak against offline attacks.
- Recommended:
  - Default mode: passphrase (>= 12 chars, entropy guidance).
  - Optional mode: numeric PIN (>= 8 digits) with explicit warning.
- Add weak-secret checks (e.g., repeated/sequential PINs, common values).

### 3) Bind encryption context via AEAD Associated Data (AAD)

- Add AAD in both client and server AEAD calls.
- Include context fields like:
  - `docId`
  - payload/envelope version
  - mode (`local` or `auth-sync`)
  - layer (`client-inner`, `client-outer`, `server-envelope`)
- This prevents undetected ciphertext cut-and-paste across records.

### 4) Fail closed for server envelope validation

- Do not bypass decryption path based on mutable marker alone.
- If record indicates envelope format but fails validation/decryption, fail request.
- Add strict record/version checks before returning data to client.

## Priority 1 (High Value)

### 5) Argon2id runtime calibration

- Instead of fixed cost values, calibrate on first run to target ~250-500ms derivation time on current device.
- Persist selected params with versioning.
- Recalibrate on major app upgrades or explicit user action.

### 6) Hash/key parameter versioning with rehash migration

- Store KDF metadata (`alg`, `opsLimit`, `memLimit`, `version`) alongside PIN config.
- On successful unlock:
  - If params are outdated, derive with old params, then re-derive/rewrite with new params.
- This supports safe long-term upgrades.

### 7) Improve secret storage strategy

- Avoid keeping all critical materials in one easily script-accessible context.
- Consider:
  - Keep client key wrapped by PIN-derived key (rather than plaintext key in IndexedDB).
  - Keep API keys in session memory where possible (or use short-lived tokens).
- Understand browser storage is not safe against successful XSS.

### 8) Enforce secure transport defaults

- In auth/sync mode, require HTTPS for non-localhost API URLs.
- Reject `http://` outside localhost/dev.
- Add clear warnings in setup UI for insecure endpoints.

## Priority 2 (Defense in Depth)

### 9) Add CSP and harden frontend against XSS

- Introduce a strict Content Security Policy:
  - disallow inline scripts where possible
  - restrict script sources
  - tighten connect/img/frame-src
- Audit markdown/custom element rendering paths for injection vectors.
- Keep sanitizer dependencies current.

### 10) Secure API key handling

- Replace static API key where possible with scoped, rotated, short-lived credentials.
- If static key remains:
  - enforce rotation policy
  - support key revocation
  - scope permissions minimally

### 11) Logging and error hygiene

- Never log plaintext content, derived keys, raw ciphertext blobs, PIN input, or secret env values.
- Scrub sensitive fields from server error objects before response.

### 12) Backup/export hardening

- Current backup exports plaintext markdown JSON.
- Add encrypted export option by default:
  - require passphrase at export time
  - include KDF params and nonce in backup metadata
- Display explicit risk warning for plaintext export.

## PIN Hardening Plan (Focused)

If only PIN-related work is done first, implement in this order:

1. Enforce stronger secret policy (prefer passphrase; PIN >= 8 digits).
2. Add attempt throttling + lockout.
3. Add Argon2 calibration and versioned params.
4. Add migration path for existing users.
5. Add UI indicators: failed attempts remaining, cooldown timer.

## Suggested Minimal v1 Security Patch Set

For a practical first hardening pass with manageable scope:

1. Client unlock throttling + cooldown.
2. Stronger PIN/passphrase rules in setup/verify flow.
3. AEAD AAD binding in client encryption/decryption.
4. Strict fail-closed server envelope validation.
5. HTTPS enforcement for non-localhost API URLs.

## Validation Checklist (Post-Implementation)

- Brute force simulation confirms lockout behavior and cooldown persistence.
- Existing encrypted documents still decrypt after migration/version updates.
- AAD tamper tests fail decryption as expected.
- Envelope-marker tampering fails closed on server.
- Non-HTTPS API URL is rejected in auth/sync mode (except localhost/dev).
- No sensitive data appears in logs or error responses.

## Notes

- Strong cryptography primitives are already in use (libsodium, XChaCha20-Poly1305, Argon2id), which is a solid base.
- Most remaining risk is implementation-level hardening and secret lifecycle management.
