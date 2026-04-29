import "dotenv/config";
import cors from "cors";
import express from "express";
import { z } from "zod";
import { apiKeyAuth } from "@vpriem/express-api-key-auth";
import { getEnvironmentVariables } from "./common/environment.js";
import { libsqlClient } from "./db/client.js";
import { createDocument, deleteDocument, listDocuments, updateDocument, } from "./modules/documents/repository.js";
const app = express();
const { port, serverApiKey } = getEnvironmentVariables();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
if (serverApiKey) {
    app.use("/docs", apiKeyAuth([serverApiKey]));
}
const documentIdSchema = z.object({
    id: z.string().trim().min(1, "Document id is required"),
});
const createDocumentSchema = z.object({
    id: z.string().trim().min(1, "Document id is required"),
    title: z.string().trim().min(1, "Title is required"),
    encryptedContent: z.string().min(1, "Encrypted content is required"),
    iv: z.string().min(1, "IV is required"),
    authTag: z.string().min(1, "Auth tag is required"),
}).strict();
const updateDocumentSchema = z
    .object({
    title: z.string().trim().min(1, "Title is required").optional(),
    encryptedContent: z
        .string()
        .min(1, "Encrypted content is required")
        .optional(),
    iv: z.string().min(1, "IV is required").optional(),
    authTag: z.string().min(1, "Auth tag is required").optional(),
})
    .strict()
    .refine((value) => {
    const encryptionFieldCount = [
        value.encryptedContent !== undefined,
        value.iv !== undefined,
        value.authTag !== undefined,
    ].filter(Boolean).length;
    return encryptionFieldCount === 0 || encryptionFieldCount === 3;
}, {
    message: "encryptedContent, iv, and authTag must be provided together",
})
    .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided for update",
});
app.get("/docs", async (_req, res) => {
    try {
        const documents = await listDocuments();
        res.json({ data: documents });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ message: "Failed to list documents", error: message });
    }
});
app.post("/docs", async (req, res) => {
    const parseResult = createDocumentSchema.safeParse(req.body);
    if (!parseResult.success) {
        res.status(400).json({ message: "Invalid request body", errors: parseResult.error.flatten() });
        return;
    }
    try {
        const document = await createDocument(parseResult.data);
        if (!document) {
            res.status(500).json({ message: "Failed to create document" });
            return;
        }
        res.status(201).json({ data: document });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const isConflict = message.includes("UNIQUE constraint failed");
        res.status(isConflict ? 409 : 500).json({
            message: isConflict ? "Document with this id already exists" : "Failed to create document",
            error: message,
        });
    }
});
app.put("/docs/:id", async (req, res) => {
    const idResult = documentIdSchema.safeParse(req.params);
    if (!idResult.success) {
        res.status(400).json({ message: "Invalid document id", errors: idResult.error.flatten() });
        return;
    }
    const updateResult = updateDocumentSchema.safeParse(req.body);
    if (!updateResult.success) {
        res.status(400).json({ message: "Invalid request body", errors: updateResult.error.flatten() });
        return;
    }
    try {
        const updatedDocument = await updateDocument(idResult.data.id, updateResult.data);
        if (!updatedDocument) {
            res.status(404).json({ message: "Document not found" });
            return;
        }
        res.json({ data: updatedDocument });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ message: "Failed to update document", error: message });
    }
});
app.delete("/docs/:id", async (req, res) => {
    const idResult = documentIdSchema.safeParse(req.params);
    if (!idResult.success) {
        res.status(400).json({ message: "Invalid document id", errors: idResult.error.flatten() });
        return;
    }
    try {
        const wasDeleted = await deleteDocument(idResult.data.id);
        if (!wasDeleted) {
            res.status(404).json({ message: "Document not found" });
            return;
        }
        res.status(204).send();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ message: "Failed to delete document", error: message });
    }
});
app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "sese-server" });
});
app.get("/health/db", async (_req, res) => {
    try {
        await libsqlClient.execute("SELECT 1");
        res.json({ status: "ok", database: "reachable" });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ status: "error", database: "unreachable", message });
    }
});
app.listen(port, () => {
    console.log(`SeSe server listening on http://localhost:${port}`);
});
