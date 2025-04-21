import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc, 
  docData 
} from '@angular/fire/firestore';
import { Observable, from, of, map, catchError, switchMap, take } from 'rxjs';
import { AuthService } from '../pages/auth/auth.service';

export interface UserAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface UserProfile {
  uid: string;
  displayName?: string;
  name?: string;
  email?: string;
  photoURL?: string;
  phoneNumber?: string;
  addresses?: UserAddress[];
  defaultAddressIndex?: number;
}

export interface AddressUpdateResult {
  addresses: UserAddress[];
  defaultAddressIndex?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  getUserProfile(): Observable<UserProfile | null> {
    return this.authService.user$.pipe(
      switchMap(user => {
        if (!user) return of(null);
        
        const userRef = doc(this.firestore, `users/${user.uid}`);
        return docData(userRef, { idField: 'uid' }).pipe(
          map(data => {
            console.log('Raw Firebase user data:', data);
            // If no data or empty data, create basic profile with user's data from Auth
            if (!data) {
              console.log('No user data found, creating basic profile from Auth');
              const basicProfile: UserProfile = {
                uid: user.uid,
                displayName: user.displayName || '',
                name:user.displayName || '',
                email: user.email || '',
                photoURL: user.photoURL || '',
                addresses: []
              };
              
              // Create the profile in firestore
              setDoc(userRef, basicProfile).catch(err => 
                console.error('Error creating basic profile:', err)
              );
              
              return basicProfile;
            }
            
            // Ensure addresses field exists
            if (!('addresses' in data)) {
              return {
                ...(data || {}),
                displayName: (data as any)['displayName'] || user.displayName || '',
                email: (data as any)['email'] || user.email || '',
                addresses: []
              } as UserProfile;
            }
            
            return {
              ...data,
              displayName: (data as any)['displayName'] || user.displayName || ''
            } as UserProfile;
          }),
          catchError(error => {
            console.error('Error fetching user profile:', error);
            return of(null);
          })
        );
      })
    );
  }
  
  updateUserProfile(profile: Partial<UserProfile>): Observable<void> {
    return this.authService.user$.pipe(
      switchMap(user => {
        if (!user) return of(undefined);
        
        const userRef = doc(this.firestore, `users/${user.uid}`);
        return from(updateDoc(userRef, { ...profile }));
      })
    );
  }
  
  addAddress(address: UserAddress): Observable<AddressUpdateResult> {
    return this.authService.user$.pipe(
      take(1),
      switchMap(user => {
        if (!user) return of({ addresses: [] });
        
        // Get the user document reference directly instead of using getUserProfile
        const userRef = doc(this.firestore, `users/${user.uid}`);
        
        // First get the document once
        return from(getDoc(userRef)).pipe(
          map(docSnap => {
            const userData = docSnap.data() as UserProfile | undefined;
            
            // Create or update addresses array
            const addresses = userData?.addresses || [];
            const updatedAddresses = [...addresses, address];
            
            // If this is the first address, set it as default
            const defaultAddressIndex = addresses.length === 0 
              ? 0 
              : userData?.defaultAddressIndex;
              
            // Data to update
            const updateData = { 
              addresses: updatedAddresses,
              defaultAddressIndex
            };
            
            // Return as a nested observable to be flattened
            return from(updateDoc(userRef, updateData)).pipe(
              map(() => ({
                addresses: updatedAddresses,
                defaultAddressIndex
              }))
            );
          }),
          // Flatten the nested observable
          switchMap(result => result)
        );
      })
    );
  }
  
  updateAddress(index: number, address: UserAddress): Observable<void> {
    return this.authService.user$.pipe(
      take(1),
      switchMap(user => {
        if (!user) return of(undefined);
        
        // Get the user document reference directly
        const userRef = doc(this.firestore, `users/${user.uid}`);
        
        // First get the document once
        return from(getDoc(userRef)).pipe(
          switchMap(docSnap => {
            const userData = docSnap.data() as UserProfile | undefined;
            if (!userData || !userData.addresses || !userData.addresses[index]) {
              return of(undefined);
            }
            
            const updatedAddresses = [...userData.addresses];
            updatedAddresses[index] = address;
            
            return from(updateDoc(userRef, { addresses: updatedAddresses }));
          })
        );
      })
    );
  }
  
  deleteAddress(index: number): Observable<void> {
    return this.authService.user$.pipe(
      take(1),
      switchMap(user => {
        if (!user) return of(undefined);
        
        // Get the user document reference directly
        const userRef = doc(this.firestore, `users/${user.uid}`);
        
        // First get the document once
        return from(getDoc(userRef)).pipe(
          switchMap(docSnap => {
            const userData = docSnap.data() as UserProfile | undefined;
            if (!userData || !userData.addresses) {
              return of(undefined);
            }
            
            const updatedAddresses = userData.addresses.filter((_, i) => i !== index);
            let defaultAddressIndex = userData.defaultAddressIndex;
            
            // Adjust default address index if needed
            if (defaultAddressIndex === index) {
              defaultAddressIndex = updatedAddresses.length > 0 ? 0 : undefined;
            } else if (defaultAddressIndex !== undefined && defaultAddressIndex > index) {
              defaultAddressIndex--;
            }
            
            return from(updateDoc(userRef, { 
              addresses: updatedAddresses,
              defaultAddressIndex
            }));
          })
        );
      })
    );
  }
  
  setDefaultAddress(index: number): Observable<void> {
    return this.authService.user$.pipe(
      take(1),
      switchMap(user => {
        if (!user) return of(undefined);
        
        const userRef = doc(this.firestore, `users/${user.uid}`);
        return from(updateDoc(userRef, { defaultAddressIndex: index }));
      })
    );
  }
  
  getDefaultAddress(): Observable<UserAddress | null> {
    return this.getUserProfile().pipe(
      map(profile => {
        if (!profile || !profile.addresses || profile.addresses.length === 0) {
          return null;
        }
        
        const defaultIndex = profile.defaultAddressIndex !== undefined 
          ? profile.defaultAddressIndex 
          : 0;
          
        return profile.addresses[defaultIndex] || null;
      })
    );
  }
} 