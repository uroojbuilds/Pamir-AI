import { useState, type CSSProperties } from 'react';
import { productEmoji } from '../lib/emoji';
import { productImages } from '../lib/productImages';

type Prod = { product_id: string; product_name: string; category?: string };

/**
 * Product photo with a safe fallback to the product's emoji (no photo listed, or the
 * file fails to load). `height` = full-width card image; `size` = fixed square thumbnail.
 */
export function ProductImage({ product, height = 170, size, style }: {
  product: Prod; height?: number; size?: number; style?: CSSProperties;
}) {
  const [failed, setFailed] = useState<Record<string, true>>({});
  const src = productImages(product.product_id).find((u) => !failed[u]);
  const box: CSSProperties = size
    ? { width: size, height: size, margin: 0, flex: 'none', fontSize: Math.round(size * 0.4), borderRadius: size > 40 ? 12 : 8, display: 'inline-grid', verticalAlign: 'middle', ...style }
    : { height, ...style };
  if (!src) return <div className="pimg" style={box} aria-hidden="true">{productEmoji({ product_name: product.product_name, category: product.category ?? '' })}</div>;
  return (
    <div className="pimg has" style={box}>
      <img src={src} alt={product.product_name} loading="lazy" onError={() => setFailed((f) => ({ ...f, [src]: true }))} />
    </div>
  );
}

/** Large photo with thumbnails when a product has more than one image. */
export function ProductGallery({ product }: { product: Prod }) {
  const [i, setI] = useState(0);
  const [failed, setFailed] = useState<Record<string, true>>({});
  const urls = productImages(product.product_id).filter((u) => !failed[u]);
  if (urls.length === 0) return null;
  const cur = urls[Math.min(i, urls.length - 1)];
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="pimg has" style={{ height: 230, marginBottom: urls.length > 1 ? 8 : 0 }}>
        <img src={cur} alt={product.product_name} onError={() => setFailed((f) => ({ ...f, [cur]: true }))} />
      </div>
      {urls.length > 1 && (
        <div style={{ display: 'flex', gap: 8 }}>
          {urls.map((u, k) => (
            <button key={u} type="button" aria-label={`Photo ${k + 1} of ${urls.length}`} onClick={() => setI(k)}
                    className="pthumb" style={{ outline: u === cur ? '2px solid var(--or)' : 'none' }}>
              <img src={u} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
