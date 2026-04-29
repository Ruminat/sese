import { desc, eq, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { DocumentsTable } from "./model.js";
import { decryptDocumentAtRest, encryptDocumentAtRest } from "./encryption.js";
export async function listDocuments() {
    const rows = await db
        .select()
        .from(DocumentsTable)
        .orderBy(desc(DocumentsTable.updatedAt));
    return Promise.all(rows.map(async (row) => {
        const decrypted = await decryptDocumentAtRest({
            encryptedContent: row.encryptedContent,
            iv: row.iv,
            authTag: row.authTag,
        });
        return {
            ...row,
            encryptedContent: decrypted.encryptedContent,
            iv: decrypted.iv,
            authTag: decrypted.authTag,
        };
    }));
}
export async function getDocumentById(id) {
    const rows = await db
        .select()
        .from(DocumentsTable)
        .where(eq(DocumentsTable.id, id))
        .limit(1);
    const row = rows[0] ?? null;
    if (!row) {
        return null;
    }
    const decrypted = await decryptDocumentAtRest({
        encryptedContent: row.encryptedContent,
        iv: row.iv,
        authTag: row.authTag,
    });
    return {
        ...row,
        encryptedContent: decrypted.encryptedContent,
        iv: decrypted.iv,
        authTag: decrypted.authTag,
    };
}
export async function createDocument(input) {
    const encrypted = await encryptDocumentAtRest({
        encryptedContent: input.encryptedContent,
        iv: input.iv,
        authTag: input.authTag,
    });
    const rows = await db
        .insert(DocumentsTable)
        .values({
        ...input,
        encryptedContent: encrypted.encryptedContent,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
    })
        .returning();
    const row = rows[0] ?? null;
    if (!row) {
        return null;
    }
    return {
        ...row,
        encryptedContent: input.encryptedContent,
        iv: input.iv,
        authTag: input.authTag,
    };
}
export async function updateDocument(id, input) {
    const hasEncryptedPayload = input.encryptedContent !== undefined && input.iv !== undefined && input.authTag !== undefined;
    const encryptedPayload = hasEncryptedPayload
        ? await encryptDocumentAtRest({
            encryptedContent: input.encryptedContent,
            iv: input.iv,
            authTag: input.authTag,
        })
        : null;
    const rows = await db
        .update(DocumentsTable)
        .set({
        ...input,
        ...(encryptedPayload
            ? {
                encryptedContent: encryptedPayload.encryptedContent,
                iv: encryptedPayload.iv,
                authTag: encryptedPayload.authTag,
            }
            : {}),
        updatedAt: sql `CURRENT_TIMESTAMP`,
    })
        .where(eq(DocumentsTable.id, id))
        .returning();
    const row = rows[0] ?? null;
    if (!row) {
        return null;
    }
    const decrypted = await decryptDocumentAtRest({
        encryptedContent: row.encryptedContent,
        iv: row.iv,
        authTag: row.authTag,
    });
    return {
        ...row,
        encryptedContent: decrypted.encryptedContent,
        iv: decrypted.iv,
        authTag: decrypted.authTag,
    };
}
export async function deleteDocument(id) {
    const rows = await db
        .delete(DocumentsTable)
        .where(eq(DocumentsTable.id, id))
        .returning({ id: DocumentsTable.id });
    return rows.length > 0;
}
