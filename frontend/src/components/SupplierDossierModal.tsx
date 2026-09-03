import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  ExternalLink, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Send, 
  Globe, 
  FileText, 
  Copy, 
  Check, 
  PackageCheck,
  Award
} from 'lucide-react';
import { ProductItem } from '../types';
import { getSupplierProfile, SupplierProfile } from '../utils/supplierHelper';
import { supplierService } from '../services';
import { StatusBadge } from './StatusBadge';

interface SupplierDossierModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectForCanvas?: (productId: string) => void;
  onOpenRfq?: (productId: string) => void;
}

export const SupplierDossierModal: React.FC<SupplierDossierModalProps> = ({
  product,
  isOpen,
  onClose,
  onSelectForCanvas,
  onOpenRfq,
}) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Profile is seeded synchronously from the local supplierHelper (unchanged
  // behavior - dossier never shows a blank state), then replaced with the
  // real backend's /api/supplier-info result merged in once it resolves.
  // supplierService.getSupplierProfile() already falls back to the local
  // profile internally on any backend failure, so no separate .catch here.
  const [profile, setProfile] = useState<SupplierProfile | null>(
    product ? getSupplierProfile(product) : null
  );

  useEffect(() => {
    if (!product) return;
    let cancelled = false;

    setProfile(getSupplierProfile(product));
    supplierService.getSupplierProfile(product).then((merged) => {
      if (!cancelled) setProfile(merged);
    });

    return () => {
      cancelled = true;
    };
  }, [product?.product_id]);

  if (!isOpen || !product) return null;

  const profileToDisplay = profile ?? getSupplierProfile(product);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div 
        id="supplier-dossier-modal"
        className="bg-white dark:bg-stone-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-[#1E293B] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-[#EA580C]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#EA580C]">
                  FACTORY & SUPPLIER PROFILE
                </span>
                <span className="text-stone-400 dark:text-stone-500 font-mono text-xs">[{product.supplier_id}]</span>
              </div>
              <h3 className="font-bold text-base text-white leading-tight">
                {product.supplier_name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 dark:text-stone-500 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Target Product Association Banner */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold font-mono text-stone-400 dark:text-stone-500 uppercase">
                Associated Product SKU: {product.product_id}
              </div>
              <div className="font-extrabold text-stone-900 dark:text-stone-100 text-sm mt-0.5">
                {product.product_name}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-3">
                <span>FOB: <strong className="text-stone-900 dark:text-stone-100">${(product.supplier_price ?? 0).toFixed(2)} USD</strong></span>
                <span>•</span>
                <span>MOQ: <strong className="text-stone-900 dark:text-stone-100">{product.moq ?? 1} pcs</strong></span>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <StatusBadge status={product.data_status} />
            </div>
          </div>

          {/* Sourcing Location & Verified Credentials Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-500 dark:text-stone-400 mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>Manufacturing Hub / Location</span>
              </div>
              <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                {profileToDisplay.location}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-500 dark:text-stone-400 mb-1">
                <Globe className="w-3.5 h-3.5 text-[#15803D]" />
                <span>Verified Sourcing Platform</span>
              </div>
              <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                {profileToDisplay.platform}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-500 dark:text-stone-400 mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Standard Production Lead Time</span>
              </div>
              <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                {profileToDisplay.lead_time}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-500 dark:text-stone-400 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
                <span>Trade Assurance & Escrow</span>
              </div>
              <div className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
                <span>Supported (Buyer Protection)</span>
              </div>
            </div>
          </div>

          {/* Direct Marketplace & Product Reach Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Direct Marketplace & Factory Product Links
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Click below to view the active product listing, showroom catalog, or supplier storefront directly on China B2B portals:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {profileToDisplay.marketplace_links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-orange-400 hover:bg-orange-50/40 transition-all flex items-center justify-between group cursor-pointer bg-white dark:bg-stone-800"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-[10px] font-mono font-bold text-[#C2410C] uppercase">
                      {link.badge}
                    </div>
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#C2410C] transition-colors">
                      {link.name}
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-stone-400 dark:text-stone-500 group-hover:text-[#EA580C] shrink-0" />
                </a>
              ))}
            </div>
          </div>

          {/* Export Certifications & Contact Desk */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#EA580C]" />
                Factory Quality Certifications
              </span>
              <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">ISO 9001 / CE Verified</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profileToDisplay.certifications.map((c, i) => (
                <span key={i} className="text-[11px] font-medium bg-white dark:bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-[#FAF8F5] dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-500 dark:text-stone-400 text-center sm:text-left">
            Ready to initiate direct procurement or formal price negotiation?
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenRfq && (
              <button
                onClick={() => {
                  onOpenRfq(product.product_id);
                  onClose();
                }}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Generate RFQ Letter</span>
              </button>
            )}

            {onSelectForCanvas && (
              <button
                onClick={() => {
                  onSelectForCanvas(product.product_id);
                  onClose();
                }}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-stone-800 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>Load in Canvas</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};