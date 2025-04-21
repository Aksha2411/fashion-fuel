import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, NgClass, TitleCasePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, RouterLink, TitleCasePipe, ProductCardComponent],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  category: string | null = null;
  searchTerm: string = '';
  sortBy: string = 'featured';
  priceRange: [number, number] = [0, 10000];
  isLoading: boolean = true;
  
  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.category = params.get('category');
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    
    if (this.category) {
      this.productService.getProductsByCategory(this.category as 'men' | 'women').subscribe(products => {
        this.products = products;
        this.applyFilters();
        this.isLoading = false;
      });
    } else {
      this.productService.getAllProducts().subscribe(products => {
        this.products = products;
        console.log(this.products);
        this.applyFilters();
        this.isLoading = false;
      });

      // this.productService.getAllProducts().subscribe(products => {
      //   this.products = products;
      //   console.log(this.products);
      //   this.applyFilters();
      //   this.isLoading = false;
      // });
    }
  }
  
  applyFilters(): void {
    let filtered = [...this.products];
    
    // Filter by search term
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(search) || 
        product.description.toLowerCase().includes(search) ||
        product.subcategory.toLowerCase().includes(search)
      );
    }
    
    // Filter by price range
    filtered = filtered.filter(product => {
      const price = product.discount 
        ? product.price * (1 - product.discount / 100) 
        : product.price;
      return price >= this.priceRange[0] && price <= this.priceRange[1];
    });
    
    // Apply sorting
    switch (this.sortBy) {
      case 'priceLow':
        filtered.sort((a, b) => {
          const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
          const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
          return priceA - priceB;
        });
        break;
      case 'priceHigh':
        filtered.sort((a, b) => {
          const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
          const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
          return priceB - priceA;
        });
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // In a real app, we'd sort by date added
        break;
      case 'featured':
      default:
        // Featured items first (or in a real app, a specific field for sorting)
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }
    
    this.filteredProducts = filtered;
  }
  
  onSearch(): void {
    this.applyFilters();
  }
  
  onSortChange(event: Event): void {
    this.sortBy = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }
  
  onPriceRangeChange(range: [number, number]): void {
    this.priceRange = range;
    this.applyFilters();
  }
  
  onRangeInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.onPriceRangeChange([this.priceRange[0], +target.value]);
    }
  }
  
  clearFilters(): void {
    this.searchTerm = '';
    this.sortBy = 'featured';
    this.priceRange = [0, 10000];
    this.applyFilters();
  }
} 