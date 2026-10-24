export const SUPPORT_EMAIL = 'support@pamir.ai';
export const GITHUB_URL = 'https://github.com/';

export const TABS = ['Overview', 'Cost Analysis', 'Viability', 'Suppliers & RFQ', 'History'] as const;
export type ProductTab = (typeof TABS)[number];

export const HOW_STEPS: [string, string, string][] = [
  ['🔍', 'Discover Products', 'Set your budget, pick a category, browse what you can afford.'],
  ['📊', 'Analyze Costs', 'Landed cost, tariffs, viability and profit margin in PKR.'],
  ['🤝', 'Find Suppliers', 'Shortlist suppliers and generate RFQs.'],
  ['🚀', 'Launch & Grow', 'Marketing, launch kit and import guidance for your product.'],
];

export const FEATURES: [string, string][] = [
  ['💰', 'Budget-first discovery'],
  ['🧮', 'Import cost calculator'],
  ['📜', 'FBR tariff lookup'],
  ['💱', 'USD ⇄ PKR converter'],
  ['📈', 'Historical price trends'],
  ['✉️', 'Bilingual RFQ generator'],
];

export const ABOUT_CARDS: [string, string, string][] = [
  ['🎯', 'Built for first-timers', 'Plain-language steps instead of customs jargon and scattered spreadsheets.'],
  ['🔎', 'Transparent numbers', 'Every figure carries its source, date and a verified / curated / estimated label.'],
  ['🧾', 'Auditable decisions', 'Every change to capital, quantity or product is written to your audit trail.'],
  ['🛡️', 'You stay in control', 'Pamir generates the estimate and the RFQ; you decide and you contact the supplier.'],
];

export const FAQ_CATS = ['All', 'Getting started', 'Data & accuracy', 'Suppliers'] as const;
export const FAQS: [string, string, string][] = [
  ['Getting started', 'How does Pamir AI work?', 'You enter a budget and category, we show products you can afford, then break down cost, tariffs, viability, suppliers and launch steps.'],
  ['Getting started', 'Do I need import experience?', 'No. Each step explains what it means in plain language, and the Import Guidance tab lists what to check before you order.'],
  ['Data & accuracy', 'What data sources do you use?', 'Marketplace listings, FBR customs tariffs, SBP exchange rates and freight rates from our dataset. Each figure shows its source and date.'],
  ['Data & accuracy', 'Is the landed cost accurate?', 'It is an estimate built from the product price, air-freight rate and the FBR duty rate. Always confirm with your clearing agent.'],
  ['Data & accuracy', 'What do verified, curated and estimated mean?', 'Verified: checked against an official source. Curated: gathered from marketplace listings. Estimated: indicative only, not from a live source.'],
  ['Suppliers', 'Can I get supplier quotes directly?', 'Pamir generates the RFQ (English or Chinese); you send it to the supplier yourself.'],
  ['Suppliers', 'Do you verify Trade Assurance?', 'We show the Trade Assurance status stored in our dataset. Check it on the supplier page before paying.'],
];

// Only categories that exist in the backend dataset (backend/Data/products.json).
export const CATEGORY_ICONS: Record<string, string> = {
  Electronics: '📱',
  Apparel: '👕',
  Machinery: '🛠️',
};
