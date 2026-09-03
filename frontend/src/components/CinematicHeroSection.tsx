import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import {
  Package,
  Cpu,
  Building2,
  ReceiptText,
  BadgeCheck,
  Globe2,
  ArrowRight,
  Sparkles,
  Plane
} from 'lucide-react';
import { PamirLogo } from './PamirLogo';

const SBP_USD_PKR_BASELINE = 279.30;

const SIMULATION_STAGES = [
  { step: '01', title: 'Capital Allocation', detail: 'PKR 80k Matched to Verified SKU Catalog', tag: 'PKR 80,000' },
  { step: '02', title: 'OEM Audit & Assurance', detail: 'Shenzhen Bochen Audio Verified · MOQ 50', tag: 'Trade Assurance' },
  { step: '03', title: 'Tariff & Landed Cost', detail: 'HS 8518.30 · Automated FBR Valuation & CIF', tag: 'Rs 25,276 CIF' },
  { step: '04', title: 'Commercial Viability', detail: '80/100 Composite Score · High Net Margin', tag: '80/100 Score' }
];

const springTransition = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 15,
  mass: 0.8
};

interface CinematicHeroSectionProps {
  onFindOpportunity?: () => void;
}

export const CinematicHeroSection: React.FC<CinematicHeroSectionProps> = ({
  onFindOpportunity
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [activeStep, setActiveStep] = useState(1);

  // 3D Perspective Physics
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 120, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 120, damping: 15 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['5deg', '-5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % SIMULATION_STAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  return (
    <section
      id="cinematic-hero-section"
      className="relative w-full bg-[#FAF8F3] dark:bg-[#1A1612] text-stone-900 dark:text-stone-100 min-h-screen flex flex-col justify-center px-6 lg:px-14 py-16 overflow-hidden select-none border-b border-stone-200 dark:border-stone-700"
    >
      {/* Background Soft Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <motion.div 
          animate={prefersReducedMotion ? undefined : { scale: [1, 1.12, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -right-10 w-[600px] h-[550px] bg-orange-300 rounded-full blur-[140px]" 
        />
        <motion.div 
          animate={prefersReducedMotion ? undefined : { scale: [1.1, 1, 1.1], opacity: [0.12, 0.2, 0.12] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -bottom-20 -left-10 w-[550px] h-[550px] bg-emerald-300 rounded-full blur-[140px]" 
        />
        <div className="absolute inset-0 bg-[radial-gradient(#e7e5e4_1px,transparent_1px)] [background-size:24px_24px] opacity-65" />
      </div>

      <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center z-10">
        
        {/* ================= LEFT COLUMN ================= */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Top Corridor Banner */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springTransition, delay: 0.1 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-stone-800/90 backdrop-blur-md border border-stone-200/90 text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-bold tracking-wide uppercase font-mono shadow-2xs group"
          >
            <span className="text-base">🇵🇰</span>
            <span>PAKISTAN</span>
            <span className="text-[#EA580C] font-black group-hover:scale-125 transition-transform">⇄</span>
            <span>CHINA</span>
            <span className="text-base">🇨🇳</span>
            <span className="text-stone-300">|</span>
            <span className="text-[#C2410C] font-extrabold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#EA580C] animate-pulse" />
              CPEC DIGITAL CORRIDOR
            </span>
          </motion.div>

          {/* Logo & Headline */}
          <div className="space-y-3">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...springTransition, delay: 0.2 }}
            >
              <PamirLogo size="md" showText={true} />
            </motion.div>

            <motion.h1
              initial={prefersReducedMotion ? false : { opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...springTransition, delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-[#1E293B]"
            >
              FROM BUDGET <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#F59E0B]">
                TO BUSINESS.
              </span>
            </motion.h1>
          </div>

          {/* Subheadline with AI Indicator */}
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...springTransition, delay: 0.4 }}
            className="text-stone-700 dark:text-stone-300 text-base sm:text-lg leading-relaxed max-w-xl font-normal"
          >
            Empowering Pakistani entrepreneurs to discover verified Shenzhen factories, evaluate{' '}
            <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[#C2410C] text-xs font-mono shadow-2xs">
              <Sparkles className="w-3 h-3 text-[#EA580C] animate-spin" style={{ animationDuration: '4s' }} />
              AI-Analyzed
            </span>{' '}
            landed costs, and automate FBR customs compliance at a baseline of{' '}
            <span className="text-[#C2410C] font-mono font-black underline decoration-orange-300">
              Rs {SBP_USD_PKR_BASELINE.toFixed(2)} / USD
            </span>.
          </motion.p>

          {/* Single Focused CTA Button */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springTransition, delay: 0.5 }}
            className="flex items-center pt-2"
          >
            <button
              type="button"
              onClick={onFindOpportunity}
              className="relative overflow-hidden inline-flex items-center justify-center gap-3 px-9 py-4 rounded-2xl bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#EA580C] bg-[length:200%_auto] hover:bg-right text-white text-base font-extrabold tracking-wide shadow-[0_4px_15px_rgba(234,88,12,0.25)] hover:shadow-[0_10px_25px_rgba(234,88,12,0.35)] transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer group"
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none ease-in-out" />
              <span className="relative z-10">START IMPORT JOURNEY</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform relative z-10" />
            </button>
          </motion.div>
        </div>

        {/* ================= RIGHT COLUMN: 3D ANIMATED HERO STAGE ================= */}
        <div className="lg:col-span-6 relative flex justify-center [perspective:1200px]">
          
          {/* Floating Telemetry Pod 1 */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, x: -70, y: -40, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            transition={{ ...springTransition, delay: 0.4 }}
            className="absolute -top-10 left-0 z-30 w-64"
          >
            <motion.div
              animate={prefersReducedMotion ? undefined : { y: [0, -6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="bg-white dark:bg-stone-800/95 backdrop-blur-md border border-stone-200 dark:border-stone-700 rounded-2xl p-3.5 shadow-md"
            >
              <div className="flex items-center justify-between mb-1 text-[10px] font-mono text-[#C2410C]">
                <span className="font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#EA580C] animate-ping" />
                  Terminal · Karachi
                </span>
                <span className="text-stone-500 dark:text-stone-400 font-bold">PKR 80k Capital</span>
              </div>
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-snug">
                "Evaluating low-MOQ consumer electronics compliant with FBR HS 8518.30 valuation."
              </p>
            </motion.div>
          </motion.div>

          {/* Floating Telemetry Pod 2 */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, x: 70, y: -40, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            transition={{ ...springTransition, delay: 0.55 }}
            className="absolute -top-8 right-0 z-30 w-64"
          >
            <motion.div
              animate={prefersReducedMotion ? undefined : { y: [0, 6, 0] }}
              transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              className="bg-white dark:bg-stone-800/95 backdrop-blur-md border border-stone-200 dark:border-stone-700 rounded-2xl p-3.5 shadow-md"
            >
              <div className="flex items-center justify-between mb-1 text-[10px] font-mono text-stone-900 dark:text-stone-100">
                <span className="font-bold">OEM Hub · Shenzhen</span>
                <span className="text-[#15803D] font-bold">Trade Assurance</span>
              </div>
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-snug">
                "Shenzhen Bochen verified: ISO9001 certified, custom packaging supported at MOQ 50."
              </p>
            </motion.div>
          </motion.div>

          {/* MAIN 3D GLASS TILT CONTAINER */}
          <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d'
            }}
            animate={{
              y: [0, -8, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="relative w-full max-w-lg bg-white dark:bg-stone-800/95 backdrop-blur-xl border border-orange-200/60 rounded-3xl p-6 shadow-xl space-y-4 mt-8 cursor-pointer"
          >

            {/* 3D LAYER 1: MONOGRAMS & CONNECTION BEAM */}
            <div 
              style={{ transform: 'translateZ(30px)' }}
              className="relative w-full h-48 rounded-2xl bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-4 flex items-center justify-between overflow-hidden shadow-inner"
            >
              {/* Dynamic Animated Pulse Connection Line */}
              <div className="absolute inset-x-20 top-1/2 -translate-y-1/2 h-[3px] bg-gradient-to-r from-[#1E293B] via-[#EA580C] to-[#F59E0B] rounded-full overflow-hidden">
                <motion.div 
                  animate={prefersReducedMotion ? undefined : { x: ['-100%', '100%'] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
                  className="w-1/3 h-full bg-white dark:bg-stone-800 shadow-[0_0_8px_#ffffff]"
                />
              </div>

              {/* Central Vector Node */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white dark:bg-stone-800 border border-orange-200 flex items-center justify-center shadow-md z-10">
                <Plane className="w-5 h-5 text-[#EA580C] transform rotate-45 animate-pulse" />
              </div>

              {/* Karachi Node: Deep Slate (#1E293B -> #0F172A) */}
              <div className="relative z-10 flex flex-col items-center space-y-2">
                <div className="relative group">
                  <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-white font-black text-2xl flex items-center justify-center border-3 border-white shadow-md">
                    K
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#15803D] border-2 border-white flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-stone-800 animate-ping" />
                  </span>
                </div>
                <span className="text-[10px] font-mono font-extrabold bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 px-2.5 py-0.5 rounded-md shadow-2xs">
                  Karachi · Port Hub
                </span>
              </div>

              {/* Shenzhen Node: Terracotta Orange */}
              <div className="relative z-10 flex flex-col items-center space-y-2">
                <div className="relative group">
                  <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-[#EA580C] to-amber-500 text-white font-black text-2xl flex items-center justify-center border-3 border-white shadow-md">
                    S
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#EA580C] border-2 border-white flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-stone-800" />
                  </span>
                </div>
                <span className="text-[10px] font-mono font-extrabold bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 px-2.5 py-0.5 rounded-md shadow-2xs">
                  Shenzhen · OEM Hub
                </span>
              </div>

              {/* Top Live Badge */}
              <div className="absolute top-2.5 right-3">
                <span className="text-[9px] font-mono font-extrabold text-[#15803D] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] animate-pulse" />
                  LIVE CORRIDOR
                </span>
              </div>
            </div>

            {/* 3D LAYER 2: SIMULATION STAGE BAR */}
            <div 
              style={{ transform: 'translateZ(20px)' }}
              className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-[#EA580C] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Cpu className="w-4 h-4 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-black text-stone-900 dark:text-stone-100 uppercase tracking-wider font-mono">
                    {SIMULATION_STAGES[activeStep].title}
                  </p>
                  <span className="text-[9px] font-mono text-[#15803D] bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-black">
                    STAGE {SIMULATION_STAGES[activeStep].step}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B5B4F] font-mono truncate mt-0.5 font-medium">
                  {SIMULATION_STAGES[activeStep].detail}
                </p>
              </div>
            </div>

            {/* 3D LAYER 3: 4 CAPABILITY METRIC TILES */}
            <div 
              style={{ transform: 'translateZ(15px)' }}
              className="grid grid-cols-2 gap-2.5 pt-1"
            >
              <div className="bg-[#FAF8F5] dark:bg-stone-900 p-2.5 rounded-2xl border border-stone-200 dark:border-stone-700">
                <div className="flex items-center gap-1 text-[9px] font-mono uppercase text-stone-500 dark:text-stone-400 mb-0.5 font-bold">
                  <Package className="w-3 h-3 text-[#EA580C]" />
                  <span>Product Match</span>
                </div>
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">TWS ANC Earbuds</p>
                <p className="text-[10px] font-mono text-[#15803D] font-bold">92% Compliance</p>
              </div>

              <div className="bg-[#FAF8F5] dark:bg-stone-900 p-2.5 rounded-2xl border border-stone-200 dark:border-stone-700">
                <div className="flex items-center gap-1 text-[9px] font-mono uppercase text-stone-500 dark:text-stone-400 mb-0.5 font-bold">
                  <Building2 className="w-3 h-3 text-stone-600 dark:text-stone-400" />
                  <span>Supplier Match</span>
                </div>
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">Shenzhen Bochen OEM</p>
                <p className="text-[10px] font-mono text-[#15803D] font-bold">Trade Assurance</p>
              </div>

              <div className="bg-[#FAF8F5] dark:bg-stone-900 p-2.5 rounded-2xl border border-stone-200 dark:border-stone-700">
                <div className="flex items-center gap-1 text-[9px] font-mono uppercase text-stone-500 dark:text-stone-400 mb-0.5 font-bold">
                  <ReceiptText className="w-3 h-3 text-[#EA580C]" />
                  <span>Landed Cost</span>
                </div>
                <p className="text-xs font-bold text-[#C2410C] truncate">Rs 25,276 CIF</p>
                <p className="text-[10px] font-mono text-stone-500 dark:text-stone-400 font-medium">12-18 Days Lead</p>
              </div>

              <div className="bg-[#FAF8F5] dark:bg-stone-900 p-2.5 rounded-2xl border border-stone-200 dark:border-stone-700">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1 text-[9px] font-mono uppercase text-stone-500 dark:text-stone-400 font-bold">
                    <BadgeCheck className="w-3 h-3 text-[#15803D]" />
                    <span>Viability</span>
                  </div>
                  <span className="text-[8px] font-mono font-bold text-[#C2410C] bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                    Qwen AI
                  </span>
                </div>
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">80 / 100</p>
                <p className="text-[10px] font-mono text-[#15803D] font-bold">High Net Margin</p>
              </div>
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
};