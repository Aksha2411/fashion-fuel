import { Route, Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

export const AUTH_ROUTES:  Array<Route> = [
  {
    path: "",
        loadComponent: () => import('./auth.component').then((m) => m.AuthComponent),
        children: [
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full'
            },
            {
                path: 'login',
                loadComponent: () => import('./login/login.component').then((m => m.LoginComponent))
            },
            {
                path: 'register',
                loadComponent: () => import('./register/register.component').then((m => m.RegisterComponent))
            }
        ]
  }
]; 