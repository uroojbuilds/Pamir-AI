import { ProductItem, MarketingCopyPayload } from '../types';

/**
 * Offline fallback used only when POST /api/marketing is unreachable.
 * Mirrors the backend's deterministic English template (backend/main.py,
 * get_marketing_content) so the copy is the same online and offline.
 * No prices, margins or quality claims are invented here.
 */
export function generateWanxCopywriting(product: ProductItem): MarketingCopyPayload {
  const name = product.product_name;
  return {
    product_description: `Introducing the ${name} — premium quality at an unbeatable price.`,
    social_media_caption: `🔥 Get your ${name} today! Limited stock available.`,
  };
}
