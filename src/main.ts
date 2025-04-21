import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

// Firebase imports
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

// Routes
import { HomeComponent } from './app/pages/home/home.component';
import { ProductsComponent } from './app/pages/products/products.component';
import { ProductDetailComponent } from './app/pages/product-detail/product-detail.component';
import { CartComponent } from './app/pages/cart/cart.component';
import { CheckoutComponent } from './app/pages/checkout/checkout.component';
import { AUTH_ROUTES } from './app/pages/auth/auth.routes';
import { publicGuard } from './app/guards/public.guard';
import { privateGuard } from './app/guards/private.guard';

// const routes: Routes = [
//   { path: '', component: HomeComponent },
//   { path: 'products', component: ProductsComponent },
//   { path: 'products/:category', component: ProductsComponent },
//   { path: 'product/:id', component: ProductDetailComponent },
//   { path: 'cart', component: CartComponent },
//   { path: 'checkout', component: CheckoutComponent },
//   { path: 'auth', children: AUTH_ROUTES },
//   { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
//   { path: 'register', redirectTo: 'auth/register', pathMatch: 'full' },
//   { path: '**', redirectTo: '' }
// ];
const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./app/pages/home/home.component').then(m => m.HomeComponent) ,
    
  },
  { 
    path: 'products', 
    loadComponent: () => import('./app/pages/products/products.component').then(m => m.ProductsComponent) ,
    
  },
  { 
    path: 'products/:category', 
    loadComponent: () => import('./app/pages/products/products.component').then(m => m.ProductsComponent) ,
   
  },
  { 
    path: 'product/:id', 
    loadComponent: () => import('./app/pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
    
  },
  { 
    path: 'cart', 
    loadComponent: () => import('./app/pages/cart/cart.component').then(m => m.CartComponent),
    canActivate: [privateGuard]
  },
  { 
    path: 'checkout', 
    loadComponent: () => import('./app/pages/checkout/checkout.component').then(m => m.CheckoutComponent), 
    canActivate: [privateGuard]
  },
  { 
    path: 'profile', 
    loadComponent: () => import('./app/pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [privateGuard]
  },
  { 
    path: 'orders', 
    loadComponent: () => import('./app/pages/orders/orders.component').then(m => m.OrdersComponent),
    canActivate: [privateGuard]
  },
  { 
    path: 'support', 
    loadComponent: () => import('./app/pages/support/support.component').then(m => m.SupportComponent)
  },
  { 
    path: 'auth', 
    loadChildren: () => import('./app/pages/auth/auth.routes').then(m => m.AUTH_ROUTES),
    canActivate: [publicGuard]
  },
  // { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  // { path: 'register', redirectTo: 'auth/register', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage())
  ]
}).catch(err => console.error(err)); 