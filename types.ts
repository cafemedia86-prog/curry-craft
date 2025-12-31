export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isVeg: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface Review {
  id: string;
  userId: string;
  username: string; // We might need to join profiles
  rating: number;
  comment: string;
  createdAt: string;
}

export interface DishFilter {
  type: 'all' | 'veg' | 'non-veg';
  sortBy: 'popularity' | 'priceLow' | 'priceHigh' | 'rating';
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Category {
  id: string;
  label: string;
}
