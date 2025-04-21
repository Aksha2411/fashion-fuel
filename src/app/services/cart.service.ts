import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  
  constructor() {
    // Load cart from localStorage if available
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
      this.cartSubject.next(this.cartItems);
    }
  }

  getCart(): Observable<CartItem[]> {
    return this.cartSubject.asObservable();
  }

  addToCart(product: Product, quantity: number = 1, size: string, color: string): void {
    const existingItem = this.cartItems.find(
      item => item.product.id === product.id && item.size === size && item.color === color
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cartItems.push({ product, quantity, size, color });
    }

    this.updateCart();
  }

  updateQuantity(itemIndex: number, quantity: number): void {
    if (itemIndex >= 0 && itemIndex < this.cartItems.length) {
      this.cartItems[itemIndex].quantity = quantity;
      this.updateCart();
    }
  }

  removeItem(itemIndex: number): void {
    if (itemIndex >= 0 && itemIndex < this.cartItems.length) {
      this.cartItems.splice(itemIndex, 1);
      this.updateCart();
    }
  }

  clearCart(): void {
    this.cartItems = [];
    this.updateCart();
  }

  getTotal(): number {
    return this.cartItems.reduce((total, item) => {
      const price = item.product.discount
        ? item.product.price * (1 - item.product.discount / 100)
        : item.product.price;
      return total + price * item.quantity;
    }, 0);
  }

  getItemCount(): number {
    return this.cartItems.reduce((count, item) => count + item.quantity, 0);
  }

  private updateCart(): void {
    this.cartSubject.next([...this.cartItems]);
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }
} 