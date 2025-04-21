import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../auth.service';
import { ToastService } from 'src/app/components/toast/toast.service';
 
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  toast = inject(ToastService);
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { 
      validators: this.passwordMatchValidator 
    });
  }
  
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }
  
  async register() {
    try {
      const result = await this.authService.registerWithEmailPassword(this.registerForm.value);
      if (result) {
        this.router.navigateByUrl('/');
      }
      // // Update the user profile with the first and last name
      // await updateProfile(result.user, {
      //   displayName: `${firstName} ${lastName}`
      // });
      // return result.user;
    } catch (error) {
      if (error instanceof Error) {
        this.toast.error(error.message, {
          position: 'top-center'
        });
      }
      // console.error('Registration failed:', error);
      
      throw error;
    }
  }
}
