"use client";

import type {
  AssetCandidate,
  Brand,
  CandidateConcept,
  CategoryScan,
  DBAAsset,
  StressTestResult,
  CreativeBrief,
} from "./types";

/**
 * LocalStorage-backed persistence for user brands and their candidates.
 *
 * Design notes:
 * - All reads/writes happen client-side; server components must NOT import
 *   this file.
 * - A single JSON blob under "dba.brands.v1" keeps migrations simple.
 * - The demo brands (lib/demo-brands.ts) remain read-only — we never write
 *   them to localStorage. The audit page merges demo + stored brands at
 *   render time.
 */

const STORAGE_KEY = "dba.brands.v1";
const CURRENT_VERSION = 1;

interface StorageSchema {
  version: number;
  brands: Brand[];
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readStore(): StorageSchema {
  if (!isBrowser()) return { version: CURRENT_VERSION, brands: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: CURRENT_VERSION, brands: [] };
    const parsed = JSON.parse(raw) as StorageSchema;
    if (!parsed.brands) return { version: CURRENT_VERSION, brands: [] };
    return migrate(parsed);
  } catch (e) {
    console.warn("[storage] failed to parse localStorage, resetting", e);
    return { version: CURRENT_VERSION, brands: [] };
  }
}

function migrate(s: StorageSchema): StorageSchema {
  // Future: up-converters keyed on s.version
  return { ...s, version: CURRENT_VERSION };
}

function writeStore(store: StorageSchema): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent("dba:store-changed"));
}

/* ------------------------------------------------------------------ */
/* Brand CRUD                                                         */
/* ------------------------------------------------------------------ */

export function getAllBrands(): Brand[] {
  return readStore().brands;
}

export function getBrand(id: string): Brand | undefined {
  return readStore().brands.find((b) => b.id === id);
}

export function saveBrand(brand: Brand): Brand {
  const store = readStore();
  const now = new Date().toISOString();
  const existing = store.brands.find((b) => b.id === brand.id);
  const updated: Brand = {
    ...brand,
    createdAt: existing?.createdAt ?? brand.createdAt ?? now,
    updatedAt: now,
  };
  store.brands = existing
    ? store.brands.map((b) => (b.id === brand.id ? updated : b))
    : [...store.brands, updated];
  writeStore(store);
  return updated;
}

export function deleteBrand(id: string): void {
  const store = readStore();
  store.brands = store.brands.filter((b) => b.id !== id);
  writeStore(store);
}

export function duplicateBrand(id: string): Brand | undefined {
  const b = getBrand(id);
  if (!b) return undefined;
  const copy: Brand = {
    ...b,
    id: makeId(`${b.id}-copy`),
    name: `${b.name} (copy)`,
    isDemo: false,
    createdAt: undefined,
    updatedAt: undefined,
  };
  return saveBrand(copy);
}

/* ------------------------------------------------------------------ */
/* Asset helpers                                                      */
/* ------------------------------------------------------------------ */

export function upsertAsset(brandId: string, asset: DBAAsset): Brand | undefined {
  const brand = getBrand(brandId);
  if (!brand) return undefined;
  const exists = brand.assets.some((a) => a.id === asset.id);
  const nextAssets = exists
    ? brand.assets.map((a) => (a.id === asset.id ? asset : a))
    : [...brand.assets, asset];
  return saveBrand({ ...brand, assets: nextAssets });
}

export function removeAsset(brandId: string, assetId: string): Brand | undefined {
  const brand = getBrand(brandId);
  if (!brand) return undefined;
  return saveBrand({
    ...brand,
    assets: brand.assets.filter((a) => a.id !== assetId),
  });
}

/* ------------------------------------------------------------------ */
/* Candidate helpers                                                  */
/* ------------------------------------------------------------------ */

export function addCandidates(
  brandId: string,
  concepts: CandidateConcept[],
  meta: { gapBrief?: string; requestedCategory?: AssetCandidate["requestedCategory"]; requestedType?: AssetCandidate["requestedType"] } = {}
): Brand | undefined {
  const brand = getBrand(brandId);
  if (!brand) return undefined;
  const now = new Date().toISOString();
  const newCandidates: AssetCandidate[] = concepts.map((c) => ({
    id: makeId("cand"),
    brandId,
    createdAt: now,
    updatedAt: now,
    gapBrief: meta.gapBrief,
    requestedCategory: meta.requestedCategory,
    requestedType: meta.requestedType,
    concept: c,
    status: "draft",
  }));
  return saveBrand({
    ...brand,
    candidates: [...(brand.candidates ?? []), ...newCandidates],
  });
}

export function updateCandidate(
  brandId: string,
  candidateId: string,
  patch: Partial<AssetCandidate>
): Brand | undefined {
  const brand = getBrand(brandId);
  if (!brand) return undefined;
  const now = new Date().toISOString();
  const next = (brand.candidates ?? []).map((c) =>
    c.id === candidateId ? { ...c, ...patch, updatedAt: now } : c
  );
  return saveBrand({ ...brand, candidates: next });
}

export function setCandidateStressTest(
  brandId: string,
  candidateId: string,
  stressTest: StressTestResult
): Brand | undefined {
  return updateCandidate(brandId, candidateId, {
    stressTest,
    status: "tested",
  });
}

export function setCandidateBrief(
  brandId: string,
  candidateId: string,
  brief: CreativeBrief
): Brand | undefined {
  return updateCandidate(brandId, candidateId, {
    brief,
    status: "briefed",
  });
}

export function removeCandidate(brandId: string, candidateId: string): Brand | undefined {
  const brand = getBrand(brandId);
  if (!brand) return undefined;
  return saveBrand({
    ...brand,
    candidates: (brand.candidates ?? []).filter((c) => c.id !== candidateId),
  });
}

/* ------------------------------------------------------------------ */
/* Category scan                                                      */
/* ------------------------------------------------------------------ */

export function setCategoryScan(
  brandId: string,
  scan: CategoryScan
): Brand | undefined {
  const brand = getBrand(brandId);
  if (!brand) return undefined;
  return saveBrand({ ...brand, categoryScan: scan });
}

/* ------------------------------------------------------------------ */
/* Export / Import                                                    */
/* ------------------------------------------------------------------ */

export function exportAllAsJSON(): string {
  return JSON.stringify(readStore(), null, 2);
}

export function importFromJSON(json: string): { ok: true } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(json) as Partial<StorageSchema>;
    if (!Array.isArray(parsed.brands)) {
      return { ok: false, error: "JSON does not contain a `brands` array" };
    }
    writeStore({ version: CURRENT_VERSION, brands: parsed.brands });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown parse error" };
  }
}

/* ------------------------------------------------------------------ */
/* Utilities                                                          */
/* ------------------------------------------------------------------ */

export function makeId(prefix = "brand"): string {
  const rand = Math.random().toString(36).slice(2, 8);
  const ts = Date.now().toString(36);
  return `${prefix}-${ts}-${rand}`;
}

/** Subscribe to store mutations; returns unsubscribe fn. */
export function onStoreChange(cb: () => void): () => void {
  if (!isBrowser()) return () => {};
  const handler = () => cb();
  window.addEventListener("dba:store-changed", handler);
  // Also react to storage events from other tabs.
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("dba:store-changed", handler);
    window.removeEventListener("storage", handler);
  };
}
