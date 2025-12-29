import { MenuItem, Category } from './types';

export const CATEGORIES: Category[] = [
  { id: 'main-course', label: 'Main Course' },
  { id: 'paneer', label: 'Paneer Specialties' },
  { id: 'breads', label: 'Breads (Roti/Naan)' },
  { id: 'rice', label: 'Indian Rice' },
  { id: 'combos', label: 'Combos' },
  { id: 'parathas', label: 'Parathas' },
  { id: 'tandoori', label: 'Tandoori Starters' },
  { id: 'sides', label: 'Raita & Salad' },
  { id: 'sandwich', label: 'Sandwiches' },
  { id: 'drinks', label: 'Drinks' },
];

export const MENU_ITEMS: MenuItem[] = [
  // Main Course
  {
    id: 'm1',
    name: 'Dal Makhani',
    description: 'Slow-cooked black lentils in creamy butter and rich tomato gravy.',
    price: 299,
    category: 'main-course',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80'
  },
  {
    id: 'm2',
    name: 'Yellow Dal Tadka',
    description: 'Classic yellow lentils tempered with garlic, cumin, and desi ghee.',
    price: 299,
    category: 'main-course',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356f36?w=500&q=80'
  },
  {
    id: 'm3',
    name: 'Pindi Chhole',
    description: 'Traditional Punjabi chickpeas cooked in aromatic masala.',
    price: 299,
    category: 'main-course',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80'
  },
  {
    id: 'm4',
    name: 'Mattar Mushroom',
    description: 'Fresh peas and mushrooms in a lightly spiced onion-tomato gravy.',
    price: 299,
    category: 'main-course',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&q=80'
  },
  {
    id: 'm5',
    name: 'Mushroom Do Pyaza',
    description: 'Mushrooms tossed with double onions and flavorful masala.',
    price: 299,
    category: 'main-course',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80'
  },

  // Paneer
  {
    id: 'p1',
    name: 'Paneer Do Pyaza',
    description: 'Cottage cheese cubes cooked with onions and rich spices.',
    price: 299,
    category: 'paneer',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&q=80'
  },
  {
    id: 'p2',
    name: 'Mattar Paneer',
    description: 'Cottage cheese and green peas in a creamy tomato curry.',
    price: 299,
    category: 'paneer',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80'
  },
  {
    id: 'p3',
    name: 'Paneer Butter Masala',
    description: 'Paneer cubes in a buttery, mildly spiced tomato gravy.',
    price: 299,
    category: 'paneer',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1631452180539-96ace7d48117?w=500&q=80'
  },
  {
    id: 'p4',
    name: 'Paneer Lababdar',
    description: 'Paneer in a rich cashew-based gravy with subtle sweetness.',
    price: 299,
    category: 'paneer',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?w=500&q=80'
  },
  {
    id: 'p5',
    name: 'Kadhai Paneer',
    description: 'Paneer sautéed with bell peppers and aromatic kadhai spices.',
    price: 299,
    category: 'paneer',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1552590635-27c2c2128abf?w=500&q=80'
  },
  {
    id: 'p6',
    name: 'Palak Paneer',
    description: 'Cottage cheese cooked in smooth spinach gravy.',
    price: 299,
    category: 'paneer',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80'
  },
  {
    id: 'p7',
    name: 'Kadhai Soya Chaap',
    description: 'Marinated soya chaap pieces tossed in spicy kadhai sauce.',
    price: 299,
    category: 'paneer',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356f36?w=500&q=80'
  },
    {
    id: 'p8',
    name: 'Veg Kofta Curry',
    description: 'Vegetable dumplings in a creamy, spiced curry sauce.',
    price: 249,
    category: 'paneer',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1632207191677-14c8543eda1d?w=500&q=80'
  },

  // Rice
  {
    id: 'r1',
    name: 'Plain Rice',
    description: 'Long grain aromatic rice.',
    price: 119,
    category: 'rice',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=500&q=80'
  },
  {
    id: 'r2',
    name: 'Jeera Rice',
    description: 'Fragrant basmati rice tempered with cumin.',
    price: 139,
    category: 'rice',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=500&q=80'
  },
  {
    id: 'r3',
    name: 'Veg Pulao',
    description: 'Aromatic rice cooked with mixed vegetables and spices.',
    price: 209,
    category: 'rice',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80'
  },
  {
    id: 'r4',
    name: 'Veg Biryani',
    description: 'Aromatic rice cooked with mixed vegetables and spices.',
    price: 249, 
    category: 'rice',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&q=80'
  },

  // Breads
  {
    id: 'b1',
    name: 'Plain Roti',
    description: 'Whole wheat flatbread baked on tawa.',
    price: 20,
    category: 'breads',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80'
  },
  {
    id: 'b2',
    name: 'Butter Roti',
    description: 'Soft roti brushed with butter.',
    price: 25,
    category: 'breads',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&q=80'
  },
  {
    id: 'b3',
    name: 'Missi Roti',
    description: 'Gram flour roti with Indian spices.',
    price: 45,
    category: 'breads',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80'
  },
  {
    id: 'b4',
    name: 'Rumali Roti',
    description: 'Thin and soft roti cooked on upside tawa.',
    price: 55,
    category: 'breads',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80'
  },
  {
    id: 'b5',
    name: 'Butter Naan',
    description: 'Soft tandoor-baked flatbread.',
    price: 59,
    category: 'breads',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&q=80'
  },
  {
    id: 'b6',
    name: 'Garlic Naan',
    description: 'Naan topped with fresh garlic and herbs.',
    price: 79,
    category: 'breads',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&q=80'
  },
  {
    id: 'b7',
    name: 'Cheese Garlic Naan',
    description: 'Naan stuffed with cheese and garlic.',
    price: 85,
    category: 'breads',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80'
  },

  // Combos
  {
    id: 'c1',
    name: 'Chhole Chawal',
    description: 'Spicy chickpeas curry served with rice.',
    price: 159,
    category: 'combos',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=500&q=80'
  },
  {
    id: 'c2',
    name: 'Kadhi Chawal',
    description: 'Yogurt curry served with steamed rice.',
    price: 159,
    category: 'combos',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1606471191009-63994c53433b?w=500&q=80'
  },
  {
    id: 'c3',
    name: 'Dal Makhani Chawal',
    description: 'Creamy dal makhni served with steamed rice.',
    price: 199,
    category: 'combos',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80'
  },
  {
    id: 'c4',
    name: 'Shahi Paneer w/ Lachha Paratha',
    description: 'Royal paneer curry with flaky paratha.',
    price: 249,
    category: 'combos',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1631452180539-96ace7d48117?w=500&q=80'
  },

  // Parathas
  {
    id: 'pa1',
    name: 'Lachha Paratha',
    description: 'Layered flaky paratha with ghee.',
    price: 59,
    category: 'parathas',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=500&q=80'
  },
  {
    id: 'pa2',
    name: 'Pudina Paratha',
    description: 'Mint-flavored paratha with light spices.',
    price: 89,
    category: 'parathas',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&q=80'
  },
  {
    id: 'pa3',
    name: 'Aloo Paratha',
    description: 'Paratha stuffed with spicy mashed potatoes.',
    price: 99,
    category: 'parathas',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&q=80'
  },
  {
    id: 'pa4',
    name: 'Paneer Paratha',
    description: 'Paratha filled with seasoned paneer.',
    price: 119,
    category: 'parathas',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=500&q=80'
  },

  // Tandoori Starters
  {
    id: 't1',
    name: 'Hara Bhara Kabab',
    description: 'Spinach and peas patties shallow-fried till crisp.',
    price: 179,
    category: 'tandoori',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80'
  },
  {
    id: 't2',
    name: 'Paneer Tikka',
    description: 'Marinated paneer cubes grilled with capsicum and onion.',
    price: 229,
    category: 'tandoori',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&q=80'
  },
  {
    id: 't3',
    name: 'Dhai Kabab',
    description: 'Hung curd kebabs with soft and creamy texture.',
    price: 229,
    category: 'tandoori',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&q=80'
  },
  {
    id: 't4',
    name: 'Mushroom Tikka',
    description: 'Juicy mushrooms grilled with spiced marinade.',
    price: 229,
    category: 'tandoori',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&q=80'
  },
  {
    id: 't5',
    name: 'Tandoori Platter',
    description: 'Veg kabab, paneer tikka, soya chaap and hara bhara kabab.',
    price: 349,
    category: 'tandoori',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&q=80'
  },

  // Sides & Drinks
  {
    id: 's1',
    name: 'Plain Bundi Raita',
    description: 'Curd with besan bundi.',
    price: 79,
    category: 'sides',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=500&q=80'
  },
  {
    id: 'd1',
    name: 'Meethi Lassi',
    description: 'Thick, and creamy sweet butter milk.',
    price: 85,
    category: 'drinks',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=500&q=80'
  },
  {
    id: 'd2',
    name: 'Masala Chhaj',
    description: 'Thick, and creamy tangy, salt and peppered butter milk.',
    price: 85,
    category: 'drinks',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80'
  },

  // Sandwiches (New)
  {
    id: 'sw1',
    name: 'Veg Grilled Sandwich',
    description: 'Crispy grilled sandwich loaded with fresh vegetables and cheese.',
    price: 129,
    category: 'sandwich',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80'
  },
  {
    id: 'sw2',
    name: 'Paneer Tikka Sandwich',
    description: 'Spicy paneer tikka filling in toasted bread.',
    price: 159,
    category: 'sandwich',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1554433607-66b5efe9d304?w=500&q=80'
  },
  {
    id: 'sw3',
    name: 'Corn & Cheese Sandwich',
    description: 'Sweet corn and melting cheese sandwich.',
    price: 149,
    category: 'sandwich',
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80'
  }
];