import React, { useState } from "react";
import {
  ArrowLeft,
  Heart,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Share2,
  MapPin,
  Clock,
  Feather,
  ChevronRight,
} from "lucide-react";
import { CatalogItem, LanguageCode } from "../../types/artisan";

interface BuyerProductDetailModalProps {
  item: CatalogItem | null;
  isOpen: boolean;
  language: LanguageCode;
  isWishlisted: boolean;
  onClose: () => void;
  onToggleWishlist: (itemId: string) => void;
  onAddToCart: (item: CatalogItem, quantity: number) => void;
}

export const BuyerProductDetailModal: React.FC<BuyerProductDetailModalProps> = ({
  item,
  isOpen,
  language,
  isWishlisted,
  onClose,
  onToggleWishlist,
  onAddToCart,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  if (!isOpen || !item) return null;

  const currentImg = selectedImage || item.studioImage || item.originalImage;
  const title = language === "hi" ? item.titleHi : item.titleEn;
  const description = language === "hi" ? item.descriptionHi : item.descriptionEn;
  const price = item.pricing?.marketPrice || item.pricing?.baseCost || 499;

  const handleAdd = () => {
    onAddToCart(item, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1800);
  };

  const imagesList = [item.studioImage, item.originalImage].filter(Boolean) as string[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="bg-kk-surface text-kk-ink w-full sm:max-w-3xl max-h-screen sm:max-h-[90vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-kk-line">
        {/* Top Floating Action Bar */}
        <div className="sticky top-0 z-20 bg-kk-surface/90 backdrop-blur-md px-4 py-3 border-b border-kk-line flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-stone-600 hover:text-kk-ink text-sm font-semibold p-1.5 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">{language === "hi" ? "वापस" : "Back"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleWishlist(item.id)}
              className={`p-2 rounded-full border transition-colors ${
                isWishlisted
                  ? "bg-kk-primary text-white border-kk-primary"
                  : "bg-white text-stone-600 border-kk-line hover:text-kk-primary"
              }`}
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            {/* Left: Product Images Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-stone-100 border border-kk-line shadow-xs">
                <img
                  src={currentImg}
                  alt={title}
                  className="w-full h-full object-cover object-center"
                />
                {item.specs?.isHandmade && (
                  <span className="absolute top-3 left-3 bg-kk-ink/80 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>{language === "hi" ? "100% प्रामाणिक हस्तशिल्प" : "100% Authentic Handcraft"}</span>
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {imagesList.length > 1 && (
                <div className="flex items-center gap-2">
                  {imagesList.map((img, idx) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                        currentImg === img ? "border-kk-primary ring-2 ring-kk-primary-soft" : "border-kk-line opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info Hierarchy */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-kk-primary uppercase tracking-wider mb-1">
                  <span>{item.category}</span>
                  {item.specs?.regionHeritage && (
                    <>
                      <span>•</span>
                      <span className="text-stone-500 font-medium normal-case flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />
                        {item.specs.regionHeritage}
                      </span>
                    </>
                  )}
                </div>

                <h1 className="text-lg sm:text-xl font-bold text-kk-ink leading-snug">
                  {title}
                </h1>
              </div>

              {/* Price Row */}
              <div className="bg-white p-3.5 rounded-2xl border border-kk-line flex items-baseline justify-between shadow-2xs">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-stone-500 font-medium">₹</span>
                    <span className="text-2xl font-extrabold text-kk-ink tracking-tight">
                      {price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-stone-400 font-normal">
                      {language === "hi" ? "(सभी कर सहित)" : "(incl. taxes)"}
                    </span>
                  </div>
                  {item.pricing?.exhibitionPrice && item.pricing.exhibitionPrice > price && (
                    <p className="text-xs text-stone-400 line-through mt-0.5">
                      ₹{item.pricing.exhibitionPrice.toLocaleString("en-IN")} MRP
                    </p>
                  )}
                </div>

                {/* Direct artisan margin tag */}
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 block">
                    {language === "hi" ? "सीधा कारीगर लाभ" : "Direct Artisan Benefit"}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xs font-bold text-kk-ink-soft uppercase tracking-wider mb-1.5">
                  {language === "hi" ? "उत्पाद विवरण" : "Description"}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Verified Artisan Specs Grid */}
              <div className="bg-white p-3.5 rounded-2xl border border-kk-line space-y-2">
                <h2 className="text-xs font-bold text-kk-ink-soft uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Feather className="w-3.5 h-3.5 text-kk-primary" />
                  <span>{language === "hi" ? "शिल्प विनिर्देश" : "Craft Specifications"}</span>
                </h2>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {item.specs?.material && (
                    <div className="bg-stone-50 p-2 rounded-xl">
                      <span className="text-stone-400 block text-[10px]">{language === "hi" ? "सामग्री" : "Material"}</span>
                      <span className="font-semibold text-kk-ink-soft">{item.specs.material}</span>
                    </div>
                  )}
                  {item.specs?.craftTechnique && (
                    <div className="bg-stone-50 p-2 rounded-xl">
                      <span className="text-stone-400 block text-[10px]">{language === "hi" ? "तकनीक" : "Technique"}</span>
                      <span className="font-semibold text-kk-ink-soft">{item.specs.craftTechnique}</span>
                    </div>
                  )}
                  {item.specs?.dimensions && (
                    <div className="bg-stone-50 p-2 rounded-xl">
                      <span className="text-stone-400 block text-[10px]">{language === "hi" ? "आकार" : "Dimensions"}</span>
                      <span className="font-semibold text-kk-ink-soft">{item.specs.dimensions}</span>
                    </div>
                  )}
                  {item.specs?.weight && (
                    <div className="bg-stone-50 p-2 rounded-xl">
                      <span className="text-stone-400 block text-[10px]">{language === "hi" ? "वजन" : "Weight"}</span>
                      <span className="font-semibold text-kk-ink-soft">{item.specs.weight}</span>
                    </div>
                  )}
                </div>

                {item.specs?.productionTime && (
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-stone-500 font-medium">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>{language === "hi" ? "निर्माण समय:" : "Handmade Creation Time:"} {item.specs.productionTime}</span>
                  </div>
                )}
              </div>

              {/* Artisan Heritage Story Note */}
              {item.specs?.artisanStory && (
                <div className="bg-kk-primary-soft/50 p-3.5 rounded-2xl border border-kk-primary-soft">
                  <h3 className="text-xs font-bold text-kk-ink mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-kk-primary" />
                    <span>{language === "hi" ? "कारीगर की कहानी" : "Artisan Heritage"}</span>
                  </h3>
                  <p className="text-xs text-stone-700 leading-relaxed italic">
                    "{item.specs.artisanStory}"
                  </p>
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2 rounded-xl bg-white border border-kk-line text-[10px] text-stone-600">
                  <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                  <span>{language === "hi" ? "प्रमाणित मूल शिल्प" : "Verified Craft"}</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-kk-line text-[10px] text-stone-600">
                  <Truck className="w-4 h-4 mx-auto mb-1 text-kk-primary" />
                  <span>{language === "hi" ? "सुरक्षित डिलीवरी" : "Secure Transit"}</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-kk-line text-[10px] text-stone-600">
                  <RotateCcw className="w-4 h-4 mx-auto mb-1 text-stone-500" />
                  <span>{language === "hi" ? "7-दिन वापसी" : "7-Day Return"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Purchase Action Footer */}
        <div className="sticky bottom-0 z-20 bg-white border-t border-kk-line p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-2.5 sm:gap-3 shadow-lg">
          {/* Quantity Controls */}
          <div className="flex items-center border border-kk-line rounded-xl bg-stone-50 overflow-hidden shrink-0">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-2.5 sm:px-3 py-2 text-stone-700 hover:bg-stone-200 font-bold transition-colors text-sm"
            >
              -
            </button>
            <span className="px-2 sm:px-3 py-2 text-xs font-bold text-kk-ink min-w-6 sm:min-w-8 text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="px-2.5 sm:px-3 py-2 text-stone-700 hover:bg-stone-200 font-bold transition-colors text-sm"
            >
              +
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAdd}
            className={`flex-1 min-w-0 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-md active:scale-98 ${
              addedAnimation
                ? "bg-emerald-600 text-white"
                : "bg-kk-primary hover:bg-kk-primary-dark text-white shadow-kk-ink/20"
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-4 h-4 stroke-[3] shrink-0" />
                <span className="truncate">{language === "hi" ? "कार्ट में जोड़ा गया!" : "Added to Cart!"}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {language === "hi" ? `कार्ट में जोड़ें • ₹${(price * quantity).toLocaleString("en-IN")}` : `Add to Cart • ₹${(price * quantity).toLocaleString("en-IN")}`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
