import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
 import { AuthService } from '../auth.service';
import { ToastService } from 'src/app/components/toast/toast.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    MatCardModule,
    MatIconModule,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    NgIf
  ],
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);
  toast = inject(ToastService);
  _fb = inject(FormBuilder);
  loginForm = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  loading = false;

  
  async loginWithEmailPassword() {
    if (this.loginForm.valid) {
      this.loading = true;
      try {
        // const { email, password } = this.loginForm.value;
        const email = this.loginForm.get('email')?.value || '';
      const password = this.loginForm.get('password')?.value || '';
        const res = await this.authService.loginWithEmailPassword(email, password);
        if (res) {
          this.toast.success('Successfully logged in', {
            position: 'top-center'
          });
          this.router.navigateByUrl('/');
        }
      } catch (error) {
        if (error instanceof Error) {
          this.toast.error(error.message);
        } else {
          this.toast.error('Login failed. Please check your credentials.');
        }
      }
    } else {
      this.toast.warning('Please fill in all required fields correctly.');
    }
    this.loading = false;
  }


  async loginWithGoogle() {
    try {
      this.loading = true;
      const res = await this.authService.signInWithGoogle();
      if (res) {
        this.toast.success('Successfully logged in with Google', {
          position: 'top-center'
        });
        this.router.navigateByUrl('/');
      }
    } catch (error) {
      this.toast.error('Failed to login with Google. Please try again.');
    }
    this.loading = false;
  }

}