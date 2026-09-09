import React, { useState } from "react";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Tag,
  CheckCircle2,
  Truck,
} from "lucide-react";
import { BuyerCartItem } from "../../types/buyer";
import { LanguageCode } from "../../types/artisan";

interface BuyerCartViewProps {
  cart: BuyerCartItem[];
  language: LanguageCode;
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onExplore: () => void;
}

export const BuyerCartView: React.FC<BuyerCartViewProps> = ({
  cart,
  language,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onExplore,
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [orderComplete, setOrderComplete] = useState<boolean>(false);

  const subtotal = cart.reduce((acc, item) => acc + item.selectedPrice * item.quantity, 0);
  const shipping = subtotal > 1499 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setOrderComplete(true);
      onClearCart();
    }, 1200);
  };

  if (orderComplete) {
    return (
      <div className="py-12 px-4 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
        </div>
        <h2 className="text-xl font-bold text-kk-ink">
          {language === "hi" ? "ऑर्डर सफलतापूर्वक प्राप्त हुआ!" : "Order Placed Successfully!"}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {language === "hi"
            ? "कारीगरों को आपका ऑर्डर भेज दिया गया है। ONDC नेटवर्क के माध्यम से जल्द डिलीवरी होगी।"
            : "Your order has been directly routed to the verified artisan. It will be dispatched through ONDC Karigar."}
        </p>
        <button
          type="button"
          onClick={() => {
            setOrderComplete(false);
            onExplore();
          }}
          className="mt-4 px-6 py-2.5 bg-kk-primary hover:bg-kk-primary-dark text-white text-xs font-bold rounded-xl shadow-md transition-colors"
        >
          {language === "hi" ? "और हस्तशिल्प खोजें" : "Continue Exploring Crafts"}
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="py-16 px-4 text-center max-w-sm mx-auto space-y-4">
        <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center mx-auto border border-kk-line">
          <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h2 className="text-base font-bold text-kk-ink-soft">
          {language === "hi" ? "आपकी कार्ट खाली है" : "Your Cart is Empty"}
        </h2>
        <p className="text-xs text-stone-500">
          {language === "hi"
            ? "भारतीय कारीगरों द्वारा बनाए गए प्रामाणिक शिल्प खोजें।"
            : "Discover authentic handcrafted pieces made directly by Indian artisans."}
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
    <div className="space-y-5 pb-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-kk-line">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-kk-ink">
            {language === "hi" ? "शॉपिंग कार्ट" : "Shopping Bag"}
          </h2>
          <p className="text-xs text-stone-500">
            {cart.length} {language === "hi" ? "उत्पाद" : "items from master artisans"}
          </p>
        </div>

        <button
          type="button"
          onClick={onClearCart}
          className="text-xs text-stone-400 hover:text-rose-600 transition-colors font-medium"
        >
          {language === "hi" ? "कार्ट खाली करें" : "Clear all"}
        </button>
      </div>

      {/* Cart Items List */}
      <div className="space-y-3">
        {cart.map((item) => {
          const title = language === "hi" ? item.product.titleHi : item.product.titleEn;
          const image = item.product.studioImage || item.product.originalImage;
          const region = item.product.specs?.regionHeritage;

          return (
            <div
              key={item.id}
              className="bg-white p-3 sm:p-4 rounded-2xl border border-kk-line shadow-2xs flex gap-3.5 items-center justify-between"
            >
              {/* Product Thumbnail */}
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-kk-line">
                <img src={image} alt={title} className="w-full h-full object-cover" />
              </div>

              {/* Title & Metadata */}
              <div className="flex-1 min-w-0 pr-1">
                <span className="text-[10px] font-semibold text-kk-primary uppercase tracking-wider block truncate">
                  {item.product.category} {region ? `• ${region}` : ""}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-kk-ink line-clamp-1">
                  {title}
                </h3>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xs text-stone-500 font-medium">₹</span>
                  <span className="text-sm sm:text-base font-extrabold text-kk-ink">
                    {item.selectedPrice.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Quantity Controls & Remove */}
              <div className="flex flex-row items-center gap-1 sm:gap-2 shrink-0">
                <div className="flex items-center border border-kk-line rounded-lg bg-stone-50 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    className="p-1 sm:p-1.5 text-stone-600 hover:bg-stone-200 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                  <span className="px-1.5 sm:px-2 text-xs font-bold text-kk-ink min-w-5 text-center">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="p-1 sm:p-1.5 text-stone-600 hover:bg-stone-200 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="p-1 sm:p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Summary Card */}
      <div className="bg-white p-4 rounded-2xl border border-kk-line shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-kk-ink-soft uppercase tracking-wider">
          {language === "hi" ? "मूल्य विवरण" : "Price Breakdown"}
        </h3>

        <div className="space-y-1.5 text-xs text-stone-600">
          <div className="flex justify-between">
            <span>{language === "hi" ? "उप-योग (Subtotal)" : "Subtotal"}</span>
            <span className="font-semibold text-kk-ink">₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span>{language === "hi" ? "डिलीवरी शुल्क" : "Artisan Shipping"}</span>
            <span className="font-semibold text-kk-ink">
              {shipping === 0 ? (
                <span className="text-emerald-600 font-bold uppercase">{language === "hi" ? "निःशुल्क" : "Free"}</span>
              ) : (
                `₹${shipping}`
              )}
            </span>
          </div>
          <div className="pt-2 border-t border-stone-100 flex justify-between text-sm font-bold text-kk-ink">
            <span>{language === "hi" ? "कुल राशि" : "Total Amount"}</span>
            <span className="text-base text-kk-primary">₹{total.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Free Shipping Tip */}
        {subtotal < 1499 && (
          <div className="bg-kk-primary-soft/50 p-2 rounded-xl text-[11px] text-kk-primary font-medium flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              {language === "hi"
                ? `मुफ़्त डिलीवरी के लिए ₹${(1499 - subtotal).toLocaleString("en-IN")} का और ऑर्डर करें`
                : `Add ₹${(1499 - subtotal).toLocaleString("en-IN")} more for Free Delivery`}
            </span>
          </div>
        )}

        {/* Checkout Button */}
        <button
          type="button"
          onClick={handleCheckout}
          disabled={isCheckingOut}
          className="w-full py-3 px-4 bg-kk-primary hover:bg-kk-primary-dark text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-kk-ink/20 active:scale-98 transition-all disabled:opacity-50"
        >
          {isCheckingOut ? (
            <span>{language === "hi" ? "प्रक्रिया जारी है..." : "Processing ONDC Karigar Order..."}</span>
          ) : (
            <>
              <span>{language === "hi" ? "ऑर्डर पूरा करें (Checkout)" : "Proceed to Checkout"}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
