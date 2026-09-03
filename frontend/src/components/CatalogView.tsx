import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Building2
} from 'lucide-react';
import { PRODUCTS_CATALOG, DUTY_RATES_MAP, PRESET_LOT_MACROS } from '../data/tradeData';

interface CatalogViewProps {
  activeProductId: string;
  onSelectProduct: (productId: string) => void;
  onOpenRfq: (productId: string) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  activeProductId,
  onSelectProduct,
  onOpenRfq,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Electronics', 'Machinery', 'Apparel'];

  const filteredCatalog = selectedCategory === 'All'
    ? PRODUCTS_CATALOG
    : PRODUCTS_CATALOG.filter((p) => p.category === selectedCategory);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6 select-none"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-700">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono mb-2 bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>{PRODUCTS_CATALOG.length} VERIFIED SHENZHEN FACTORY LOTS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 dark:text-stone-100">
            China Lots Directory
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm mt-0.5">
            Pre-audited, low-MOQ consumer items with certified FBR duty classifications and direct supplier pricing.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <motion.button
              whileTap={{ scale: 0.96 }}
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-100'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Preset Lot Quick Launcher */}
      <div className="bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl p-4">
        <span className="text-[10px] font-mono font-bold text-stone-500 dark:text-stone-400 uppercase block mb-2">
          ⚡ Quick Sourcing Presets (Pre-Calculated Batches)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_LOT_MACROS.map((preset) => (
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              key={preset.id}
              type="button"
              onClick={() => onSelectProduct(preset.product_id)}
              className="p-3 bg-white dark:bg-stone-800 border border-stone-200/90 rounded-xl text-left hover:border-amber-400 transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-stone-900 dark:text-stone-100 group-hover:text-[#C2410C] transition-colors">
                  {preset.label}
                </span>
                <span className="text-[10px] font-mono font-black text-[#EA580C]">
                  Rs {preset.capital.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 line-clamp-1">{preset.tagline}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Catalog Cards Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence>
          {filteredCatalog.map((item) => {
            const isSelected = activeProductId === item.product_id;
            const dutyRate = DUTY_RATES_MAP[item.product_id] ?? 20;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                key={item.product_id}
                className={`bg-white dark:bg-stone-800 rounded-3xl p-6 border transition-all duration-200 shadow-sm flex flex-col justify-between space-y-4 relative ${
                  isSelected 
                    ? 'border-amber-400 ring-2 ring-orange-500/20 shadow-md' 
                    : 'border-stone-200/90 hover:border-stone-300 dark:border-stone-600'
                }`}
              >
                <div className="space-y-3">
                  
                  {/* Top Badge Row */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-md bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-[#C2410C]">
                      ID: {item.product_id}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[#15803D] border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      MOQ: {item.moq} pcs
                    </span>
                  </div>

                  {/* Title & Supplier */}
                  <div>
                    <h3 className="font-extrabold text-base text-stone-950 dark:text-stone-50 line-clamp-1">
                      {item.product_name}
                    </h3>
                    <p className="text-xs text-[#6B5B4F] mt-0.5 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 shrink-0" />
                      <span className="truncate">{item.supplier_name}</span>
                    </p>
                  </div>

                  {/* Pricing & Duty Inset Box */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 grid grid-cols-3 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block uppercase font-bold">FOB Price</span>
                      <span className="font-black text-[#C2410C] text-sm">
                        ${item.supplier_price.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block uppercase font-bold">FBR Tariff</span>
                      <span className="font-black text-[#15803D] text-sm">{dutyRate}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block uppercase font-bold">Unit Weight</span>
                      <span className="font-bold text-stone-800 dark:text-stone-200 text-sm">{item.weight_kg} kg</span>
                    </div>
                  </div>

                  {/* Source Badge */}
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 italic">
                    Source: {item.source}
                  </p>

                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => onSelectProduct(item.product_id)}
                    className={`py-2.5 px-3 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-50 text-[#C2410C] border border-amber-300 shadow-2xs'
                        : 'bg-[#FAF8F5] dark:bg-stone-900 hover:bg-stone-100 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    {isSelected ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : null}
                    <span>{isSelected ? 'Active in Funnel' : 'Load Funnel'}</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => onOpenRfq(item.product_id)}
                    className="py-2.5 px-3 rounded-xl font-mono text-xs font-bold bg-[#EA580C] hover:bg-[#C2410C] text-white flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  >
                    <Send className="w-3 h-3 text-white" />
                    <span>Generate RFQ</span>
                  </motion.button>
                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};