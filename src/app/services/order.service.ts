import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp
} from '@angular/fire/firestore';
import { Observable, from, map, catchError, of } from 'rxjs';
import { AuthService } from '../pages/auth/auth.service';

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  imageUrl: string;
}

export interface Order {
  id?: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  
  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) { }

  // Create a new order
  createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Observable<string> {
    const ordersRef = collection(this.firestore, 'orders');
    const now = new Date();
    
    const newOrder = {
      ...orderData,
      createdAt: now,
      updatedAt: now
    };
    
    return from(addDoc(ordersRef, newOrder)).pipe(
      map(docRef => docRef.id)
    );
  }

  // Get all orders for the current user
  getUserOrders(): Observable<Order[]> {
    return new Observable<Order[]>(observer => {
      // Get the current user ID
      const userSub = this.authService.user$.subscribe(user => {
        if (!user || !user.uid) {
          observer.next([]);
          observer.complete();
          return;
        }
        
        const ordersRef = collection(this.firestore, 'orders');
        const userOrdersQuery = query(ordersRef, where('userId', '==', user.uid));
        
        // Fetch orders
        getDocs(userOrdersQuery)
          .then(snapshot => {
            const orders = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                createdAt: this.convertTimestamp(data['createdAt']),
                updatedAt: this.convertTimestamp(data['updatedAt'])
              } as Order;
            });
            
            // Sort by createdAt descending
            orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            
            observer.next(orders);
            observer.complete();
          })
          .catch(error => {
            console.error('Error fetching orders:', error);
            observer.error('Failed to load orders');
          });
      });
      
      // Clean up subscription when observable is unsubscribed
      return () => userSub.unsubscribe();
    });
  }
  
  // Helper method to convert Firestore timestamp to Date
  private convertTimestamp(timestamp: any): Date {
    if (!timestamp) return new Date();
    
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    } else if (timestamp instanceof Date) {
      return timestamp;
    } else if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    
    return new Date();
  }

  // Get a specific order by ID
  getOrderById(orderId: string): Observable<Order | null> {
    const orderRef = doc(this.firestore, 'orders', orderId);
    
    return from(getDoc(orderRef)).pipe(
      map(doc => {
        if (!doc.exists()) return null;
        
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: this.convertTimestamp(data['createdAt']),
          updatedAt: this.convertTimestamp(data['updatedAt'])
        } as Order;
      }),
      catchError(() => of(null))
    );
  }

  // Cancel an order
  cancelOrder(orderId: string): Observable<void> {
    const orderRef = doc(this.firestore, 'orders', orderId);
    return from(updateDoc(orderRef, {
      status: 'cancelled',
      updatedAt: new Date()
    }));
  }
} 