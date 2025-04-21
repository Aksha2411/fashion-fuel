import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../models/product.model';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
   private products: Product[] = [
    {
      id: '1',
      name: 'Men\'s Classic Fit T-Shirt',
      description: 'A comfortable everyday t-shirt made from 100% cotton with a classic fit.',
      price: 190.99,
      category: 'men',
      subcategory: 't-shirts',
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'White', 'Navy', 'Gray'],
      inStock: true,
      rating: 4.5,
      reviews: [],
      featured: true
    },
    {
      id: '2',
      name: 'Men\'s Slim Fit Jeans',
      description: 'Modern slim fit jeans with stretch for comfort and mobility.',
      price: 490.99,
      category: 'men',
      subcategory: 'jeans',
      imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      sizes: ['30x30', '32x32', '34x34', '36x36'],
      colors: ['Blue', 'Black', 'Gray'],
      inStock: true,
      rating: 4.2,
      reviews: []
    },
    {
      id: '3',
      name: 'Men\'s Casual Button-Down Shirt',
      description: 'A versatile button-down shirt perfect for casual and semi-formal occasions.',
      price: 890.99,
      category: 'men',
      subcategory: 'shirts',
      imageUrl: 'https://assets.myntassets.com/f_webp,h_560,q_90,w_420/v1/assets/images/26136620/2023/11/30/33ae027a-a322-4577-96d8-7915bd2b97ce1701321971547HERENOWMenMaroonSlimFitStripedCasualShirt6.jpg',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['White', 'Blue', 'Black', 'Striped'],
      inStock: true,
      rating: 4.7,
      reviews: [],
      discount: 10
    },
    {
      id: '4',
      name: 'Men\'s Hooded Sweatshirt',
      description: 'A warm and comfortable hooded sweatshirt for casual wear.',
      price: 340.99,
      category: 'men',
      subcategory: 'sweatshirts',
      imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Gray', 'Black', 'Navy'],
      inStock: true,
      rating: 4.4,
      reviews: []
    },
    {
      id: '5',
      name: 'Men\'s Chino Pants',
      description: 'Classic chino pants made from soft cotton twill with a straight leg fit.',
      price: 440.99,
      category: 'men',
      subcategory: 'pants',
      imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      sizes: ['30x30', '32x32', '34x34', '36x36'],
      colors: ['Khaki', 'Navy', 'Olive', 'Black'],
      inStock: true,
      rating: 4.3,
      reviews: [],
      featured: true
    },
    {
      id: '6',
      name: 'Women\'s Floral Sundress',
      description: 'A light and airy sundress with a beautiful floral pattern.',
      price: 440.99,
      category: 'women',
      subcategory: 'dresses',
      imageUrl: 'https://images.unsplash.com/photo-1494578379344-d6c710782a3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['Floral Blue', 'Floral Pink'],
      inStock: true,
      rating: 4.8,
      reviews: [],
      featured: true
    },
    {
      id: '7',
      name: 'Women\'s Skinny Jeans',
      description: 'Modern skinny jeans with a high-rise waist and stretchy fabric for comfort.',
      price: 490.99,
      category: 'women',
      subcategory: 'jeans',
      imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      sizes: ['24', '26', '28', '30', '32'],
      colors: ['Blue', 'Black', 'Light Wash'],
      inStock: true,
      rating: 4.6,
      reviews: []
    },
    {
      id: '8',
      name: 'Women\'s Blouse',
      description: 'A lightweight blouse with a relaxed fit, perfect for office or casual wear.',
      price: 290.99,
      category: 'women',
      subcategory: 'tops',
      imageUrl: 'https://assets.myntassets.com/h_720,q_90,w_540/v1/assets/images/2025/FEBRUARY/3/Hsj2t78a_de8c93a17f1148dda38318c55dca76ad.jpg',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['White', 'Black', 'Pink', 'Blue'],
      inStock: true,
      rating: 4.4,
      reviews: [],
      discount: 15
    },
    {
      id: '9',
      name: 'Women\'s Cardigan',
      description: 'A soft, lightweight cardigan perfect for layering.',
      price: 390.99,
      category: 'women',
      subcategory: 'sweaters',
      imageUrl: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      sizes: ['S', 'M', 'L'],
      colors: ['Gray', 'Black', 'Beige', 'Navy'],
      inStock: true,
      rating: 4.5,
      reviews: []
    },
    {
      id: '10',
      name: 'Women\'s Pencil Skirt',
      description: 'A classic pencil skirt for a professional look with a comfortable stretch.',
      price: 340.99,
      category: 'women',
      subcategory: 'skirts',
      imageUrl: 'https://assets.myntassets.com/f_webp,h_560,q_90,w_420/v1/assets/images/19469988/2022/8/11/0d157a59-eaa6-4394-94c8-269c1bde85bd1660203387269ADDYVEROWomenSolidTrumpetBlackSkirt1.jpg',
      sizes: ['0', '2', '4', '6', '8', '10'],
      colors: ['Black', 'Navy', 'Gray'],
      inStock: true,
      rating: 4.2,
      reviews: [],
      featured: true
    },
    {
      id: '11',
      name: 'Women\'s Pencil Skirt',
      description: 'A classic pencil skirt for a professional look with a comfortable stretch.',
      price: 340.99,
      category: 'women',
      subcategory: 'skirts',
      imageUrl: 'https://assets.myntassets.com/f_webp,h_560,q_90,w_420/v1/assets/images/19469988/2022/8/11/0d157a59-eaa6-4394-94c8-269c1bde85bd1660203387269ADDYVEROWomenSolidTrumpetBlackSkirt1.jpg',
      sizes: ['0', '2', '4', '6', '8', '10'],
      colors: ['Black', 'Navy', 'Gray'],
      inStock: true,
      rating: 4.2,
      reviews: [],
      featured: true
    }
  ];

  constructor(private http: HttpClient) { }

  getAllProducts(): Observable<Product[]> {
    return of(this.products);
  }

  getProductById(id: string): Observable<Product | undefined> {
    return of(this.products.find(product => product.id === id));
  }

  getProductsByCategory(category: 'men' | 'women'): Observable<Product[]> {
    return of(this.products.filter(product => product.category === category));
  }

  getFeaturedProducts(): Observable<Product[]> {
    return of(this.products.filter(product => product.featured));
  }

  searchProducts(term: string): Observable<Product[]> {
    term = term.toLowerCase();
    return of(this.products.filter(product => 
      product.name.toLowerCase().includes(term) || 
      product.description.toLowerCase().includes(term) ||
      product.subcategory.toLowerCase().includes(term)
    ));
  }


  // getFakeProducts(): Observable<Product[]> {
  //   return of(this.products);
  // }

  getProductsFromAPI(): Observable<Product[]> {
    return this.http.get<any[]>('https://fakestoreapi.com/products')
      .pipe(
        map(apiProducts => apiProducts.map(item => ({
          id: item.id.toString(),
          name: item.title,
          description: item.description,
          price: item.price,
          category: this.mapCategory(item.category),
          subcategory: item.category,
          imageUrl: item.image,
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['Black', 'White'],
          inStock: true,
          rating: item.rating.rate,
          reviews: [],
          featured: item.rating.rate > 4
        })))
      );
  }

  private mapCategory(apiCategory: string): 'men' | 'women' {
    if (apiCategory.includes('men')) {
      return 'men';
    } else if (apiCategory.includes('women')) {
      return 'women';
    }
    // Default category
    return 'men';
  }
} 