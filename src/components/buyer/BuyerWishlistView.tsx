import React from "react";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { CatalogItem, LanguageCode } from "../../types/artisan";
import { BuyerProductCard } from "./BuyerProductCard";

interface BuyerWishlistViewProps {
  items: CatalogItem[];
  language: LanguageCode;
  wishlistIds: string[];
  onToggleWishlist: (e: React.MouseEvent, itemId: string) => void;
  onSelectItem: (item: CatalogItem) => void;
  onExplore: () => void;
}

export const BuyerWishlistView: React.FC<BuyerWishlistViewProps> = ({
  items,
  language,
  wishlistIds,
  onToggleWishlist,
  onSelectItem,
  onExplore,
}) => {
  const wishlistedItems = items.filter((item) => wishlistIds.includes(item.id));

  if (wishlistedItems.length === 0) {
    return (
      <div className="py-16 px-4 text-center max-w-sm mx-auto space-y-4">
        <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center mx-auto border border-kk-line">
          <Heart className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h2 className="text-base font-bold text-kk-ink-soft">
          {language === "hi" ? "आपकी विशलिस्ट खाली है" : "Your Wishlist is Empty"}
        </h2>
        <p className="text-xs text-stone-500 leading-relaxed">
          {language === "hi"
            ? "उत्पादों पर दिल (Heart) आइकन दबाकर अपने पसंदीदा हस्तशिल्प सहेजें।"
            : "Explore handcrafted collections and tap the heart icon to save pieces for later."}
        </p>
        <button
          type="button"
          onClick={onExplore}
          className="px-5 py-2.5 bg-kk-primary hover:bg-kk-primary-dark text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          {language === "hi" ? "कारीगरी संग्रह देखें" : "Explore Collections"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center justify-between pb-2 border-b border-kk-line">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-kk-ink">
            {language === "hi" ? "सहेजे गए हस्तशिल्प (Wishlist)" : "Saved Artisan Pieces"}
          </h2>
          <p className="text-xs text-stone-500">
            {wishlistedItems.length} {language === "hi" ? "उत्पाद सहेजे गए" : "handcrafted items saved"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {wishlistedItems.map((item) => (
          <BuyerProductCard
            key={item.id}
            item={item}
            language={language}
            isWishlisted={true}
            onToggleWishlist={onToggleWishlist}
            onClick={onSelectItem}
          />
        ))}
      </div>
    </div>
  );
};
