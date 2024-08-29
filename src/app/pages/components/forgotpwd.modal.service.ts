import { Injectable } from '@angular/core';
import * as bootstrap from 'bootstrap';

@Injectable({
  providedIn: 'root'
})
export class ForgotPwdModalService {
  openForgotPasswordModal(): void {
    const modalElement = document.getElementById('forgotPasswordModal')!;
    const modalOptions: bootstrap.Modal.Options = {
      backdrop: 'static',
      keyboard: false,
      focus: false
    };
    new bootstrap.Modal(modalElement, modalOptions).show();
  }
}
