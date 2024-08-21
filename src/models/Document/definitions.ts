export type TDocument = {
  secret: boolean;
  name: string;
  code: string;
  content: string;
  createdAt: number;
};

export type TDocumentForm = Pick<TDocument, "secret" | "name" | "content">;
