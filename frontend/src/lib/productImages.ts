// Product photos live in /public/products/<PRODUCT_ID>.jpg (extra angles: <ID>-2.jpg).
// Only products that have a photo are listed; every other product falls back to its
// emoji (see ProductImage), so a missing/unlisted image can never break the UI.
const FILES: Record<string, string[]> = {
  A001: ["A001.jpg"],
  A002: ["A002.jpg"],
  A003: ["A003.jpg"],
  A004: ["A004.jpg"],
  A005: ["A005.jpg"],
  A006: ["A006.jpg", "A006-2.jpg"],
  A007: ["A007.jpg", "A007-2.jpg"],
  A008: ["A008.jpg"],
  P001: ["P001.jpg"],
  P002: ["P002.jpg"],
  P003: ["P003.jpg"],
  P004: ["P004.jpg"],
  P007: ["P007.jpg"],
  P008: ["P008.jpg"],
  P010: ["P010.jpg"],
  P028: ["P028.jpg"],
  P029: ["P029.jpg"],
  P031: ["P031.jpg"],
  P032: ["P032.jpg"],
  P034: ["P034.jpg"],
  P035: ["P035.jpg"],
  P036: ["P036.jpg"],
  P037: ["P037.jpg"],
  P038: ["P038.jpg"],
  P039: ["P039.jpg"],
  P040: ["P040.jpg"],
};

const BASE = import.meta.env.BASE_URL || '/';

/** URLs of the photos for a product (primary first). Empty array = no photo. */
export const productImages = (productId: string): string[] =>
  (FILES[productId] ?? []).map((f) => `${BASE}products/${f}`);
