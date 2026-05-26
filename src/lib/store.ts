import { readFile, writeFile } from "fs/promises";
import path from "path";
import { seedStore } from "./seed";
import type { Store } from "./types";

const storePath = path.join(process.cwd(), "data", "store.json");

const emptyStore: Store = {
  users: [],
  salons: [],
  services: [],
  bookings: [],
  payments: [],
  otpSessions: [],
};

let writeLock: Promise<void> = Promise.resolve();
let cachedStore: Store | null = null;
let lastLoadTime = 0;
const CACHE_TTL = 5000; // Cache for 5 seconds
let isReadOnly = false; // Flag to detect read-only filesystem

const persistStore = async (store: Store) => {
  // Skip writing if filesystem is read-only (Vercel serverless)
  if (isReadOnly) {
    return;
  }

  try {
    await writeFile(storePath, JSON.stringify(store, null, 2), "utf-8");
  } catch (error: any) {
    // If write fails due to read-only filesystem, mark as read-only and continue
    if (error.code === "EROFS" || error.code === "EACCES") {
      isReadOnly = true;
      console.warn(
        "⚠️  Read-only filesystem detected. Running in ephemeral mode. Data will persist only during this request."
      );
      return;
    }
    // For other errors, still throw
    throw error;
  }
};

export const loadStore = async (): Promise<Store> => {
  try {
    const now = Date.now();
    if (cachedStore && now - lastLoadTime < CACHE_TTL) {
      return cachedStore;
    }

    const raw = await readFile(storePath, "utf-8");
    const parsed = JSON.parse(raw) as Store;
    const seeded = seedStore(parsed);
    if (seeded !== parsed) {
      await persistStore(seeded);
    }
    cachedStore = seeded;
    lastLoadTime = now;
    isReadOnly = false; // Successfully read, so filesystem is readable
    return seeded;
  } catch (error: any) {
    // If read fails due to read-only filesystem or missing file, use in-memory data
    if (
      error.code === "EROFS" ||
      error.code === "EACCES" ||
      error.code === "ENOENT"
    ) {
      isReadOnly = true;
      console.warn(
        "⚠️  Cannot access store.json. Running with seeded in-memory data."
      );
      const seeded = seedStore(emptyStore);
      cachedStore = seeded;
      lastLoadTime = Date.now();
      return seeded;
    }
    // For other errors, throw
    throw error;
  }
};

export const updateStore = async <T>(
  updater: (
    store: Store
  ) =>
    | Promise<{ store: Store; result: T }>
    | { store: Store; result: T }
): Promise<T> => {
  let response!: T;
  writeLock = writeLock.then(async () => {
    const store = await loadStore();
    const { store: nextStore, result } = await updater(store);
    response = result;
    cachedStore = nextStore;
    lastLoadTime = Date.now();
    await persistStore(nextStore);
  });
  await writeLock;
  return response;
};