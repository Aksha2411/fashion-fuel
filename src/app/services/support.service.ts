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
import { Order } from './order.service';

export interface Message {
  name?: string;
  email: string;
  orderNumber: string;
  subject: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SupportService {
  
  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) { }


  // Ticket raise

  ticketRaise(message: Message): Observable<string> {
    const messagesRef = collection(this.firestore, 'tickets');
    const now = new Date();

    const newTicket = {
      ...message,
      createdAt: now,
      updatedAt: now
    };

    return from(addDoc(messagesRef, newTicket)).pipe(
      map(docRef => docRef.id)
    );
  }

 
} 