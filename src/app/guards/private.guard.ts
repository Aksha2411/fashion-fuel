import { inject } from '@angular/core';
import { CanActivateFn, GuardResult, MaybeAsync, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { User } from 'firebase/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const privateGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return new Observable<boolean>(observer => {
    auth.onAuthStateChanged((user: User | null) => {
      observer.next(!!user);
      observer.complete();
    });
  }).pipe(
    map(userExists => userExists || router.navigateByUrl('/auth/login'))
  ) as MaybeAsync<GuardResult>;
};