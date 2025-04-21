import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, from, of, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { collection, doc, docData, Firestore, getDocs, query, setDoc, where } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile, User } from '@angular/fire/auth';
import { authState } from 'rxfire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>; // Observable for the current user

  private firestore = inject(Firestore);
  private auth: Auth = inject(Auth);
  route = inject(ActivatedRoute)
  constructor() {
    this.user$ = authState(this.auth);
  }

  async signInWithGoogle(): Promise<unknown> {
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(this.auth, provider);
      if (credential.user) {
        await this.checkAndAddUser(credential.user);
      }
      return credential;
      // this.auth.config.authDomain = 'https://fanscanvas.page.link/6SuK';
    } catch (error) {
      return Promise.reject(error);
    }
  }

  private async checkAndAddUser(user: Partial<User>) {
    return new Promise((resolve, reject) => {
      const userRef = doc(this.firestore, `users/${user.uid}`);
      docData(userRef, { idField: 'id' }).subscribe(async (userDoc) => {
        if (!userDoc?.['id']) {
          const res = await setDoc(userRef, {
            uid: user.uid,
            isAnonymous: false,
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            joinedOn: new Date()
          });
        }
        resolve(user);
      }, (err) => {
        console.error('Error adding user:', err);
        reject(err);
      })
    });
  }


  async loginWithEmailPassword(email: string, password: string) {
    try {
      // if (!await this.checkIfUserExists(email)) {
      //   return Promise.reject(new Error('User do not exists'));
      // }
      debugger;
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      return credential.user;
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  }

  async registerWithEmailPassword({ email, password, firstName, lastName }: { email: string, password: string, firstName: string, lastName: string }) {
    try {
      if (await this.checkIfUserExists(email)) {
        return Promise.reject(new Error('User already exists'));
      }
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      await updateProfile(result.user, { displayName: `${firstName} ${lastName}`, photoURL: '' });
      return await this.checkAndAddUser({ ...result.user, displayName: `${firstName} ${lastName}`, photoURL: '' });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  private async checkIfUserExists(email: string): Promise<boolean> {
    try {
      const usersRef = collection(this.firestore, 'users'); // Reference to the users collection
      const q = query(usersRef, where('email', '==', email)); // Query Firestore for the given email
      const querySnapshot = await getDocs(q);

      return !querySnapshot.empty; // If querySnapshot is not empty, user exists
    } catch (error) {
      console.error('Error checking user:', error);
      return false;
    }
  }


  // ✅ Logout
  // async logout() {
  //   try {
  //     await signOut(this.auth);
  //     console.log('User logged out');
  //   } catch (error) {
  //     console.error('Logout Error:', error);
  //   }
  // }

  // ✅ Logout
  async logout() {
    try {
      await signOut(this.auth);
      console.log('User logged out');
    } catch (error) {
      console.error('Logout Error:', error);
    }
  }
} 