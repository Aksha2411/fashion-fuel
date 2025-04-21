import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, NgClass, TitleCasePipe, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, TitleCasePipe, DatePipe],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined;
  quantity: number = 1;
  selectedSize: string = '';
  selectedColor: string = '';
  isLoading: boolean = true;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  loadProduct(id: string): void {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe(product => {
      this.product = product;
      if (product) {
        // Set default selections
        this.selectedSize = product.sizes[0];
        this.selectedColor = product.colors[0];
      }
      this.isLoading = false;
    });
  }

  getDiscountedPrice(): number {
    if (this.product?.discount) {
      return this.product.price * (1 - this.product.discount / 100);
    }
    return this.product?.price ?? 0;
  }

  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (this.product && this.selectedSize && this.selectedColor) {
      this.cartService.addToCart(this.product, this.quantity, this.selectedSize, this.selectedColor);
      // Show toast or notification
      this.router.navigate(['/cart']);
    }
  }
} 