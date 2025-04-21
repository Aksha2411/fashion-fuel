import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, NgFor, TitleCasePipe } from '@angular/common';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [NgIf, NgFor, TitleCasePipe],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {
  @Input() product!: Product;
  selectedSize: string = '';
  selectedColor: string = '';
  
  constructor(
    private router: Router,
    private cartService: CartService
  ) {}

  navigateToDetail(): void {
    this.router.navigate(['/product', this.product.id]);
  }

  addToCart(): void {
    if (this.selectedSize && this.selectedColor) {
      this.cartService.addToCart(this.product, 1, this.selectedSize, this.selectedColor);
    } else {
      // Default to first size and color if not selected
      this.selectedSize = this.product.sizes[0];
      this.selectedColor = this.product.colors[0];
      this.cartService.addToCart(this.product, 1, this.selectedSize, this.selectedColor);
    }
  }

  getDiscountedPrice(): number {
    if (this.product.discount) {
      return this.product.price * (1 - this.product.discount / 100);
    }
    return this.product.price;
  }
} 