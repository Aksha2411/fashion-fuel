import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .auth-container {
      max-width: 500px;
      margin: 40px auto;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      background-color: white;
    }
  `]
})
export class AuthComponent {
  constructor() {}
} 