/** 커스텀 메이커 생성 직후 상세 페이지로 넘기는 세션 데이터 */
export type GeneratedPreviewKind = "logo" | "uniform" | "product";

export type GeneratedPreviewRecord = {
  id: string;
  kind: GeneratedPreviewKind;
  category: string;
  title: string;
  promptSummary: string;
  previewSrc: string;
  b64Png: string | null;
  createdAt: number;
  savedAssetId?: number;
  savedAccessPath?: string;
};

const STORAGE_PREFIX = "cc_generated_preview_";
const IDB_NAME = "cc_generated_previews";
const IDB_VERSION = 1;
const IDB_STORE = "previews";

/** sessionStorage 실패 시에도 같은 탭에서 자세히 보기 가능 */
const memoryCache = new Map<string, GeneratedPreviewRecord>();

function storageKey(id: string) {
  return `${STORAGE_PREFIX}${id}`;
}

type PreviewMeta = Omit<
  GeneratedPreviewRecord,
  "previewSrc" | "b64Png"
> & {
  previewSrc?: string;
  b64Png?: string | null;
  storedInIdb?: boolean;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("indexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onerror = () => reject(req.error ?? new Error("idb open failed"));
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: "id" });
      }
    };
  });
}

async function idbPut(record: GeneratedPreviewRecord): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("idb write failed"));
    };
    tx.objectStore(IDB_STORE).put(record);
  });
}

async function idbGet(id: string): Promise<GeneratedPreviewRecord | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("idb read failed"));
    };
    const req = tx.objectStore(IDB_STORE).get(id);
    req.onsuccess = () => {
      db.close();
      resolve((req.result as GeneratedPreviewRecord | undefined) ?? null);
    };
    req.onerror = () => {
      db.close();
      reject(req.error ?? new Error("idb get failed"));
    };
  });
}

function saveMetaToSession(record: GeneratedPreviewRecord): void {
  const meta: PreviewMeta = {
    id: record.id,
    kind: record.kind,
    category: record.category,
    title: record.title,
    promptSummary: record.promptSummary,
    createdAt: record.createdAt,
    savedAssetId: record.savedAssetId,
    savedAccessPath: record.savedAccessPath,
    storedInIdb: true,
  };
  try {
    sessionStorage.setItem(storageKey(record.id), JSON.stringify(meta));
  } catch {
    /* meta only — 실패해도 memory/IDB 로 복구 */
  }
}

export function createGeneratedPreviewId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `preview-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function saveGeneratedPreview(
  record: GeneratedPreviewRecord,
): GeneratedPreviewRecord {
  memoryCache.set(record.id, record);

  if (typeof window === "undefined") return record;

  const payloadBytes =
    (record.b64Png?.length ?? 0) + (record.previewSrc?.length ?? 0);
  const useIdb = payloadBytes > 180_000;

  if (useIdb) {
    saveMetaToSession(record);
    void idbPut(record).catch(() => {
      /* ignore */
    });
    return record;
  }

  try {
    sessionStorage.setItem(storageKey(record.id), JSON.stringify(record));
  } catch {
    saveMetaToSession(record);
    void idbPut(record).catch(() => {
      /* ignore */
    });
  }
  return record;
}

/** 동기: 메모리·sessionStorage(소형)만 */
export function loadGeneratedPreview(
  id: string | null | undefined,
): GeneratedPreviewRecord | null {
  if (!id || typeof window === "undefined") return null;

  const cached = memoryCache.get(id);
  if (cached) return cached;

  try {
    const raw = sessionStorage.getItem(storageKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GeneratedPreviewRecord | PreviewMeta;
    if ("storedInIdb" in parsed && parsed.storedInIdb) return null;
    if (parsed.previewSrc) {
      const full = parsed as GeneratedPreviewRecord;
      memoryCache.set(id, full);
      return full;
    }
  } catch {
    return null;
  }
  return null;
}

/** 비동기: IndexedDB 포함 */
export async function loadGeneratedPreviewAsync(
  id: string | null | undefined,
): Promise<GeneratedPreviewRecord | null> {
  const sync = loadGeneratedPreview(id);
  if (sync) return sync;
  if (!id || typeof window === "undefined") return null;

  try {
    const fromIdb = await idbGet(id);
    if (fromIdb) {
      memoryCache.set(id, fromIdb);
      return fromIdb;
    }
  } catch {
    return null;
  }
  return null;
}

export function patchGeneratedPreview(
  id: string,
  patch: Partial<
    Pick<GeneratedPreviewRecord, "savedAssetId" | "savedAccessPath" | "previewSrc">
  >,
): GeneratedPreviewRecord | null {
  const current = memoryCache.get(id) ?? loadGeneratedPreview(id);
  if (!current) return null;
  const next = { ...current, ...patch };
  saveGeneratedPreview(next);
  return next;
}
