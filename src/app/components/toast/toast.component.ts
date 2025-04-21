import { Component, inject } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div [@toastAnimation]="state" 
         class="toast" 
         [class]="type" 
         [class.top]="position.includes('top')"
         [class.bottom]="position.includes('bottom')"
         [class.center]="position.includes('center')"
         [class.left]="position.includes('left')"
         [class.right]="position.includes('right')">
      <mat-icon>{{icon}}</mat-icon>
      <span class="message">{{message}}</span>
    </div>
  `,
  animations: [
    trigger('toastAnimation', [
      state('void', style({ transform: 'translateX(100%)', opacity: 0 })),
      state('visible', style({ transform: 'translateX(0)', opacity: 1 })),
      transition('void => visible', animate('200ms ease-in')),
      transition('visible => void', animate('200ms ease-out')),
    ])
  ],
  styles: [`
    .toast {
      position: fixed;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      border-radius: 4px;
      color: white;
      max-width: 350px;
      z-index: 1000;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .success { background-color: #4caf50; }
    .error { background-color: #f44336; }
    .info { background-color: #2196f3; }
    .warning { background-color: #ff9800; }

    .top { top: 20px; }
    .bottom { bottom: 20px; }
    .left { left: 20px; }
    .right { right: 20px; }
    .center { 
      left: 50%;
      transform: translateX(-50%) !important;
    }

    .message {
      margin-left: 8px;
    }
  `]
})
export class ToastComponent {
  message = '';
  type = 'info';
  position = 'top right';
  state = 'visible';

  get icon(): string {
    const icons = {
      success: 'check_circle',
      error: 'error',
      info: 'info',
      warning: 'warning'
    };
    return icons[this.type as keyof typeof icons] || 'info';
  }
} 