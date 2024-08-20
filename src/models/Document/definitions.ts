export type TDocument = {
  secret: boolean;
  title: string;
  code: string;
  content: string;
  createdAt: number;
};

export type TDocumentForm = Pick<TDocument, "secret" | "title" | "content">;
