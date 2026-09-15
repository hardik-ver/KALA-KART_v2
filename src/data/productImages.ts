/**
 * Kala-Kart Centralized Authentic Handicraft Product Imagery
 * High-definition, category-accurate, warm earthy-toned authentic studio assets.
 */

export const PRODUCT_IMAGES = {
  // Core Products
  terracottaDiya: "/images/products/terracotta-diya.jpg",
  banarasiDupatta: "/images/products/banarasi-dupatta.jpg",
  brassPeacockDiya: "/images/products/brass-peacock-diya.jpg",
  sheeshamElephant: "/images/products/sheesham-elephant.jpg",
  bluePotteryVase: "/images/products/blue-pottery-vase.jpg",
  bastarDhokra: "/images/products/bastar-dhokra.jpg",
  terracottaJewelry: "/images/products/terracotta-jewelry.jpg",
  channapatnaCoasters: "/images/products/channapatna-coasters.jpg",

  // Category Hero & Traditional Crafts
  homeDecorBell: "/images/products/home-decor-bell.jpg",
  madhubaniPainting: "/images/products/madhubani-painting.jpg",
  handcraftedGifts: "/images/products/handcrafted-gifts.jpg",
  bambooBasket: "/images/products/bamboo-basket.jpg",
} as const;

// Direct mapping by item ID
export const ITEM_IMAGE_MAP: Record<string, string> = {
  "item-1": PRODUCT_IMAGES.terracottaDiya,
  "item-2": PRODUCT_IMAGES.banarasiDupatta,
  "item-3": PRODUCT_IMAGES.brassPeacockDiya,
  "item-4": PRODUCT_IMAGES.sheeshamElephant,
  "item-5": PRODUCT_IMAGES.bluePotteryVase,
  "item-6": PRODUCT_IMAGES.bastarDhokra,
  "item-7": PRODUCT_IMAGES.terracottaJewelry,
  "item-8": PRODUCT_IMAGES.channapatnaCoasters,
};

// Direct mapping for category showcase
export const CATEGORY_IMAGE_MAP: Record<string, string> = {
  home_decor: PRODUCT_IMAGES.homeDecorBell,
  metal_craft: PRODUCT_IMAGES.brassPeacockDiya,
  metalcraft: PRODUCT_IMAGES.brassPeacockDiya,
  pottery: PRODUCT_IMAGES.terracottaDiya,
  textiles: PRODUCT_IMAGES.banarasiDupatta,
  jewelry: PRODUCT_IMAGES.terracottaJewelry,
  wood_craft: PRODUCT_IMAGES.sheeshamElephant,
  woodwork: PRODUCT_IMAGES.sheeshamElephant,
  paintings: PRODUCT_IMAGES.madhubaniPainting,
  handmade_gifts: PRODUCT_IMAGES.handcraftedGifts,
  heritage_crafts: PRODUCT_IMAGES.bastarDhokra,
  miscellaneous: PRODUCT_IMAGES.bambooBasket,
};
