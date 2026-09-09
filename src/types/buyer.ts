import { CatalogItem } from "./artisan";

export interface BuyerCartItem {
  id: string; // unique cart item id
  product: CatalogItem;
  quantity: number;
  selectedPrice: number;
  addedAt: string;
}

export interface BuyerCategory {
  id: string;
  nameEn: string;
  nameHi: string;
  craftDomain: string; // matches CatalogItem.category or subcategory
  descriptionEn: string;
  descriptionHi: string;
  iconName: string;
  image: string;
  itemCount: number;
  featuredCraft: string;
}

export type BuyerActiveTab = "home" | "explore" | "trending" | "wishlist" | "cart" | "account";

export interface BuyerFilterState {
  category: string | "all";
  minPrice: number;
  maxPrice: number;
  handmadeOnly: boolean;
  sortBy: "featured" | "price_asc" | "price_desc" | "newest" | "orders";
}
