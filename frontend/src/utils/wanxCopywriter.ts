import { ProductItem, MarketingCopyPayload } from '../types';

export function generateWanxCopywriting(product: ProductItem): MarketingCopyPayload {
  const pricePkr = Math.round((product.supplier_price ?? 0) * 279.30);
  const retailEstimatePkr = Math.round(pricePkr * 2.6);

  let description = '';
  let caption = '';

  if (product.category === 'Electronics') {
    description = `Premium high-performance ${product.product_name}. Engineered with Tier-1 components for reliable daily operation, low power draw, and seamless compatibility across Android, iOS, and PC platforms. Direct factory sourced from ${product.supplier_name} with verified quality inspection benchmarks. Features lightweight ergonomic form factor, rapid charging protocol support, and high-fidelity signal stability.`;

    caption = `🔥 NEW WHOLESALE LOT ALERT: ${product.product_name} 🔥\n\nDirect China factory import landed in Pakistan! Sourced directly from ${product.supplier_name}.\n\n✨ Factory Cost: Rs ${pricePkr.toLocaleString()} PKR | Est. Local Retail: Rs ${retailEstimatePkr.toLocaleString()} PKR\n📦 Minimum Order: ${product.moq || 10} Units\n⚡ High demand consumer electronics with guaranteed local margins.\n\n🚚 Available for wholesale dispatch across Karachi, Lahore, Islamabad, and Rawalpindi.\n\n📲 DM or WhatsApp now to reserve your factory allocation!\n\n#TradePakistan #DarazSeller #WholesaleKarachi #PakChinaTrade #ShenzhenSourcing #EcommercePakistan`;
  } else if (product.category === 'Machinery') {
    description = `Industrial-grade ${product.product_name}. Built for continuous workshop, prototyping, and light manufacturing environments. Sourced directly from ${product.supplier_name} with heavy-duty structural chassis, high precision guide rails, and emergency safety cut-offs. Complies with ISO manufacturing standards for low maintenance and high operational uptime.`;

    caption = `⚙️ INDUSTRIAL MACHINERY LOT: ${product.product_name} ⚙️\n\nUpgrade your production capacity with direct China factory import!\n\n🏭 Manufacturer: ${product.supplier_name}\n💰 Landed Factory Base: Rs ${pricePkr.toLocaleString()} PKR\n🛠️ Low MOQ: ${product.moq || 1} Unit\n\n🚀 Ideal for local manufacturers, workshops, and fabricators seeking high-precision throughput without heavy dealer premiums.\n\n📍 Inquire today for technical datasheets and Karachi delivery schedule.\n\n#MachineryPakistan #CNCPakistan #IndustrialAutomation #KarachiIndustrial #PakChinaCorridor #B2BPakistan`;
  } else {
    description = `Export-grade ${product.product_name}. Crafted from premium high-density fabrics with reinforced double-needle stitching, colorfast dye retention, and pre-shrunk anti-pilling finish. Designed for modern fashion retail, streetwear brands, and corporate private labeling. Supplied directly by ${product.supplier_name} with full customization support.`;

    caption = `👕 PREMIUM APPAREL LOT: ${product.product_name} 👕\n\nLaunch or scale your clothing brand with direct Guangzhou factory manufacturing!\n\n🏷️ Sourced from: ${product.supplier_name}\n💸 Base Unit Cost: Rs ${pricePkr.toLocaleString()} PKR | Retail Target: Rs ${retailEstimatePkr.toLocaleString()} PKR\n📦 Ready MOQ: ${product.moq || 50} Pieces\n\n✨ Superior hand-feel, streetwear fit, and retail-ready packaging.\n\n📦 Nationwide delivery available across Pakistan.\n\n#ApparelPakistan #ClothingBrandPK #StreetwearPakistan #DarazFashion #WholesaleApparel #LahoreFashion`;
  }

  return {
    product_description: description,
    social_media_caption: caption
  };
}
