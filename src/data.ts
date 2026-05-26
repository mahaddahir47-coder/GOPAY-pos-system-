import { Product } from './types';

export const PREDEFINED_PRODUCTS: Product[] = [
  // Mains Category (Margherita Pizza, Cheeseburger, Grilled Chicken, Pasta Alfredo)
  {
    id: 'm1',
    name: 'Margherita Pizza',
    price: 12.50,
    category: 'mains',
    iconName: 'Flame',
    colorClass: 'bg-orange-950/40 text-orange-400 border-orange-550/30',
    imageUrl: 'https://images.unsplash.com/photo-1601924582970-d790453fd982?auto=format&fit=crop&w=350&h=350&q=80',
  },
  {
    id: 'm2',
    name: 'Cheeseburger',
    price: 11.00,
    category: 'mains',
    iconName: 'Beef',
    colorClass: 'bg-amber-950/40 text-amber-400 border-amber-550/30',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=350&h=350&q=80',
  },
  {
    id: 'm3',
    name: 'Grilled Chicken',
    price: 13.50,
    category: 'mains',
    iconName: 'CookingPot',
    colorClass: 'bg-rose-950/40 text-rose-400 border-rose-550/30',
    imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=350&h=350&q=80',
  },
  {
    id: 'm4',
    name: 'Pasta Alfredo',
    price: 11.50,
    category: 'mains',
    iconName: 'ChefHat',
    colorClass: 'bg-yellow-950/40 text-yellow-400 border-yellow-550/30',
    imageUrl: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=350&h=350&q=80',
  },

  // Starters Category (Caesar Salad, Tomato Soup)
  {
    id: 's1',
    name: 'Caesar Salad',
    price: 7.50,
    category: 'starters',
    iconName: 'Salad',
    colorClass: 'bg-emerald-950/40 text-emerald-400 border-emerald-550/30',
    imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=350&h=350&q=80',
  },
  {
    id: 's2',
    name: 'Tomato Soup',
    price: 5.00,
    category: 'starters',
    iconName: 'Soup',
    colorClass: 'bg-red-950/40 text-red-400 border-red-550/30',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=350&h=350&q=80',
  },

  // Sides Category (Garlic Bread, French Fries)
  {
    id: 'd1',
    name: 'Garlic Bread',
    price: 4.00,
    category: 'sides',
    iconName: 'Cookie',
    colorClass: 'bg-amber-950/40 text-amber-300 border-amber-550/20',
    imageUrl: 'https://images.unsplash.com/photo-1573145959957-619f71b9c9df?auto=format&fit=crop&w=350&h=350&q=80',
  },
  {
    id: 'd2',
    name: 'French Fries',
    price: 4.00,
    category: 'sides',
    iconName: 'Grid',
    colorClass: 'bg-stone-900 text-stone-300 border-stone-550/30',
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=350&h=350&q=80',
  },

  // Beverages Category (Lemonade, Iced Tea, Coke)
  {
    id: 'b1',
    name: 'Lemonade',
    price: 3.00,
    category: 'beverages',
    iconName: 'CupSoda',
    colorClass: 'bg-lime-950/40 text-lime-400 border-lime-550/30',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=350&h=350&q=80',
  },
  {
    id: 'b2',
    name: 'Iced Tea',
    price: 3.00,
    category: 'beverages',
    iconName: 'GlassWater',
    colorClass: 'bg-sky-950/40 text-sky-400 border-sky-550/30',
    imageUrl: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=350&h=350&q=80',
  },
  {
    id: 'b3',
    name: 'Coke',
    price: 2.50,
    category: 'beverages',
    iconName: 'CupSoda',
    colorClass: 'bg-red-955/40 text-red-400 border-red-550/25',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=350&h=350&q=80',
  },

  // Desserts Category (Chocolate Cake)
  {
    id: 'ds1',
    name: 'Chocolate Cake',
    price: 6.00,
    category: 'desserts',
    iconName: 'Cake',
    colorClass: 'bg-pink-950/40 text-pink-400 border-pink-550/30',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=350&h=350&q=80',
  },
];
