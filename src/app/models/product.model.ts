export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'men' | 'women';
  subcategory: string;
  imageUrl: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  rating: number;
  reviews: Review[];
  featured?: boolean;
  discount?: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
} 