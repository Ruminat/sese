const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8787";
const API_KEY = import.meta.env.VITE_API_KEY?.trim();

export type TServerDocument = {
  id: string;
  title: string;
  encryptedContent: string;
  iv: string;
  authTag: string;
  createdAt: string;
  updatedAt: string;
};

type TDocumentPayload = {
  id: string;
  title: string;
  encryptedContent: string;
  iv: string;
  authTag: string;
};

type TUpdateDocumentPayload = Omit<TDocumentPayload, "id">;

export async function listDocuments(): Promise<TServerDocument[]> {
  const response = await requestWithRetry<{ data: TServerDocument[] }>("/docs", {
    method: "GET",
  });

  return response.data;
}

export async function createDocument(payload: TDocumentPayload): Promise<TServerDocument> {
  const response = await requestWithRetry<{ data: TServerDocument }>("/docs", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function updateDocument(
  id: string,
  payload: TUpdateDocumentPayload,
): Promise<TServerDocument> {
  const response = await requestWithRetry<{ data: TServerDocument }>(`/docs/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return response.data;
}

async function requestWithRetry<TResponse>(
  path: string,
  init: RequestInit,
  attempt = 0,
): Promise<TResponse> {
  try {
    return await request<TResponse>(path, init);
  } catch (error: unknown) {
    if (attempt >= 2) {
      throw error;
    }

    const delay = 500 * (attempt + 1);
    await new Promise((resolve) => {
      window.setTimeout(resolve, delay);
    });

    return requestWithRetry(path, init, attempt + 1);
  }
}

async function request<TResponse>(path: string, init: RequestInit): Promise<TResponse> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  if (API_KEY) {
    headers.set("x-api-key", API_KEY);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(message);
  }

  if (response.status === 204) {
    return {} as TResponse;
  }

  return (await response.json()) as TResponse;
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: string };
    if (payload.message) {
      return payload.message;
    }
  } catch {
    // Ignore and fallback to status text below.
  }

  return `Request failed with status ${response.status}`;
}
