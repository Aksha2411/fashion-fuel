import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../pages/auth/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [ 
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    AsyncPipe,
    RouterLink,
    NgClass,
    NgIf,
    MatTooltipModule],
})
export class HeaderComponent implements OnInit {
  cartItemCount = 0;
  isMenuOpen = false;
  
  authService = inject(AuthService);
  router = inject(Router);
  cartService = inject(CartService);

  ngOnInit(): void {
    this.cartService.getCart().subscribe(items => {
      this.cartItemCount = this.cartService.getItemCount();
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateToCart(): void {
    this.router.navigate(['/cart']);
    this.isMenuOpen = false;
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
    this.isMenuOpen = false;
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      this.router.navigateByUrl('/auth/login');
      this.isMenuOpen = false;
    } catch (error) {
      console.error('Logout failed', error);
    }
  }
} 