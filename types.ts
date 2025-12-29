export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isVeg: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Category {
  id: string;
  label: string;
}
