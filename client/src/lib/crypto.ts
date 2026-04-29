import { getValue, setValue } from "./indexed-db";
import { getSodium } from "./sodium";

const CLIENT_KEY_STORAGE_KEY = "client-key";
const PIN_CONFIG_STORAGE_KEY = "sese-pin-config";

type TEncryptedBlob = {
  version: 2;
  encryptedContent: string;
  nonce: string;
};

type TPinConfig = {
  salt: string;
  pinHash: string;
  keyOpsLimit: number;
  keyMemLimit: number;
  hashOpsLimit: number;
  hashMemLimit: number;
};

const PIN_KEY_OPS_LIMIT_FALLBACK = 4;
const PIN_KEY_MEM_LIMIT_FALLBACK = 64 * 1024 * 1024;
const PIN_HASH_OPS_LIMIT_FALLBACK = 2;
const PIN_HASH_MEM_LIMIT_FALLBACK = 64 * 1024 * 1024;

export async function getOrCreateClientKey(): Promise<Uint8Array> {
  const sodium = await getSodium();
  const persistedKey = await getValue<string>(CLIENT_KEY_STORAGE_KEY);

  if (persistedKey) {
    return sodium.from_base64(persistedKey, sodium.base64_variants.ORIGINAL);
  }

  const keyBytes = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES);
  await setValue(CLIENT_KEY_STORAGE_KEY, sodium.to_base64(keyBytes, sodium.base64_variants.ORIGINAL));
  return keyBytes;
}

export function hasPinConfig(): boolean {
  return readPinConfig() !== null;
}

export async function setupPin(pin: string): Promise<Uint8Array> {
  const sodium = await getSodium();
  const salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
  const pinHash = sodium.crypto_pwhash_str(
    pin,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
  );
  const pinKey = sodium.crypto_pwhash(
    sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES,
    pin,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_MODERATE ?? PIN_KEY_OPS_LIMIT_FALLBACK,
    sodium.crypto_pwhash_MEMLIMIT_MODERATE ?? PIN_KEY_MEM_LIMIT_FALLBACK,
    sodium.crypto_pwhash_ALG_ARGON2ID13,
  );

  const config: TPinConfig = {
    salt: sodium.to_base64(salt, sodium.base64_variants.ORIGINAL),
    pinHash,
    keyOpsLimit: sodium.crypto_pwhash_OPSLIMIT_MODERATE ?? PIN_KEY_OPS_LIMIT_FALLBACK,
    keyMemLimit: sodium.crypto_pwhash_MEMLIMIT_MODERATE ?? PIN_KEY_MEM_LIMIT_FALLBACK,
    hashOpsLimit: sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE ?? PIN_HASH_OPS_LIMIT_FALLBACK,
    hashMemLimit: sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE ?? PIN_HASH_MEM_LIMIT_FALLBACK,
  };

  localStorage.setItem(PIN_CONFIG_STORAGE_KEY, JSON.stringify(config));
  return pinKey;
}

export async function verifyPin(pin: string): Promise<Uint8Array | null> {
  const sodium = await getSodium();
  const config = readPinConfig();

  if (!config) {
    return null;
  }

  const isValidPin = sodium.crypto_pwhash_str_verify(config.pinHash, pin);
  if (!isValidPin) {
    return null;
  }

  const salt = sodium.from_base64(config.salt, sodium.base64_variants.ORIGINAL);
  return sodium.crypto_pwhash(
    sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES,
    pin,
    salt,
    config.keyOpsLimit,
    config.keyMemLimit,
    sodium.crypto_pwhash_ALG_ARGON2ID13,
  );
}

export async function encryptForStorage(
  plaintext: string,
  clientKey: Uint8Array,
  pinKey: Uint8Array,
): Promise<{ encryptedContent: string; iv: string; authTag: string }> {
  const sodium = await getSodium();
  const innerNonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
  const innerCiphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    plaintext,
    null,
    null,
    innerNonce,
    clientKey,
  );

  const innerBlob: TEncryptedBlob = {
    version: 2,
    encryptedContent: sodium.to_base64(innerCiphertext, sodium.base64_variants.ORIGINAL),
    nonce: sodium.to_base64(innerNonce, sodium.base64_variants.ORIGINAL),
  };

  const outerNonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
  const outerCiphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    JSON.stringify(innerBlob),
    null,
    null,
    outerNonce,
    pinKey,
  );

  return {
    encryptedContent: sodium.to_base64(outerCiphertext, sodium.base64_variants.ORIGINAL),
    iv: sodium.to_base64(outerNonce, sodium.base64_variants.ORIGINAL),
    authTag: "mac-included",
  };
}

export async function decryptFromStorage(
  encryptedContent: string,
  iv: string,
  _authTag: string,
  clientKey: Uint8Array,
  pinKey: Uint8Array,
): Promise<string> {
  const sodium = await getSodium();

  const outerCiphertext = sodium.from_base64(encryptedContent, sodium.base64_variants.ORIGINAL);
  const outerNonce = sodium.from_base64(iv, sodium.base64_variants.ORIGINAL);
  const outerJson = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null,
    outerCiphertext,
    null,
    outerNonce,
    pinKey,
  );

  const parsedInner = JSON.parse(sodium.to_string(outerJson)) as TEncryptedBlob;
  if (parsedInner.version !== 2) {
    throw new Error("Unsupported encrypted payload format");
  }

  const innerCiphertext = sodium.from_base64(
    parsedInner.encryptedContent,
    sodium.base64_variants.ORIGINAL,
  );
  const innerNonce = sodium.from_base64(parsedInner.nonce, sodium.base64_variants.ORIGINAL);

  const decrypted = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null,
    innerCiphertext,
    null,
    innerNonce,
    clientKey,
  );

  return sodium.to_string(decrypted);
}

function readPinConfig(): TPinConfig | null {
  const rawValue = localStorage.getItem(PIN_CONFIG_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as TPinConfig;
    if (
      !parsed.salt ||
      !parsed.pinHash ||
      !parsed.keyOpsLimit ||
      !parsed.keyMemLimit ||
      !parsed.hashOpsLimit ||
      !parsed.hashMemLimit
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
