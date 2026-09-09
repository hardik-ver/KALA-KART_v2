/**
 * Verified Artisan Product Storage Repository
 *
 * Persists verified artisan products with ground-truth cost breakdown and
 * empirical production hours for model training dataset generation.
 *
 * Stored at: data/pricing/verified_artisan_products.json
 */

import fs from "fs";
import path from "path";
import type { VerifiedArtisanProductInput } from "./datasetTransformer";

export interface IArtisanProductRepository {
  getAll(): Promise<VerifiedArtisanProductInput[]>;
  getById(id: string): Promise<VerifiedArtisanProductInput | null>;
  save(product: VerifiedArtisanProductInput): Promise<void>;
  saveBatch(products: VerifiedArtisanProductInput[]): Promise<number>;
  count(): Promise<number>;
  clear(): Promise<void>;
}

export class FileArtisanProductRepository implements IArtisanProductRepository {
  private filePath: string;
  private cache: VerifiedArtisanProductInput[] | null = null;

  constructor(customPath?: string) {
    if (typeof window === "undefined") {
      this.filePath =
        customPath ||
        path.join(process.cwd(), "data", "pricing", "verified_artisan_products.json");
      this.ensureDirectory();
    } else {
      this.filePath = customPath || "/api/pricing/artisan-products";
    }
  }

  private ensureDirectory(): void {
    if (typeof window !== "undefined") return;
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch {
      // Safe fallback
    }
  }

  private loadSync(): VerifiedArtisanProductInput[] {
    if (typeof window !== "undefined") return this.cache || [];
    if (this.cache !== null) {
      return this.cache;
    }

    try {
      if (!fs.existsSync(this.filePath)) {
        this.cache = [];
        return this.cache;
      }

      const raw = fs.readFileSync(this.filePath, "utf-8");
      if (!raw || raw.trim() === "") {
        this.cache = [];
        return this.cache;
      }

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        this.cache = parsed;
      } else {
        console.warn(
          `[artisanProductStore] File at ${this.filePath} did not contain an array. Initializing empty.`
        );
        this.cache = [];
      }
    } catch (err) {
      console.error(
        `[artisanProductStore] Error loading verified artisan products from ${this.filePath}:`,
        err
      );
      this.cache = [];
    }

    return this.cache;
  }

  private saveSync(): void {
    if (typeof window !== "undefined") return;
    try {
      this.ensureDirectory();
      const content = JSON.stringify(this.cache || [], null, 2);
      fs.writeFileSync(this.filePath, content, "utf-8");
    } catch (err) {
      console.error(
        `[artisanProductStore] Error saving verified artisan products to ${this.filePath}:`,
        err
      );
      throw err;
    }
  }

  public async getAll(): Promise<VerifiedArtisanProductInput[]> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/pricing/artisan-products");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.products)) {
            this.cache = data.products;
            return [...data.products];
          }
        }
      } catch (err) {
        console.warn("[artisanProductStore] Client fetch failed, returning cache:", err);
      }
      return [...(this.cache || [])];
    }
    return [...this.loadSync()];
  }

  public async getById(id: string): Promise<VerifiedArtisanProductInput | null> {
    const all = await this.getAll();
    return all.find((p) => p.id === id) || null;
  }

  public async save(product: VerifiedArtisanProductInput): Promise<void> {
    if (typeof window !== "undefined") {
      // Client-side execution: persist via backend API
      try {
        const res = await fetch("/api/pricing/artisan-products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(product),
        });
        if (!res.ok) {
          console.error("[artisanProductStore] Failed to save via API:", res.statusText);
        }
      } catch (err) {
        console.error("[artisanProductStore] Network error during save:", err);
      }
      // Update local memory cache as well
      if (!this.cache) this.cache = [];
      const idx = this.cache.findIndex((item) => item.id === product.id);
      if (idx >= 0) {
        this.cache[idx] = product;
      } else {
        this.cache.push(product);
      }
      return;
    }

    // Server / Node execution
    const items = this.loadSync();
    const existingIdx = items.findIndex((item) => item.id === product.id);

    if (existingIdx >= 0) {
      items[existingIdx] = product;
    } else {
      items.push(product);
    }

    this.saveSync();
  }

  public async saveBatch(products: VerifiedArtisanProductInput[]): Promise<number> {
    let savedCount = 0;
    for (const prod of products) {
      await this.save(prod);
      savedCount++;
    }
    return savedCount;
  }

  public async count(): Promise<number> {
    const all = await this.getAll();
    return all.length;
  }

  public async clear(): Promise<void> {
    if (typeof window !== "undefined") {
      this.cache = [];
      return;
    }
    this.cache = [];
    this.saveSync();
  }
}

// Default singleton instance
export const defaultArtisanProductRepo = new FileArtisanProductRepository();
