import { inject } from '@angular/core';
import { CanActivateFn, GuardResult, MaybeAsync, Router } from '@angular/router';
  
// Public guard - prevents authenticated users from accessing routes like login/register
// export const publicGuard: CanActivateFn = () => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   return authService.user$.pipe(
//     map(user => {
//       // If user is already logged in, redirect to home
//       if (user) {
//         router.navigate(['/']);
//         return false;
//       }
//       // Allow access if not logged in
//       return true;
//     })
//   );
// }; 
import { Auth, User } from '@angular/fire/auth';
import { map, Observable } from 'rxjs';

export const publicGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return new Observable<boolean>(observer => {
    auth.onAuthStateChanged((user: User | null) => {
      observer.next(!user); // Allow access only if user is NOT logged in
      observer.complete();
    });
  }).pipe(
    map(isGuest => isGuest || router.navigateByUrl('/homepage'))
  ) as MaybeAsync<GuardResult>;
};