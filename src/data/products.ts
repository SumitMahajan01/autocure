export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  profiles?: { display_name: string | null } | null;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  category: "exterior" | "interior" | "tools" | "kits";
  description: string;
  features: string[];
  image: string;
  // Extended fields
  warranty?: string;
  shipping_info?: string;
  return_policy?: string;
  return_days?: number;
  specifications?: Record<string, string>;
  weight?: string;
  dimensions?: string;
  sku?: string;
  brand?: string;
  tags?: string[];
  discount_percent?: number;
  original_price?: number | null;
  review_list?: Review[];
}

export const products: Product[] = [
  {
    id: "1",
    name: "NanoShield Ceramic Coating",
    price: 89.99,
    rating: 4.9,
    reviews: 342,
    category: "exterior",
    features: ["5-Year Protection", "Self-Healing", "Hydrophobic", "UV Resistant"],
    description: "Advanced nano-ceramic coating that provides up to 5 years of protection. Self-healing properties repair minor scratches with heat activation.",
    image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600&h=600&fit=crop",
    warranty: "5 Year Manufacturer Warranty",
    shipping_info: "Free shipping on orders over $50. Ships in 1-2 business days.",
    return_policy: "Hassle-free returns",
    return_days: 30,
    specifications: {
      "Volume": "50ml",
      "Coverage": "Up to 2 vehicles",
      "Durability": "5 years",
      "Application": "Professional/Advanced DIY",
      "Cure Time": "24-48 hours"
    },
    weight: "0.3 lbs",
    dimensions: "3 x 2 x 1.5 inches",
    sku: "AC-NSCC-50",
    brand: "AutoCure",
    tags: ["premium", "best-seller", "ceramic"],
    discount_percent: 0,
    original_price: null,
    review_list: [
      {
        id: "r1",
        rating: 5,
        comment: "Absolutely incredible product! My car looks like it just came from the showroom. The hydrophobic effect is amazing - water just beads right off.",
        created_at: "2026-02-15T00:00:00Z",
        user_id: "user1",
        profiles: { display_name: "Michael R." }
      },
      {
        id: "r2",
        rating: 5,
        comment: "Worth every penny. Application was straightforward and the results are stunning. 5 months in and still going strong!",
        created_at: "2026-01-28T00:00:00Z",
        user_id: "user2",
        profiles: { display_name: "Sarah K." }
      },
      {
        id: "r3",
        rating: 4,
        comment: "Great product but make sure you prep the surface properly. Took me about 4 hours total but the results speak for themselves.",
        created_at: "2026-01-10T00:00:00Z",
        user_id: "user3",
        profiles: { display_name: "David L." }
      }
    ]
  },
  {
    id: "2",
    name: "HyperFoam Car Shampoo",
    price: 29.99,
    rating: 4.7,
    reviews: 891,
    category: "exterior",
    features: ["pH Neutral", "Thick Foam", "1000ml", "Coating Safe"],
    description: "Ultra-thick foam formula that clings to surfaces for maximum cleaning power. pH balanced and safe for all coatings.",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=600&fit=crop",
    warranty: "1 Year Warranty",
    shipping_info: "Free shipping on orders over $50",
    return_policy: "Hassle-free returns",
    return_days: 30,
    specifications: {
      "Volume": "1000ml",
      "pH Level": "7.0 (Neutral)",
      "Dilution Ratio": "1:400",
      "Scent": "Fresh Citrus",
      "Safe For": "All paint types"
    },
    weight: "2.2 lbs",
    dimensions: "9 x 3 x 3 inches",
    sku: "AC-HFS-1L",
    brand: "AutoCure",
    tags: ["best-seller", "wash", "value"],
    discount_percent: 14,
    original_price: 34.99
  },
  {
    id: "3",
    name: "CrystalWax Pro Polish",
    price: 54.99,
    rating: 4.8,
    reviews: 567,
    category: "exterior",
    features: ["Mirror Finish", "3-Month Duration", "Easy Application", "Deep Gloss"],
    description: "Premium carnauba and synthetic hybrid wax that delivers a mirror-like finish with deep gloss enhancement.",
    image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&h=600&fit=crop",
    warranty: "1 Year Warranty",
    shipping_info: "Free shipping on orders over $50",
    return_policy: "Hassle-free returns",
    return_days: 30,
    specifications: {
      "Volume": "250ml",
      "Type": "Carnauba/Synthetic Hybrid",
      "Durability": "3 months",
      "Application": "Hand or DA polisher",
      "Finish": "Deep gloss"
    },
    weight: "0.6 lbs",
    dimensions: "4 x 2 x 2 inches",
    sku: "AC-CWP-250",
    brand: "AutoCure",
    tags: ["premium", "wax", "gloss"],
    discount_percent: 0,
    original_price: null
  },
  {
    id: "4",
    name: "UltraPlush Microfiber Set",
    price: 29.99,
    rating: 4.6,
    reviews: 1203,
    category: "tools",
    features: ["600 GSM", "Edgeless", "6-Pack", "Scratch-Free"],
    description: "Set of 6 premium 600 GSM microfiber towels. Edgeless design prevents scratching on all surfaces.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop",
    warranty: "1 Year Warranty",
    shipping_info: "Free shipping on orders over $50",
    return_policy: "Hassle-free returns",
    return_days: 30,
    specifications: {
      "GSM": "600",
      "Quantity": "6 towels",
      "Size": "16x16 inches",
      "Edge Type": "Edgeless ultrasonic cut",
      "Color": "Gray"
    },
    weight: "0.8 lbs",
    dimensions: "8 x 6 x 3 inches",
    sku: "AC-UPMF-6",
    brand: "AutoCure",
    tags: ["best-seller", "tools", "microfiber"],
    discount_percent: 0,
    original_price: null
  },
  {
    id: "5",
    name: "TireBlack Elite Cleaner",
    price: 24.99,
    rating: 4.5,
    reviews: 445,
    category: "exterior",
    features: ["Satin Finish", "UV Protection", "Long Lasting", "Non-Sling"],
    description: "Professional-grade tire cleaner and dressing that restores deep black finish with a satin sheen.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop",
    warranty: "1 Year Warranty",
    shipping_info: "Free shipping on orders over $50",
    return_policy: "Hassle-free returns",
    return_days: 30,
    specifications: {
      "Volume": "500ml",
      "Finish": "Satin",
      "Application": "Spray or applicator",
      "Drying Time": "10 minutes",
      "Durability": "2 weeks"
    },
    weight: "1.2 lbs",
    dimensions: "8 x 3 x 3 inches",
    sku: "AC-TBE-500",
    brand: "AutoCure",
    tags: ["tires", "dressing", "new"],
    discount_percent: 0,
    original_price: null
  },
  {
    id: "6",
    name: "CockpitCare Interior Detailer",
    price: 39.99,
    rating: 4.7,
    reviews: 678,
    category: "interior",
    features: ["Anti-Static", "UV Shield", "Fresh Scent", "All Surfaces"],
    description: "All-in-one interior cleaner and protectant. Anti-static formula repels dust and provides UV protection.",
    image: "https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=600&h=600&fit=crop",
    warranty: "1 Year Warranty",
    shipping_info: "Free shipping on orders over $50",
    return_policy: "Hassle-free returns",
    return_days: 30,
    specifications: {
      "Volume": "500ml",
      "Surfaces": "Dashboard, trim, screens",
      "Finish": "Matte/OEM",
      "Scent": "New Car",
      "Anti-Static": "Yes"
    },
    weight: "1.1 lbs",
    dimensions: "8 x 3 x 3 inches",
    sku: "AC-CCI-500",
    brand: "AutoCure",
    tags: ["interior", "dashboard", "new"],
    discount_percent: 0,
    original_price: null
  },
  {
    id: "7",
    name: "LeatherLux Conditioner",
    price: 44.99,
    rating: 4.8,
    reviews: 334,
    category: "interior",
    features: ["Deep Nourish", "Anti-Crack", "UV Filter", "Natural Scent"],
    description: "Premium leather conditioner that nourishes and protects. Prevents cracking and fading while restoring suppleness.",
    image: "https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=600&h=600&fit=crop",
    warranty: "1 Year Warranty",
    shipping_info: "Free shipping on orders over $50",
    return_policy: "Hassle-free returns",
    return_days: 30,
    specifications: {
      "Volume": "250ml",
      "Leather Types": "All automotive leather",
      "Finish": "Natural matte",
      "Scent": "Natural leather",
      "UV Protection": "Yes"
    },
    weight: "0.6 lbs",
    dimensions: "4 x 2 x 2 inches",
    sku: "AC-LLC-250",
    brand: "AutoCure",
    tags: ["premium", "leather", "interior"],
    discount_percent: 0,
    original_price: null
  },
  {
    id: "8",
    name: "ProDetail Ultimate Kit",
    price: 199.99,
    rating: 4.9,
    reviews: 156,
    category: "kits",
    features: ["12 Products", "Carry Case", "Guide Book", "Premium Quality"],
    description: "The complete detailing kit for enthusiasts. Includes shampoo, polish, wax, interior cleaner, microfiber towels, and applicators.",
    image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&h=600&fit=crop",
    warranty: "2 Year Warranty",
    shipping_info: "Free shipping on all kits",
    return_policy: "Hassle-free returns",
    return_days: 30,
    specifications: {
      "Products Included": "12",
      "Carry Case": "Yes, premium",
      "Guide Book": "Yes, 20 pages",
      "Skill Level": "Beginner to Pro",
      "Value Savings": "25% vs individual"
    },
    weight: "8.5 lbs",
    dimensions: "18 x 12 x 8 inches",
    sku: "AC-PDK-ULT",
    brand: "AutoCure",
    tags: ["premium", "kit", "best-seller", "value"],
    discount_percent: 0,
    original_price: null
  }
];

export const categories = [
  { id: "all", label: "All Products" },
  { id: "exterior", label: "Exterior Care" },
  { id: "interior", label: "Interior Care" },
  { id: "tools", label: "Detailing Tools" },
  { id: "kits", label: "Premium Kits" },
];
