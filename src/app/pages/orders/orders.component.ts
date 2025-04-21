import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgIf, NgFor, DatePipe, CurrencyPipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';
import { Subscription } from 'rxjs';
import { ToastService } from 'src/app/components/toast/toast.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, CurrencyPipe, RouterLink, CommonModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  
  orderService = inject(OrderService);
  toast = inject(ToastService);
  
  private subscriptions = new Subscription();
  
  ngOnInit(): void {
    // Check for successful checkout redirect
    if (history.state.showSuccessMessage) {
      this.toast.success('Order placed successfully!');
    }
    
    this.loadOrders();
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  
  loadOrders(): void {
    this.isLoading = true;
    this.error = null;
    
    const orderSub = this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = typeof err === 'string' ? err : 'Failed to load your orders';
        this.isLoading = false;
      }
    });
    
    this.subscriptions.add(orderSub);
  }
  
  getOrderStatusClass(status: Order['status']): string {
    const statusClasses = {
      'processing': 'bg-info',
      'pending': 'bg-warning',
      'shipped': 'bg-primary',
      'delivered': 'bg-success',
      'cancelled': 'bg-danger'
    };
    
    return statusClasses[status] || 'bg-secondary';
  }
  
  cancelOrder(orderId: string): void {
    if (!orderId || !confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    
    const cancelSub = this.orderService.cancelOrder(orderId).subscribe({
      next: () => {
        this.toast.success('Order cancelled successfully!');
        this.loadOrders();
      },
      error: () => {
        this.toast.error('Failed to cancel order. Please try again.');
      }
    });
    
    this.subscriptions.add(cancelSub);
  }
} 