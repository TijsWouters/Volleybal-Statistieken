import type { StoredEntry } from '@/hooks/useFavourites';

const LS_KEY = 'volleystats.favourites';
const IDB_STORE = 'prefs';
const IDB_FAV_KEY = 'favorites';

// --- IDB helpers -------------------------------------------------------------

function openDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open('volleybal-statistieken', 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet<T>(key: IDBValidKey): Promise<T | undefined> {
  const db = await openDB();
  try {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(key);
    return await new Promise<T | undefined>((res, rej) => {
      req.onsuccess = () => res(req.result as T | undefined);
      req.onerror = () => rej(req.error);
    });
  } finally {
    db.close();
  }
}

async function idbPut(key: IDBValidKey, value: any): Promise<void> {
  const db = await openDB();
  try {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const req = tx.objectStore(IDB_STORE).put(value, key);
    await new Promise<void>((res, rej) => {
      req.onsuccess = () => res();
      req.onerror = () => rej(req.error);
    });
  } finally {
    db.close();
  }
}

async function idbDel(key: IDBValidKey): Promise<void> {
  const db = await openDB();
  try {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const req = tx.objectStore(IDB_STORE).delete(key);
    await new Promise<void>((res, rej) => {
      req.onsuccess = () => res();
      req.onerror = () => rej(req.error);
    });
  } finally {
    db.close();
  }
}

// --- localStorage helpers ----------------------------------------------------

function readLS(): StoredEntry[] {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter(isStoredEntry)
  } catch {
    return [];
  }
}

function writeLS(entries: StoredEntry[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(entries));
}

function isStoredEntry(x: any): x is StoredEntry {
  return !!x && typeof x.title === 'string' && typeof x.url === 'string' &&
    (x.type === 'team' || x.type === 'club');
}

function favKey(e: StoredEntry) {
  return e.url
}

function equalsByKey(a: StoredEntry[], b: StoredEntry[]) {
  const toSet = (arr: StoredEntry[]) => new Set(arr.map(favKey));
  const A = toSet(a), B = toSet(b);
  if (A.size !== B.size) return false;
  for (const k of A) if (!B.has(k)) return false;
  return true;
}

// --- SYNC --------------------------------------------------------------------

async function syncFavouritesWithLocalStorage(): Promise<StoredEntry[]> {
  // Load both
  const [ls, idb] = await Promise.all([
    Promise.resolve(readLS()),
    idbGet<StoredEntry[]>(IDB_FAV_KEY).then(v => (v ?? []))
  ]);

  // Merge: union by key; prefer IDB entry on conflict
  const byKey = new Map<string, StoredEntry>();
  for (const e of ls) byKey.set(favKey(e), e);
  for (const e of idb) byKey.set(favKey(e), e); // IDB overwrites LS on duplicates

  const merged = Array.from(byKey.values());
  console.log(equalsByKey(merged, idb), equalsByKey(merged, ls), { merged, idb, ls });
  // Persist if anything changed
  if (!equalsByKey(merged, idb)) await idbPut(IDB_FAV_KEY, merged);
  if (!equalsByKey(merged, ls)) writeLS(merged);

  return merged;
}

async function fetchSeenMatches(url: string): Promise<string[]> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/played-matches${url}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Het is niet gelukt om de gespeelde wedstrijden op te halen');
  const data = await response.json();
  return data || [];
}

// Optional: write-through helpers (call these when user adds/removes a favourite)
export async function storeFavouriteInDB(entry: StoredEntry) {
  const seenMatches = await fetchSeenMatches(entry.url);
  const key = favKey(entry);
  await setSeenMatches(key, seenMatches);
  const cur = await syncFavouritesWithLocalStorage();
  if (cur.some(e => favKey(e) === key)) return;
  const next = [...cur, entry];
  await idbPut(IDB_FAV_KEY, next);
  
  console.log('Stored seen matches for', key, seenMatches);
  writeLS(next);
}
export async function removeFavouriteFromDB(key: string) {
  const cur = await syncFavouritesWithLocalStorage();
  const next = cur.filter(e => favKey(e) !== key);
  await idbPut(IDB_FAV_KEY, next);
  writeLS(next);
  await clearSeenMatches(key);
}

const SEEN_PREFIX = 'seen:'; // e.g. seen:ajax, seen:club:123

/** Get seen matches for a team key. Returns [] if none. */
export async function getSeenMatches(teamKey: string): Promise<string[]> {
  const key = SEEN_PREFIX + teamKey;
  const arr = await idbGet<any>(key);
  return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : [];
}

/** Set (overwrite) seen matches for a team key. Dedupes; deletes key if empty. */
export async function setSeenMatches(teamKey: string, matchIds: string[]): Promise<void> {
  console.log('Setting seen matches for', teamKey, matchIds);
  const key = SEEN_PREFIX + teamKey;
  const clean = Array.from(
    new Set((matchIds || []).filter((x): x is string => typeof x === 'string' && x.length > 0))
  );

  if (clean.length === 0) {
    await idbDel(key);        // keep DB tidy if empty
  } else {
    await idbPut(key, clean); // store as plain string[]
  }
}

export async function clearSeenMatches(teamKey: string): Promise<void> {
  const key = SEEN_PREFIX + teamKey;
  await idbDel(key);
}
