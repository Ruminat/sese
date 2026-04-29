import { sql } from "drizzle-orm";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const DocumentsTable = sqliteTable("documents", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    encryptedContent: text("encrypted_content").notNull(),
    iv: text("iv").notNull(),
    authTag: text("auth_tag").notNull(),
    createdAt: text("created_at").notNull().default(sql `CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql `CURRENT_TIMESTAMP`),
}, (table) => ({
    updatedAtIdx: index("idx_documents_updated_at").on(table.updatedAt),
}));
