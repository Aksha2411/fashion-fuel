import { Injectable, inject } from '@angular/core';
import { ComponentRef, createComponent } from '@angular/core';
import { ApplicationRef, EnvironmentInjector } from '@angular/core';
import { ToastComponent } from './toast.component';
import { DOCUMENT } from '@angular/common';

export type ToastPosition = 'top-left' | 'top-center' | 'top-right' |
  'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ToastConfig {
  duration?: number;
  position?: ToastPosition;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);
  private _document = inject(DOCUMENT);
  private _window = this._document.defaultView;
  private defaultConfig: ToastConfig = {
    duration: 3000,
    position: 'top-right'
  };

  private show(message: string, type: string, config?: ToastConfig) {
    const mergedConfig = { ...this.defaultConfig, ...config };
    const toastComponentRef = this.createToast();

    toastComponentRef.instance.message = message;
    toastComponentRef.instance.type = type;
    toastComponentRef.instance.position = mergedConfig.position!.replace('-', ' ');

    this._window?.setTimeout(() => {
      toastComponentRef.instance.state = 'void';
      this._window?.setTimeout(() => this.destroyToast(toastComponentRef), 200);
    }, mergedConfig.duration);
  }

  private createToast(): ComponentRef<ToastComponent> {
    const toastComponentRef = createComponent(ToastComponent, {
      environmentInjector: this.injector
    });
    this._document.body.appendChild(toastComponentRef.location.nativeElement);
    this.appRef.attachView(toastComponentRef.hostView);
    return toastComponentRef;
  }

  private destroyToast(toastComponentRef: ComponentRef<ToastComponent>) {
    this.appRef.detachView(toastComponentRef.hostView);
    toastComponentRef.destroy();
  }

  success(message: string, config?: ToastConfig) {
    this.show(message, 'success', config);
  }

  error(message: string, config?: ToastConfig) {
    this.show(message, 'error', config);
  }

  info(message: string, config?: ToastConfig) {
    this.show(message, 'info', config);
  }

  warning(message: string, config?: ToastConfig) {
    this.show(message, 'warning', config);
  }
} 