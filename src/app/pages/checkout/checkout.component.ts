import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NgIf, NgFor, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../services/cart.service';
import { AuthService } from '../auth/auth.service';
import { take, tap } from 'rxjs/operators';
import { OrderService } from 'src/app/services/order.service';
import { ToastService } from 'src/app/components/toast/toast.service';
import { Subscription } from 'rxjs';
import { UserProfileService, UserAddress } from 'src/app/services/user-profile.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  total: number = 0;
  
  paymentMethod: string = 'credit';
  orderPlaced: boolean = false;
  cartService = inject(CartService);
  authService = inject(AuthService);
  _fb = inject(FormBuilder);
  router = inject(Router);
  orderService = inject(OrderService);
  toast = inject(ToastService);
  userProfileService = inject(UserProfileService);
  
  // New properties for address handling
  savedAddresses: UserAddress[] = [];
  selectedAddressIndex: number | null = null;
  loadingAddresses = true;
  
  private subscriptions: Subscription = new Subscription();
  
  checkoutForm: FormGroup = this._fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    address: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    zipCode: ['', Validators.required],
    cardName: ['', Validators.required],
    cardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
    expMonth: ['', Validators.required],
    expYear: ['', Validators.required],
    cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]]
  });
  
  ngOnInit(): void {
    const cartSub = this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
      this.total = this.cartService.getTotal();
      
      if (this.cartItems.length === 0) {
        this.router.navigate(['/cart']);
      }
    });
    
    this.subscriptions.add(cartSub);
    
    // Load user's saved addresses
    this.loadSavedAddresses();
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadSavedAddresses(): void {
    this.loadingAddresses = true;
    const profileSub = this.userProfileService.getUserProfile().subscribe({
      next: (profile) => {
        if (profile) {
          // Set the email in the form from user profile
          if (profile.email) {
            this.checkoutForm.patchValue({
              email: profile.email
            });
          }
          
          if (profile.addresses && profile.addresses.length > 0) {
            this.savedAddresses = profile.addresses;
            
            // Select default address if available
            if (profile.defaultAddressIndex !== undefined) {
              this.selectAddress(profile.defaultAddressIndex);
            }
          }
        }
        this.loadingAddresses = false;
      },
      error: (error) => {
        console.error('Error loading addresses:', error);
        this.loadingAddresses = false;
      }
    });
    
    this.subscriptions.add(profileSub);
  }
  
  selectAddress(index: number): void {
    this.selectedAddressIndex = index;
    const address = this.savedAddresses[index];
    
    if (address) {
      // Split the name into first and last names
      const nameParts = address.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Get the current email value to preserve it
      const currentEmail = this.checkoutForm.get('email')?.value;
      
      // Populate the form with the address details
      this.checkoutForm.patchValue({
        firstName,
        lastName,
        email: currentEmail, // Keep the current email value
        address: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode
      });
    }
  }

  onPaymentMethodChange(method: string): void {
    this.paymentMethod = method;
  }

  placeOrder(): void {
    if (this.checkoutForm.valid) {
      // In a real app, we would process the order through a backend API
      // Get the current user ID using the take(1) operator
      this.authService.user$.pipe(take(1)).subscribe(user => {
        const orderData = {
          userId: user?.uid || '', // Get logged in user ID
          items: this.cartItems.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            price: item.product.discount 
              ? item.product.price * (1 - item.product.discount / 100)
              : item.product.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            imageUrl: item.product.imageUrl
          })),
          totalAmount: this.total,
          shippingAddress: {
            name: `${this.checkoutForm.get('firstName')?.value} ${this.checkoutForm.get('lastName')?.value}`,
            street: this.checkoutForm.get('address')?.value,
            city: this.checkoutForm.get('city')?.value,
            state: this.checkoutForm.get('state')?.value,
            zipCode: this.checkoutForm.get('zipCode')?.value,
            country: 'IN' // Hardcoded for now, could be made dynamic
          },
          paymentMethod: this.paymentMethod,
          status: 'processing' as 'processing' | 'pending' | 'shipped' | 'delivered' | 'cancelled'
        };

        const orderSub = this.orderService.createOrder(orderData).subscribe({
          next: (orderId) => {
            console.log('Order created successfully with ID:', orderId);
            this.toast.success('Order placed successfully!', {
              position: 'top-center'
            });
            this.orderPlaced = true;
            this.cartService.clearCart();
            
            // Reset form
            this.checkoutForm.reset();
            this.router.navigate(['/orders']);
          },
          error: (error) => {
            console.error('Error creating order:', error);
            this.toast.error('Failed to place order. Please try again.');
          }
        });
        
        this.subscriptions.add(orderSub);
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.checkoutForm.controls).forEach(key => {
        const control = this.checkoutForm.get(key);
        control?.markAsTouched();
      });
    }
  }
} 