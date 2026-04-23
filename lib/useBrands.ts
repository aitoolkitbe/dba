"use client";

import { useEffect, useState } from "react";
import type { Brand } from "./types";
import { DEMO_BRANDS } from "./demo-brands";
import { getAllBrands, getBrand, onStoreChange } from "./storage";

/**
 * Returns demo brands + user's brands from localStorage. Re-renders on any
 * store mutation (including from other tabs).
 */
export function useBrands(): { demoBrands: Brand[]; userBrands: Brand[]; allBrands: Brand[] } {
  const [userBrands, setUserBrands] = useState<Brand[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUserBrands(getAllBrands());
    setHydrated(true);
    return onStoreChange(() => setUserBrands(getAllBrands()));
  }, []);

  return {
    demoBrands: DEMO_BRANDS,
    userBrands: hydrated ? userBrands : [],
    allBrands: hydrated ? [...DEMO_BRANDS, ...userBrands] : DEMO_BRANDS,
  };
}

/** Find a single brand from either store or demo registry. */
export function useBrand(id: string | undefined): {
  brand: Brand | undefined;
  hydrated: boolean;
} {
  const [brand, setBrand] = useState<Brand | undefined>(undefined);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!id) {
      setBrand(undefined);
      setHydrated(true);
      return;
    }
    const resolve = () => {
      const demo = DEMO_BRANDS.find((b) => b.id === id);
      if (demo) {
        setBrand(demo);
        setHydrated(true);
        return;
      }
      setBrand(getBrand(id));
      setHydrated(true);
    };
    resolve();
    return onStoreChange(resolve);
  }, [id]);

  return { brand, hydrated };
}
