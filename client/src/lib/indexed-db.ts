const DB_NAME = "sese-vault";
const STORE_NAME = "key-value";
const DB_VERSION = 1;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
  });
}

export async function getValue<TValue>(key: string): Promise<TValue | null> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () => {
      resolve((request.result as TValue | undefined) ?? null);
    };
    request.onerror = () => {
      reject(request.error ?? new Error(`Failed to read IndexedDB key: ${key}`));
    };

    transaction.oncomplete = () => {
      database.close();
    };
    transaction.onerror = () => {
      database.close();
    };
  });
}

export async function setValue<TValue>(key: string, value: TValue): Promise<void> {
  const database = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(value, key);

    request.onsuccess = () => resolve();
    request.onerror = () => {
      reject(request.error ?? new Error(`Failed to write IndexedDB key: ${key}`));
    };

    transaction.oncomplete = () => {
      database.close();
    };
    transaction.onerror = () => {
      database.close();
    };
  });
}
