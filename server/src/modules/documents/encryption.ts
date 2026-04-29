import sodium from "libsodium-wrappers-sumo";
import { getEnvironmentVariables } from "../../common/environment.js";

const SERVER_ENCRYPTION_MARKER = "server:v1:libsodium";

type TEncryptedDocumentRecord = {
  encryptedContent: string;
  iv: string;
  authTag: string;
};

type TDecryptedDocumentRecord = {
  encryptedContent: string;
  iv: string;
  authTag: string;
};

type TServerEnvelope = {
  version: 1;
  payload: string;
};

let keyPromise: Promise<Uint8Array> | null = null;

export async function encryptDocumentAtRest(
  record: TEncryptedDocumentRecord,
): Promise<TEncryptedDocumentRecord> {
  const key = await getServerEncryptionKey();
  await sodium.ready;

  const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
  const envelope: TServerEnvelope = {
    version: 1,
    payload: JSON.stringify(record),
  };
  const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    JSON.stringify(envelope),
    null,
    null,
    nonce,
    key,
  );

  return {
    encryptedContent: sodium.to_base64(ciphertext, sodium.base64_variants.ORIGINAL),
    iv: sodium.to_base64(nonce, sodium.base64_variants.ORIGINAL),
    authTag: SERVER_ENCRYPTION_MARKER,
  };
}

export async function decryptDocumentAtRest(
  record: TEncryptedDocumentRecord,
): Promise<TDecryptedDocumentRecord> {
  if (record.authTag !== SERVER_ENCRYPTION_MARKER) {
    return record;
  }

  const key = await getServerEncryptionKey();
  await sodium.ready;

  const nonce = sodium.from_base64(record.iv, sodium.base64_variants.ORIGINAL);
  const ciphertext = sodium.from_base64(
    record.encryptedContent,
    sodium.base64_variants.ORIGINAL,
  );
  const envelopeJson = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null,
    ciphertext,
    null,
    nonce,
    key,
  );
  const envelope = JSON.parse(sodium.to_string(envelopeJson)) as TServerEnvelope;

  if (envelope.version !== 1) {
    throw new Error("Unsupported server encryption envelope");
  }

  const decryptedRecord = JSON.parse(envelope.payload) as TDecryptedDocumentRecord;
  if (!decryptedRecord.encryptedContent || !decryptedRecord.iv || !decryptedRecord.authTag) {
    throw new Error("Invalid decrypted document envelope");
  }

  return decryptedRecord;
}

async function getServerEncryptionKey(): Promise<Uint8Array> {
  if (!keyPromise) {
    keyPromise = (async () => {
      await sodium.ready;
      const { serverEncryptionKey } = getEnvironmentVariables();
      const key = sodium.from_base64(serverEncryptionKey, sodium.base64_variants.ORIGINAL);
      const expectedLength = sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES;

      if (key.length !== expectedLength) {
        throw new Error(
          `SERVER_ENCRYPTION_KEY must decode to ${expectedLength} bytes for XChaCha20-Poly1305.`,
        );
      }

      return key;
    })();
  }

  return keyPromise;
}
