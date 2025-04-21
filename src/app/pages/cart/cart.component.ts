import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  total: number = 0;
  
  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
      this.total = this.cartService.getTotal();
    });
  }

  updateQuantity(index: number, quantity: number): void {
    this.cartService.updateQuantity(index, quantity);
  }

  removeItem(index: number): void {
    this.cartService.removeItem(index);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  checkout(): void {
    this.router.navigate(['/checkout']);
  }
} 