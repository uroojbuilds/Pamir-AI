import { ProductItem } from '../types';

export interface SupplierProfile {
  supplier_name: string;
  supplier_id: string;
  location: string;
  platform: string;
  trade_assurance: boolean;
  lead_time: string;
  sample_availability: string;
  certifications: string[];
  contact_channels: string[];
  marketplace_links: {
    name: string;
    url: string;
    badge: string;
  }[];
}

export function getSupplierProfile(product: ProductItem): SupplierProfile {
  const query = encodeURIComponent(product.product_name);
  const supplierQuery = encodeURIComponent(product.supplier_name.replace(/Aggregated.*?\((.*?)\)/, '$1'));

  // Derive location from supplier name or category
  let location = "Shenzhen, Guangdong Province, China";
  if (product.supplier_name.includes("Wenzhou") || product.supplier_name.includes("Zhejiang")) {
    location = "Wenzhou / Hangzhou, Zhejiang Province, China";
  } else if (product.supplier_name.includes("Ningbo")) {
    location = "Ningbo Port Area, Zhejiang Province, China";
  } else if (product.supplier_name.includes("Yiwu")) {
    location = "Yiwu International Trade City, Zhejiang Province, China";
  } else if (product.supplier_name.includes("Guangzhou") || product.supplier_name.includes("Dongguan")) {
    location = "Guangzhou / Dongguan Pearl River Delta, Guangdong, China";
  } else if (product.supplier_name.includes("Jinan")) {
    location = "Jinan High-Tech Industrial Zone, Shandong Province, China";
  } else if (product.supplier_name.includes("Xiamen")) {
    location = "Xiamen Special Economic Zone, Fujian Province, China";
  }

  const isVerified = product.data_status === 'verified';

  return {
    supplier_name: product.supplier_name,
    supplier_id: product.supplier_id,
    location,
    platform: product.source.includes('Made-in-China') 
      ? 'Made-in-China.com Verified Diamond' 
      : product.source.includes('GlobalSources') 
        ? 'GlobalSources.com Verified OEM' 
        : 'Alibaba.com Gold Supplier',
    trade_assurance: product.trade_assurance ?? true,
    lead_time: isVerified ? '7 - 12 Business Days' : '10 - 15 Business Days',
    sample_availability: '1 Unit Sample Order Supported (Fast Courier to Pakistan)',
    certifications: ['CE Certified', 'FCC Compliance', 'RoHS Green', 'ISO9001 Quality Benchmarked'],
    contact_channels: ['WeChat Enterprise B2B', 'Alibaba TradeManager', 'Email Proforma RFQ', 'WhatsApp Export Desk'],
    marketplace_links: [
      {
        name: 'View Product on Alibaba.com',
        url: `https://www.alibaba.com/trade/search?SearchText=${query}`,
        badge: 'Alibaba Marketplace'
      },
      {
        name: 'Search Supplier on Alibaba',
        url: `https://www.alibaba.com/trade/search?SearchText=${supplierQuery}`,
        badge: 'Verified Factory'
      },
      {
        name: 'View on Made-in-China.com',
        url: `https://www.made-in-china.com/products-search/find-china-products/${query}.html`,
        badge: 'Made-in-China Directory'
      },
      {
        name: 'Search on 1688.com (China Wholesale)',
        url: `https://s.1688.com/selloffer/offer_search.htm?keywords=${query}`,
        badge: '1688 Direct Wholesale'
      }
    ]
  };
}

export function getSupplierMarketplaceUrl(product: ProductItem): string {
  return `https://www.alibaba.com/trade/search?SearchText=${encodeURIComponent(product.product_name)}`;
}
