import { clsx, type ClassValue } from "clsx";

/**
 * Concatenate Tailwind class names.
 * We use plain clsx — no tailwind-merge — because this project does not
 * merge conflicting utility classes at runtime. Keep class lists
 * explicit instead.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
