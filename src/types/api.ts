export interface CategoryChild {
  id: number;
  name: string;
  slug: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  children: CategoryChild[];
  /** Set when fetching a single category (detail); used for subcategory filter when on a child page */
  parent_id?: number | null;
  parent_name?: string | null;
  parent_slug?: string | null;
}

export interface ProductCategory {
  slug: string;
  name: string;
  parent_name: string | null;
  parent_slug: string | null;
}

export interface ProductColor {
  id: number;
  name: string;
  image: string;
  order: number;
  is_active: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  category: ProductCategory;
  category_slug: string;
  regular_price: string;
  offer_price: string | null;
  current_price: string;
  has_offer: boolean;
  image: string | null;
  image2: string | null;
  image3: string | null;
  image4: string | null;
  stock: number;
  is_active: boolean;
  colors: ProductColor[];
  created_at: string;
  updated_at: string;
}

export interface BestSelling {
  id: number;
  product: Product;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Hot {
  id: number;
  product: Product;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  message: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrackingCode {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  hero_image: string | null;
  updated_at: string;
}

export interface HomepageData {
  products: Product[];
  best_selling: BestSelling[];
  hot: Hot[];
}

export interface CreateOrderData {
  customer_name: string;
  district: string;
  address: string;
  phone_number: string;
  product_id: number;
  product_size: string;
  quantity: number;
}

export interface CreateOrderProductItem {
  product_id: number;
  product_name: string;
  product_size: string;
  product_color: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  product_total: number;
}

export interface CreateMultiProductOrderData {
  customer_name: string;
  district: string;
  address: string;
  phone_number: string;
  products: CreateOrderProductItem[];
  product_total: number;
  delivery_charge: number;
  total_price: number;
}

export interface CreateSingleProductOrderData {
  customer_name: string;
  district: string;
  address: string;
  phone_number: string;
  product: CreateOrderProductItem;
  product_total: number;
  delivery_charge: number;
  total_price: number;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  total_amount: string;
  status: string;
  created_at: string;
}

export interface CartItem {
  id: number;
  product: Product;
  product_id: number;
  quantity: number;
  subtotal: string;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: number;
  session_key: string;
  items: CartItem[];
  total: string;
  item_count: number;
  created_at: string;
  updated_at: string;
}

export interface AddToCartData {
  product_id: number;
  quantity?: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

/** Derived section data for the homepage (computed from HomepageData on the server). */
export interface HomepageDerived {
  newDropsFeatured: Product | null;
  trendingFeatured: Product | null;
  hotProducts: Product[];
  comboProducts: Product[];
  coupleProducts: Product[];
  mensProducts: Product[];
  womensProducts: Product[];
  error: string | null;
}
