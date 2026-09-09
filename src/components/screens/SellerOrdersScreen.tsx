import React, { useState } from "react";
import {
  ArrowLeft,
  ShoppingBag,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  Truck,
  Plus,
  X,
  Search,
} from "lucide-react";
import { RecentOrder, LanguageCode } from "../../types/artisan";
import { TTSButton } from "../common/TTSButton";

interface SellerOrdersScreenProps {
  orders: RecentOrder[];
  language: LanguageCode;
  onBack?: () => void;
  onAddNewCraft?: () => void;
}

export const SellerOrdersScreen: React.FC<SellerOrdersScreenProps> = ({
  orders,
  language,
  onBack,
  onAddNewCraft,
}) => {
  const [selectedOrder, setSelectedOrder] = useState<RecentOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "shipped" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch =
      order.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.itemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalValue = orders.reduce((sum, ord) => sum + ord.amount, 0);
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const shippedCount = orders.filter((o) => o.status === "shipped").length;
  const completedCount = orders.filter((o) => o.status === "completed").length;

  return (
    <div className="flex flex-col h-full bg-kk-surface text-kk-ink p-4 sm:p-5 overflow-y-auto font-sans">
      {/* Top Navigation Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-kk-line shrink-0">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-700 transition-colors"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-base font-bold text-kk-ink tracking-tight">
              {language === "hi" ? "ऑर्डर व खरीदार मांग (Orders)" : "Orders & Demands"}
            </h2>
            <span className="text-[10px] text-stone-500 font-semibold uppercase">
              GeM Govt • ONDC • B2B Karigar
            </span>
          </div>
        </div>

        <TTSButton
          text={
            language === "hi"
              ? "आपके शिल्प के सभी हालिया ऑर्डर और मांग यहाँ देखें।"
              : "View all recent orders and market demands for your crafts here."
          }
          lang={language}
          size="sm"
          variant="iconOnly"
        />
      </div>

      {/* Orders Summary Metrics */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-3.5 shrink-0">
        <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-kk-line shadow-xs text-center">
          <span className="text-[10px] text-stone-500 font-semibold block uppercase">
            {language === "hi" ? "कुल ऑर्डर" : "Total Orders"}
          </span>
          <span className="text-base sm:text-lg font-black text-kk-ink mt-0.5 block">
            {orders.length}
          </span>
        </div>

        <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-kk-line shadow-xs text-center">
          <span className="text-[10px] text-amber-600 font-semibold block uppercase">
            {language === "hi" ? "प्रतीक्षारत" : "Pending"}
          </span>
          <span className="text-base sm:text-lg font-black text-amber-700 mt-0.5 block">
            {pendingCount}
          </span>
        </div>

        <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-kk-line shadow-xs text-center">
          <span className="text-[10px] text-emerald-600 font-semibold block uppercase">
            {language === "hi" ? "कुल मूल्य" : "Total Revenue"}
          </span>
          <span className="text-xs sm:text-sm font-black text-emerald-700 mt-1 block truncate">
            ₹{totalValue.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="mt-3.5 space-y-2 shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={
              language === "hi"
                ? "खरीदार, शिल्प या ऑर्डर नंबर खोजें..."
                : "Search buyer, craft, or order #..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-kk-line text-xs focus:outline-hidden focus:border-kk-primary text-kk-ink"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-kk-primary text-white shadow-2xs"
                : "bg-white text-stone-600 border border-kk-line hover:bg-stone-50"
            }`}
          >
            {language === "hi" ? "सभी" : "All"} ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              statusFilter === "pending"
                ? "bg-amber-600 text-white shadow-2xs"
                : "bg-white text-stone-600 border border-kk-line hover:bg-stone-50"
            }`}
          >
            {language === "hi" ? "प्रतीक्षारत" : "Pending"} ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("shipped")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              statusFilter === "shipped"
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-white text-stone-600 border border-kk-line hover:bg-stone-50"
            }`}
          >
            {language === "hi" ? "भेजे गए" : "Shipped"} ({shippedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("completed")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              statusFilter === "completed"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-white text-stone-600 border border-kk-line hover:bg-stone-50"
            }`}
          >
            {language === "hi" ? "पूर्ण" : "Completed"} ({completedCount})
          </button>
        </div>
      </div>

      {/* Orders List with safe bottom padding for the fixed mobile navbar */}
      <div className="mt-3 space-y-2.5 flex-1 pb-28 md:pb-8">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-stone-300 p-6">
            <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-kk-ink">
              {language === "hi" ? "कोई ऑर्डर नहीं मिला" : "No orders found"}
            </h4>
            <p className="text-xs text-stone-500 mt-1">
              {language === "hi"
                ? "वर्तमान फ़िल्टर के अनुसार कोई ऑर्डर मौजूद नहीं है।"
                : "No matching orders found under the current filter."}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              role="button"
              tabIndex={0}
              className="p-3.5 bg-white rounded-2xl border border-kk-line shadow-xs flex items-center justify-between gap-3 cursor-pointer hover:border-kk-primary transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={order.itemImage}
                  alt={order.itemTitle}
                  className="w-13 h-13 rounded-xl object-cover shrink-0 border border-kk-line"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase bg-stone-100 text-stone-700">
                      {order.buyerType === "gem"
                        ? "🏛️ GeM Govt"
                        : order.buyerType === "b2b_wholesale"
                        ? "🏢 Wholesale"
                        : "🛍️ ONDC Retail"}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">
                      {order.orderNumber}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-kk-ink truncate mt-1">
                    {order.buyerName}
                  </h4>
                  <p className="text-[11px] text-stone-500 truncate">
                    {order.quantity}x {order.itemTitle}
                  </p>
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    {order.date}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs sm:text-sm font-black text-kk-ink block">
                  ₹{order.amount.toLocaleString("en-IN")}
                </span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 uppercase ${
                    order.status === "completed"
                      ? "bg-emerald-100 text-emerald-800"
                      : order.status === "shipped"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 border border-kk-line shadow-2xl space-y-4 font-sans animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  Order Details
                </span>
                <h3 className="text-sm font-bold text-kk-ink">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                  selectedOrder.status === "completed"
                    ? "bg-emerald-100 text-emerald-800"
                    : selectedOrder.status === "shipped"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {selectedOrder.status}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={selectedOrder.itemImage}
                alt={selectedOrder.itemTitle}
                className="w-14 h-14 rounded-xl object-cover border border-kk-line shrink-0"
              />
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-kk-ink truncate">
                  {selectedOrder.itemTitle}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Quantity: {selectedOrder.quantity} units
                </p>
                <p className="text-sm font-extrabold text-kk-primary mt-1">
                  ₹{selectedOrder.amount.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Buyer:</span>
                <span className="font-semibold text-kk-ink">{selectedOrder.buyerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Channel:</span>
                <span className="font-semibold text-stone-700">{selectedOrder.buyerTypeLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Ordered On:</span>
                <span className="font-medium text-stone-600">{selectedOrder.date}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              {onAddNewCraft && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrder(null);
                    onAddNewCraft();
                  }}
                  className="flex-1 py-2.5 bg-kk-primary text-white rounded-xl text-xs font-bold hover:bg-kk-primary-dark flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === "hi" ? "+ नया शिल्प" : "+ Add Similar"}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-2.5 bg-stone-100 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-200 transition-colors"
              >
                {language === "hi" ? "बंद करें" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
