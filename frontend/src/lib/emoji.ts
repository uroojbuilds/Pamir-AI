import type { ProductItem } from '../types';

const RULES: [RegExp, string][] = [
  [/sneaker|shoe|footwear/i, '👟'],
  [/jeans|pants|trouser/i, '👖'],
  [/hoodie|sweatshirt/i, '🧥'],
  [/t-?shirt/i, '👕'],
  [/shirt|blouse|\btop\b/i, '👚'],
  [/caliper/i, '📏'],
  [/screwdriver|drill/i, '🪛'],
  [/grinder|rotary|heat gun|soldering|multi-?meter|multi-?tool|3d .*pen/i, '🛠️'],
  [/earbud|earphone|headphone|headset|neckband/i, '🎧'],
  [/power ?bank|battery/i, '🔋'],
  [/cable|cord|charger|charging|adapter/i, '🔌'],
  [/led|light|lamp|bulb/i, '💡'],
  [/case|cover/i, '📱'],
  [/fan|cooler/i, '🌀'],
  [/selfie|tripod|stand|holder/i, '🤳'],
  [/watch|band|wearable/i, '⌚'],
  [/speaker|soundbar/i, '🔊'],
  [/camera|webcam|dash ?cam/i, '📷'],
  [/mouse|keyboard/i, '⌨️'],
  [/phone|smartphone/i, '📱'],
];

export function productEmoji(p: Pick<ProductItem, 'product_name' | 'category'>): string {
  for (const [re, e] of RULES) if (re.test(p.product_name)) return e;
  if (p.category === 'Machinery') return '🛠️';
  if (p.category === 'Apparel') return '👕';
  return '📦';
}
