import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  BookOpen
} from 'lucide-react';
import { CUSTOMS_TARIFFS } from '../data/tradeData';

export const TariffRulesView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Electronics', 'Machinery', 'Apparel'];

  const filteredTariffs = CUSTOMS_TARIFFS.filter((item) => {
    const matchesQuery = 
      item.pct_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    return matchesQuery && matchesCategory;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6 select-none"
    >
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-700">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono mb-2 bg-emerald-50 text-[#15803D] border border-emerald-200 shadow-2xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
            <span>FBR FIRST SCHEDULE · PAKISTAN CUSTOMS TARIFF (PCT) 2026</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 dark:text-stone-100">
            FBR Tariff & Customs Schedule
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm mt-0.5">
            Verified statutory customs duty rates cross-referenced with Federal Board of Revenue Chapter Schedules.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Category Filter */}
          <div className="flex items-center bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-1 shadow-2xs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white dark:bg-stone-800 text-[#C2410C] border border-stone-200 dark:border-stone-700 shadow-2xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:text-stone-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PCT code or keyword..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-mono text-xs font-bold text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Main Tariff Table Card */}
      <motion.div 
        layout
        className="bg-white dark:bg-stone-800 border border-stone-200/90 rounded-3xl shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 font-mono font-extrabold uppercase">
                <th className="py-4 px-5">PCT / HS Code</th>
                <th className="py-4 px-5">Statutory Classification & Scope</th>
                <th className="py-4 px-5">Category</th>
                <th className="py-4 px-5 text-center">FBR Duty Rate</th>
                <th className="py-4 px-5">Legal Source Reference</th>
                <th className="py-4 px-5 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800 dark:text-stone-200">
              <AnimatePresence>
                {filteredTariffs.map((item, idx) => (
                  <motion.tr 
                    key={item.pct_code}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                    className="hover:bg-[#FAF8F5] dark:bg-stone-900 transition-colors group"
                  >
                    {/* Tweak 2: Technical Monospaced Code Box */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="font-mono font-black text-xs text-[#C2410C] bg-orange-50 border border-orange-200/80 px-2 py-1 rounded-md tracking-wider inline-block">
                        {item.pct_code}
                      </span>
                    </td>

                    <td className="py-4 px-5 font-medium text-stone-900 dark:text-stone-100 max-w-md">
                      <p className="line-clamp-2 leading-relaxed">{item.description}</p>
                    </td>

                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 font-mono font-bold text-stone-700 dark:text-stone-300">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-center whitespace-nowrap font-mono">
                      <span className={`px-2.5 py-1 rounded-full font-black text-xs ${
                        item.duty_rate <= 5 
                          ? 'bg-emerald-50 text-[#15803D] border border-emerald-200' 
                          : item.duty_rate <= 15
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-orange-50 text-[#EA580C] border border-orange-200'
                      }`}>
                        {item.duty_rate}%
                      </span>
                    </td>

                    {/* Tweak 1: Truncated text with full native hover tooltip */}
                    <td className="py-4 px-5 max-w-xs">
                      <span 
                        title={item.source}
                        className="block truncate text-[11px] font-mono text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:text-stone-100 cursor-help underline decoration-dotted decoration-stone-300 hover:decoration-stone-600 transition-colors"
                      >
                        {item.source}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#15803D] border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" />
                        {item.data_status === 'verified' ? 'FBR Verified' : 'Curated'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-[#FAF8F5] dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-stone-500 dark:text-stone-400">
          <span>Showing <strong>{filteredTariffs.length}</strong> Statutory Tariff Schedules</span>
          <span className="text-stone-700 dark:text-stone-300 font-bold flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>FBR WeBOC / Customs Act 1969 Standard</span>
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};