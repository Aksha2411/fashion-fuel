import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  isLoading: boolean = true;

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.productService.getFeaturedProducts().subscribe(products => {
      this.featuredProducts = products;
      this.isLoading = false;
    });
  }
} 