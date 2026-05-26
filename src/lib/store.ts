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

const persistStore = async (store: Store) => {
  await writeFile(storePath, JSON.stringify(store, null, 2), "utf-8");
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
    return seeded;
  } catch {
    const seeded = seedStore(emptyStore);
    await persistStore(seeded);
    cachedStore = seeded;
    lastLoadTime = Date.now();
    return seeded;
  }
};

export const updateStore = async <T>(
  updater: (store: Store) => Promise<{ store: Store; result: T }> | { store: Store; result: T }
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
